import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import api from '../services/apiClient';
import {cancelDoseReminderNotification} from '../services/notificationService';

type MedicineDetail = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  stock: number;
  nextDose: string | null;
  color: string;
  category: string;
  instructions: string;
  isActive: boolean;
};

type ScheduleItem = {
  id?: string;
  time: string;
  status: string;
  date: string;
};

type HistoryItem = {
  id?: string;
  date: string;
  time: string;
  status: string;
  onTime: boolean;
};

const frequencyLabels: Record<string, string> = {
  once: 'Once daily',
  twice: 'Twice daily',
  thrice: 'Thrice daily',
  four: '4 times daily',
};

const mapMedicine = (medicine: any, fallback: any): MedicineDetail => ({
  id: medicine?._id || medicine?.id || fallback?.id || fallback?._id,
  name: medicine?.name || fallback?.name || '',
  dosage: medicine?.dosage || fallback?.dosage || '',
  frequency:
    frequencyLabels[medicine?.frequency || fallback?.frequency] ||
    medicine?.frequency ||
    fallback?.frequency ||
    'Once daily',
  stock: Number(medicine?.stock ?? fallback?.stock ?? 0),
  nextDose: medicine?.nextDose || fallback?.nextDose || null,
  color: medicine?.color || fallback?.color || '#74BA1E',
  category: medicine?.category || fallback?.category || 'Medicine',
  instructions:
    medicine?.instructions ||
    fallback?.instructions ||
    'No instructions provided.',
  isActive: medicine?.isActive ?? fallback?.isActive ?? true,
});

const mapHistoryItem = (item: any): HistoryItem => ({
  ...item,
  id: item?._id || item?.id || item?.doseId,
  status: String(item?.status || '').toLowerCase(),
  onTime: Boolean(item?.onTime),
});

const MedicineDetailScreen = ({navigation, route}: any) => {
  const routeMedicine = route.params?.medicine;
  const medicineId = routeMedicine?.id || routeMedicine?._id;
  const [medicine, setMedicine] = useState<MedicineDetail | null>(
    routeMedicine ? mapMedicine(routeMedicine, routeMedicine) : null,
  );
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [markingHistoryDoseId, setMarkingHistoryDoseId] = useState<string | null>(
    null,
  );

  const loadMedicineDetails = useCallback(async (showLoading = true) => {
    if (!medicineId) {
      setLoading(false);
      setMedicine(null);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError('');

      const response = await api.get(`/medicines/${medicineId}/details`);

      setMedicine(mapMedicine(response.data?.medicine, routeMedicine));
      setSchedule(
        Array.isArray(response.data?.schedule) ? response.data.schedule : [],
      );
      setHistory(
        Array.isArray(response.data?.history)
          ? response.data.history.map(mapHistoryItem)
          : [],
      );
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to load medicine details',
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [medicineId, routeMedicine]);

  useEffect(() => {
    loadMedicineDetails();
  }, [loadMedicineDetails]);

  const handleUpdateStatus = async () => {
    if (!medicine?.id) {
      return;
    }

    try {
      setUpdating(true);

      const response = await api.put(`/medicines/${medicine.id}`, {
        isActive: !medicine.isActive,
      });

      setMedicine(previous =>
        previous
          ? mapMedicine(response.data?.medicine, {
              ...previous,
              isActive: !previous.isActive,
            })
          : previous,
      );
    } catch (updateError: any) {
      Alert.alert(
        'Error',
        updateError?.response?.data?.message ||
          updateError?.message ||
          'Unable to update medicine',
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkHistoryTaken = async (doseId?: string) => {
    if (!doseId) {
      return;
    }

    try {
      setMarkingHistoryDoseId(doseId);
      await api.post(`/doses/${doseId}/taken`);
      await cancelDoseReminderNotification(doseId);
      await loadMedicineDetails(false);
    } catch (markError: any) {
      Alert.alert(
        'Error',
        markError?.response?.data?.message ||
          markError?.message ||
          'Unable to mark dose as taken',
      );
    } finally {
      setMarkingHistoryDoseId(null);
    }
  };

  const handleDelete = () => {
    if (!medicine?.id) {
      return;
    }

    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to delete ${medicine.name}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await api.delete(`/medicines/${medicine.id}`);
              navigation.goBack();
            } catch (deleteError: any) {
              Alert.alert(
                'Error',
                deleteError?.response?.data?.message ||
                  deleteError?.message ||
                  'Unable to delete medicine',
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color="#74BA1E" />
        <Text style={styles.stateText}>Loading medicine details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateContainer}>
        <Icon name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.emptyText}>Could not load medicine</Text>
        <Text style={styles.emptySubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMedicineDetails}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!medicine) {
    return (
      <View style={styles.stateContainer}>
        <Icon name="pill-off" size={64} color="#E5E7EB" />
        <Text style={styles.emptyText}>Medicine not found</Text>
        <Text style={styles.emptySubtext}>
          Go back and select a medicine again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[medicine.color, `${medicine.color}DD`]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Icon name="pill" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.medicineDosage}>{medicine.dosage}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{medicine.category}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Icon name="clock-outline" size={24} color="#74BA1E" />
            <Text style={styles.infoLabel}>Frequency</Text>
            <Text style={styles.infoValue}>{medicine.frequency}</Text>
          </View>
          <View style={styles.infoCard}>
            <Icon name="package-variant" size={24} color="#3B82F6" />
            <Text style={styles.infoLabel}>Stock</Text>
            <Text style={styles.infoValue}>{medicine.stock} left</Text>
          </View>
          <View style={styles.infoCard}>
            <Icon name="bell-outline" size={24} color="#F59E0B" />
            <Text style={styles.infoLabel}>Next Dose</Text>
            <Text style={styles.infoValue}>
              {medicine.nextDose || 'No reminder'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
          {schedule.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>No upcoming doses</Text>
            </View>
          ) : (
            schedule.map((item, index) => (
              <View key={item.id || index} style={styles.scheduleItem}>
                <View
                  style={[
                    styles.scheduleIcon,
                    {
                      backgroundColor:
                        item.status === 'taken'
                          ? '#DCFCE7'
                          : item.status === 'upcoming'
                          ? '#FEF3C7'
                          : '#F3F4F6',
                    },
                  ]}>
                  <Icon
                    name={
                      item.status === 'taken'
                        ? 'check-circle'
                        : item.status === 'upcoming'
                        ? 'clock'
                        : 'calendar'
                    }
                    size={24}
                    color={
                      item.status === 'taken'
                        ? '#10B981'
                        : item.status === 'upcoming'
                        ? '#F59E0B'
                        : '#9CA3AF'
                    }
                  />
                </View>
                <View style={styles.scheduleContent}>
                  <Text style={styles.scheduleTime}>{item.time}</Text>
                  <Text style={styles.scheduleDate}>{item.date}</Text>
                </View>
                {item.status === 'taken' && (
                  <Icon name="check" size={24} color="#10B981" />
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>
          {history.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>No dose history yet</Text>
            </View>
          ) : (
            history.map((item, index) => {
              const canMarkTaken =
                item.status === 'missed' ||
                (item.status !== 'taken' && item.onTime === false);
              const isMarking = markingHistoryDoseId === item.id;

              return (
                <View key={item.id || index} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View
                      style={[
                        styles.historyDot,
                        {
                          backgroundColor:
                            item.status === 'taken' ? '#74BA1E' : '#EF4444',
                        },
                      ]}
                    />
                    <View style={styles.historyContent}>
                      <Text style={styles.historyDate}>{item.date}</Text>
                      <Text style={styles.historyTime}>{item.time}</Text>
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    {item.status === 'taken' ? (
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: item.onTime
                              ? '#DCFCE7'
                              : '#FEF3C7',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color: item.onTime ? '#10B981' : '#F59E0B',
                            },
                          ]}>
                          {item.onTime ? 'On Time' : 'Late'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.historyActionColumn}>
                        <View
                          style={[
                            styles.statusBadge,
                            {backgroundColor: '#FEE2E2'},
                          ]}>
                          <Text style={[styles.statusText, {color: '#EF4444'}]}>
                            Missed
                          </Text>
                        </View>
                        {canMarkTaken && (
                          <TouchableOpacity
                            style={[
                              styles.markTakenButton,
                              (!item.id || isMarking) && styles.disabledButton,
                            ]}
                            onPress={() => handleMarkHistoryTaken(item.id)}
                            disabled={!item.id || isMarking}>
                            {isMarking ? (
                              <ActivityIndicator size="small" color="#000000" />
                            ) : (
                              <Text style={styles.markTakenButtonText}>
                                {item.id ? 'Mark as Taken' : 'No dose ID'}
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionCard}>
            <Icon name="information-outline" size={24} color="#3B82F6" />
            <Text style={styles.instructionText}>{medicine.instructions}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.editButton, updating && styles.disabledButton]}
            onPress={handleUpdateStatus}
            disabled={updating || deleting}>
            {updating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="pencil" size={20} color="#FFFFFF" />
                <Text style={styles.editButtonText}>
                  {medicine.isActive ? 'Deactivate' : 'Activate'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.disabledButton]}
            onPress={handleDelete}
            disabled={updating || deleting}>
            {deleting ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <Icon name="delete" size={20} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  stateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#74BA1E',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicineName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  medicineDosage: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  scheduleDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  historyRight: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyActionColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  markTakenButton: {
    backgroundColor: '#74BA1E',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 32,
    minWidth: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markTakenButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#74BA1E',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default MedicineDetailScreen;
