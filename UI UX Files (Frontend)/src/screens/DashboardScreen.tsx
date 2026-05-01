import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {format, differenceInSeconds} from 'date-fns';
import api from '../services/apiClient';
import {cancelDoseReminderNotification} from '../services/notificationService';

type DashboardStats = {
  medicines: number;
  adherence: number;
  today: number;
};

type DoseItem = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: string;
  scheduledAt?: Date;
};

type MedicineHistoryItem = {
  id: string;
  name: string;
  dosage: string;
  dateAdded: string;
  status: string;
};

type DashboardSnapshot = {
  stats: DashboardStats;
  nextDose: DoseItem | null;
  todaySchedule: DoseItem[];
};

const getDoseMedicine = (dose: any) => {
  const medicine = dose?.medicine;

  return {
    name: medicine?.name || 'Medicine',
    dosage: medicine?.dosage || '',
  };
};

const mapDose = (dose: any): DoseItem => {
  const scheduledAt = dose?.scheduledAt ? new Date(dose.scheduledAt) : undefined;
  const medicine = getDoseMedicine(dose);
  const isUpcoming =
    dose?.status === 'pending' && scheduledAt && scheduledAt > new Date();

  return {
    id: dose?._id || dose?.id || `${medicine.name}-${dose?.scheduledAt || ''}`,
    name: medicine.name,
    dosage: medicine.dosage,
    time: scheduledAt ? format(scheduledAt, 'hh:mm a') : '--',
    status: isUpcoming ? 'upcoming' : dose?.status || 'pending',
    scheduledAt,
  };
};

const calculateTodayStatsFallback = (
  backendStats: DashboardStats,
  schedule: DoseItem[],
): DashboardStats => {
  const totalDosesToday = schedule.length;
  const takenDosesToday = schedule.filter(item => item.status === 'taken').length;

  return {
    ...backendStats,
    adherence:
      totalDosesToday === 0
        ? 0
        : Math.round((takenDosesToday / totalDosesToday) * 100),
    today: backendStats.today || totalDosesToday,
  };
};

const DashboardScreen = ({navigation}: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statsData, setStatsData] = useState<DashboardStats>({
    medicines: 0,
    adherence: 0,
    today: 0,
  });
  const [nextDose, setNextDose] = useState<DoseItem | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<DoseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [markingDoseId, setMarkingDoseId] = useState<string | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [medicineHistory, setMedicineHistory] = useState<MedicineHistoryItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const loadUnreadNotificationCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      const notifications = Array.isArray(response.data?.notifications)
        ? response.data.notifications
        : [];

      setUnreadNotificationCount(notifications.length);
    } catch {
      setUnreadNotificationCount(0);
    }
  }, []);

  const loadDashboard = useCallback(async (
    showRefresh = false,
  ): Promise<DashboardSnapshot | null> => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const response = await api.get('/dashboard');

      const nextStats = {
        medicines: Number(response.data?.stats?.medicines || 0),
        adherence: Number(response.data?.stats?.adherence || 0),
        today: Number(response.data?.stats?.today || 0),
      };
      const nextDoseValue = response.data?.nextDose
        ? mapDose(response.data.nextDose)
        : null;
      const nextSchedule =
        Array.isArray(response.data?.todaySchedule)
          ? response.data.todaySchedule.map(mapDose)
          : [];

      setStatsData(nextStats);
      setNextDose(nextDoseValue);
      setTodaySchedule(nextSchedule);
      await loadUnreadNotificationCount();

      return {
        stats: nextStats,
        nextDose: nextDoseValue,
        todaySchedule: nextSchedule,
      };
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to load dashboard',
      );
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadUnreadNotificationCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!nextDose?.scheduledAt) {
      setTimeRemaining('No upcoming dose');
      return;
    }

    const calculateTimeRemaining = () => {
      const seconds = differenceInSeconds(nextDose.scheduledAt as Date, new Date());

      if (seconds <= 0) {
        setTimeRemaining('Due now!');
        return;
      }

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${secs}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${secs}s`);
      } else {
        setTimeRemaining(`${secs}s`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [nextDose]);

  useEffect(() => {
    loadDashboard();

    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboard();
    });

    return unsubscribe;
  }, [loadDashboard, navigation]);

  const onRefresh = () => loadDashboard(true);

  const handleMarkTaken = async (doseId: string) => {
    try {
      const previousStats = statsData;
      setMarkingDoseId(doseId);
      await api.post(`/doses/${doseId}/taken`);
      await cancelDoseReminderNotification(doseId);
      const updatedDashboard = await loadDashboard(true);

      if (updatedDashboard) {
        let updatedStats = updatedDashboard.stats;
        const shouldUseFrontendAdherence =
          updatedDashboard.todaySchedule.length > 0 &&
          updatedDashboard.stats.adherence === previousStats.adherence;

        if (shouldUseFrontendAdherence) {
          updatedStats = calculateTodayStatsFallback(
            updatedDashboard.stats,
            updatedDashboard.todaySchedule,
          );
          setStatsData(updatedStats);
        }

        console.log('Updated dashboard stats after marking taken:', updatedStats);
      }
    } catch (requestError: any) {
      Alert.alert(
        'Error',
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to mark dose as taken',
      );
    } finally {
      setMarkingDoseId(null);
    }
  };

  const openHistory = async () => {
    try {
      setHistoryVisible(true);
      setHistoryLoading(true);
      setHistoryError('');

      const response = await api.get('/medicines');
      const medicines = Array.isArray(response.data) ? response.data : [];

      setMedicineHistory(
        medicines.map((medicine: any) => ({
          id: medicine._id || medicine.id || `${medicine.name}-${medicine.createdAt}`,
          name: medicine.name || 'Medicine',
          dosage: medicine.dosage || '',
          dateAdded: medicine.createdAt
            ? format(new Date(medicine.createdAt), 'MMM d, yyyy')
            : 'Date not available',
          status:
            medicine.status ||
            (medicine.isActive === false ? 'Inactive' : 'Active'),
        })),
      );
    } catch (requestError: any) {
      setHistoryError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to load medicine history',
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const stats = [
    {
      icon: 'pill',
      label: 'Medicines',
      value: String(statsData.medicines),
      color: '#74BA1E',
    },
    {
      icon: 'calendar-check',
      label: 'Adherence',
      value: `${statsData.adherence}%`,
      color: '#3B82F6',
    },
    {
      icon: 'clock-alert',
      label: 'Today',
      value: String(statsData.today),
      color: '#F59E0B',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#74BA1E']}
        />
      }>
      <LinearGradient colors={['#74BA1E', '#5A9618']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.userName}>Welcome back!</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              unreadNotificationCount > 0 && styles.notificationButtonActive,
            ]}
            onPress={() => navigation.navigate('Notifications')}>
            <Icon name="bell" size={24} color="#FFFFFF" />
            {unreadNotificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.currentTime}>
          {format(currentTime, 'EEEE, MMMM d, yyyy - hh:mm:ss a')}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {loading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#74BA1E" />
            <Text style={styles.stateText}>Loading dashboard...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.emptyState}>
            <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.emptyText}>Could not load dashboard</Text>
            <Text style={styles.emptySubtext}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadDashboard()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && (
          <>
            <View style={styles.nextDoseCard}>
              <View style={styles.nextDoseHeader}>
                <Icon name="clock-alert" size={24} color="#74BA1E" />
                <Text style={styles.nextDoseTitle}>Next Dose</Text>
              </View>
              <Text style={styles.medicineName}>
                {nextDose
                  ? `${nextDose.name} ${nextDose.dosage}`.trim()
                  : 'No upcoming dose'}
              </Text>
              <Text style={styles.doseTime}>{nextDose?.time || '--'}</Text>
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownLabel}>Time Remaining:</Text>
                <Text style={styles.countdownTime}>{timeRemaining}</Text>
              </View>
              {nextDose && (
                <TouchableOpacity
                  style={[
                    styles.markTakenButton,
                    markingDoseId === nextDose.id && styles.markTakenButtonDisabled,
                  ]}
                  onPress={() => handleMarkTaken(nextDose.id)}
                  disabled={markingDoseId === nextDose.id}>
                  <Text style={styles.markTakenText}>Mark as Taken</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View
                    style={[
                      styles.statIconContainer,
                      {backgroundColor: `${stat.color}15`},
                    ]}>
                    <Icon name={stat.icon} size={24} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Schedule</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Medicines')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>

              {todaySchedule.length === 0 ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>
                    No doses scheduled today
                  </Text>
                </View>
              ) : (
                todaySchedule.map(item => (
                  <View key={item.id} style={styles.scheduleItem}>
                    <View
                      style={[
                        styles.scheduleIndicator,
                        {
                          backgroundColor:
                            item.status === 'taken'
                              ? '#74BA1E'
                              : item.status === 'upcoming'
                              ? '#F59E0B'
                              : '#E5E7EB',
                        },
                      ]}
                    />
                    <View style={styles.scheduleContent}>
                      <Text style={styles.scheduleMedicine}>{item.name}</Text>
                      <Text style={styles.scheduleDosage}>{item.dosage}</Text>
                    </View>
                    <View style={styles.scheduleRight}>
                      <Text style={styles.scheduleTime}>{item.time}</Text>
                      {item.status === 'taken' && (
                        <Icon name="check-circle" size={20} color="#74BA1E" />
                      )}
                      {item.status === 'upcoming' && (
                        <Icon name="clock" size={20} color="#F59E0B" />
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('AddMedicine')}>
                  <Icon name="plus-circle" size={28} color="#74BA1E" />
                  <Text style={styles.actionText}>Add Medicine</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('ScanMedicine')}>
                  <Icon name="camera" size={28} color="#74BA1E" />
                  <Text style={styles.actionText}>Scan Wrapper</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={openHistory}>
                  <Icon name="history" size={28} color="#74BA1E" />
                  <Text style={styles.actionText}>History</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>

      <Modal
        visible={historyVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHistoryVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.historyModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Medicine History</Text>
              <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {historyLoading && (
              <View style={styles.modalState}>
                <ActivityIndicator size="large" color="#74BA1E" />
                <Text style={styles.stateText}>Loading history...</Text>
              </View>
            )}

            {!historyLoading && !!historyError && (
              <View style={styles.modalState}>
                <Icon name="alert-circle-outline" size={48} color="#EF4444" />
                <Text style={styles.emptyText}>Could not load history</Text>
                <Text style={styles.emptySubtext}>{historyError}</Text>
              </View>
            )}

            {!historyLoading && !historyError && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {medicineHistory.length === 0 ? (
                  <View style={styles.modalState}>
                    <Text style={styles.emptySectionText}>
                      No medicines added yet
                    </Text>
                  </View>
                ) : (
                  medicineHistory.map(item => (
                    <View key={item.id} style={styles.historyItem}>
                      <View style={styles.historyIcon}>
                        <Icon name="pill" size={22} color="#74BA1E" />
                      </View>
                      <View style={styles.historyContent}>
                        <Text style={styles.historyName}>{item.name}</Text>
                        <Text style={styles.historyDosage}>{item.dosage}</Text>
                        <Text style={styles.historyDate}>{item.dateAdded}</Text>
                      </View>
                      <Text style={styles.historyStatus}>{item.status}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  currentTime: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.85,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  stateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  nextDoseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextDoseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  nextDoseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  medicineName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  doseTime: {
    fontSize: 18,
    color: '#74BA1E',
    fontWeight: '600',
    marginBottom: 16,
  },
  countdownContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  countdownLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  countdownTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#74BA1E',
  },
  markTakenButton: {
    backgroundColor: '#74BA1E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  markTakenButtonDisabled: {
    opacity: 0.6,
  },
  markTakenText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
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
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAll: {
    fontSize: 14,
    color: '#74BA1E',
    fontWeight: '600',
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
  scheduleIndicator: {
    width: 4,
    height: 48,
    borderRadius: 2,
    marginRight: 16,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleMedicine: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  scheduleDosage: {
    fontSize: 14,
    color: '#6B7280',
  },
  scheduleRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  historyModal: {
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  historyDosage: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#74BA1E',
  },
});

export default DashboardScreen;
