/**
 * JWT helper utilities
 * - decodeToken(token): returns payload object or null
 * - getTokenExpiry(token): returns { exp, expDate, secondsRemaining }
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    // Some environments may not have global atob; try Buffer fallback
    let json = decoded;
    try {
      return JSON.parse(json);
    } catch (e) {
      // Fallback: use Buffer (Node env)
      try {
        const buf = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
        return JSON.parse(buf.toString('utf8'));
      } catch (e2) {
        return null;
      }
    }
  } catch (error) {
    return null;
  }
};

export const getTokenExpiry = (token) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  const exp = payload.exp || null;
  if (!exp) return null;

  // exp is typically seconds since epoch
  const expDate = new Date(exp * 1000);
  const secondsRemaining = Math.max(0, Math.floor((expDate.getTime() - Date.now()) / 1000));

  return {
    exp,
    expDate,
    secondsRemaining,
  };
};

export default {
  decodeToken,
  getTokenExpiry,
};
