import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, FAB, Button } from 'react-native-paper';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';
import { getDraftCases, loadCase, syncCase } from '../services/caseStorageService';
import { useFocusEffect } from '@react-navigation/native';
import CasePreviewModal from '../components/CasePreviewModal';
import NetInfo from '@react-native-community/netinfo';

export default function UnsubmittedCasesScreen() {
  const [draftCases, setDraftCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const formatDraftCase = (caseObj) => {
    const applicantName =
      caseObj.applicant_name ||
      caseObj.applicant?.name ||
      caseObj.customer_name ||
      caseObj.name ||
      '';
    const residenceAddress = caseObj.residence_colony_details
      ? `${caseObj.residence_house_no || ''} ${caseObj.residence_colony_details}, ${caseObj.residence_city || ''}`.trim()
      : '';
    const businessAddress = caseObj.business_colony_details
      ? `${caseObj.business_house_number || ''} ${caseObj.business_colony_details}, ${caseObj.business_city || ''}`.trim()
      : '';
    const address = businessAddress || residenceAddress || 'Address not available';

    const submittedDate = caseObj.updated_at || caseObj.created_at;
    const dateTime = submittedDate
      ? new Date(submittedDate).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Date not available';

    const productName = caseObj.product?.name || caseObj.custom_name || caseObj.bank_product_name || 'N/A';
    const bankName = caseObj.bank?.name || caseObj.bank_name || 'Unknown Bank';

    return {
      id: caseObj.id || caseObj.case_id || String(Math.random()),
      fullTitle: `${bankName} ${productName}`.trim(),
      subtitle: `Fl Type : ${caseObj.fl_type?.toUpperCase() || 'N/A'}`,
      applicantName,
      status: 'Drafted',
      address,
      dateTime,
    };
  };

  const loadDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const drafts = await getDraftCases();
      const formatted = await Promise.all(
        drafts.map(async (draft) => {
          const caseId = draft.id || draft.case_id;
          const localCase = caseId ? await loadCase(caseId) : null;
          const metadata = localCase?.metadata || draft;
          const formData = localCase?.formData || {};
          let images = [];
          try {
            const sourceImages = Array.isArray(localCase?.images) ? localCase.images : [];
            images = sourceImages.map((img) => ({
              ...img,
              uri: img.uri,
              path: img.filePath,
            }));
          } catch (error) {
            images = [];
          }
          const raw = {
            ...metadata,
            ...formData,
            status: 'Drafted',
            updated_at: metadata.last_saved || metadata.updated_at,
            files: images,
          };
          return {
            ...formatDraftCase(raw),
            raw,
          };
        }),
      );
      setDraftCases(formatted);
    } catch (error) {
      console.error('Failed to load drafts:', error);
      setDraftCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  useFocusEffect(
    useCallback(() => {
      loadDrafts();
    }, [loadDrafts]),
  );

  const handleSyncAll = async () => {
    try {
      const networkState = await NetInfo.fetch();
      const hasInternet = !!networkState?.isConnected && networkState?.isInternetReachable !== false;
      if (!hasInternet) {
        console.warn('No internet connection. Sync skipped.');
        return;
      }
      setSyncing(true);
      for (const draft of draftCases) {
        const caseId = draft?.raw?.id || draft?.raw?.case_id || draft?.id;
        if (!caseId) {
          continue;
        }
        try {
          await syncCase(caseId);
        } catch (error) {
          console.warn('Failed to sync draft:', caseId, error);
        }
      }
      await loadDrafts();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AppLayout>
      <AppHeader 
        title="Unsubmitted Cases" 
      />
      <View style={styles.actionRow}>
        <Button
          mode="contained"
          icon="cloud-upload"
          onPress={handleSyncAll}
          loading={syncing}
          disabled={syncing || loading || draftCases.length === 0}
          style={styles.syncButton}
          contentStyle={styles.syncButtonContent}
        >
          Sync All
        </Button>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator style={styles.loader} animating color={AppTheme.colors.primary} size="large" />
        ) : draftCases.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No drafts available</Text>
            <Text style={styles.emptySubtitle}>Drafted cases saved offline will appear here.</Text>
          </View>
        ) : (
          draftCases.map((caseData) => (
            <TouchableOpacity
              key={caseData.id}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedCase(caseData);
                setPreviewVisible(true);
              }}
            >
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.headerRow}>
                    <Text style={styles.title}>{caseData.fullTitle || caseData.title}</Text>
                    <View style={styles.statusContainer}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>{caseData.status}</Text>
                    </View>
                  </View>

                  {caseData.applicantName ? (
                    <Text style={styles.applicantText} numberOfLines={1}>
                      Applicant: {caseData.applicantName}
                    </Text>
                  ) : null}

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      FL Type: {caseData.subtitle?.split(':')[1]?.trim() || 'N/A'}
                    </Text>
                    <Text style={styles.dateText}>{caseData.dateTime}</Text>
                  </View>

                  <Text style={styles.addressText} numberOfLines={2}>
                    {caseData.address}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={loadDrafts}
        loading={loading}
        disabled={loading}
        color="white"
      />
      <CasePreviewModal
        visible={previewVisible}
        caseItem={selectedCase}
        onClose={() => setPreviewVisible(false)}
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: AppTheme.spacing.s,
    paddingBottom: AppTheme.spacing.xxl,
    paddingTop: AppTheme.spacing.sm,
    flexGrow: 1,
  },
  actionRow: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingTop: AppTheme.spacing.sm,
    paddingBottom: AppTheme.spacing.xs,
    alignItems: 'flex-end',
    backgroundColor: AppTheme.colors.surface,
  },
  syncButton: {
    borderRadius: 6,
  },
  syncButtonContent: {
    paddingHorizontal: AppTheme.spacing.md,
  },
  loader: {
    marginTop: AppTheme.spacing.xl,
  },
  card: {
    width: '100%',
    borderRadius: AppTheme.roundness,
    elevation: 1,
    marginBottom: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.surface,
  },
  cardContent: {
    paddingVertical: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: AppTheme.spacing.xs,
  },
  title: {
    fontSize: AppTheme.typography.h4.fontSize,
    fontWeight: '700',
    color: AppTheme.colors.primary,
    flex: 1,
    marginRight: AppTheme.spacing.sm,
    marginBottom: 0,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppTheme.colors.primary,
    marginRight: AppTheme.spacing.xs,
  },
  statusText: {
    fontSize: AppTheme.typography.caption.fontSize,
    color: AppTheme.colors.primary,
    fontWeight: '500',
  },
  applicantText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
    fontWeight: '600',
    marginBottom: AppTheme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: AppTheme.spacing.xs,
  },
  metaText: {
    fontSize: AppTheme.typography.caption.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
  },
  dateText: {
    fontSize: AppTheme.typography.caption.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
  },
  addressText: {
    fontSize: AppTheme.typography.caption.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    lineHeight: AppTheme.typography.body.lineHeight,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: AppTheme.spacing.lg,
  },
  emptyTitle: {
    fontSize: AppTheme.typography.h3.fontSize,
    fontWeight: AppTheme.typography.h3.fontWeight,
    color: AppTheme.colors.onSurface,
    marginBottom: AppTheme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    margin: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.primary,
  },
});
