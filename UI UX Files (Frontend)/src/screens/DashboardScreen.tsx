import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { format, addHours, differenceInSeconds } from 'date-fns';

const DashboardScreen = ({navigation}: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextDose, setNextDose] = useState<Date>(addHours(new Date(), 2));
  const [timeRemaining, setTimeRemaining] = useState('');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate time remaining for next dose
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const seconds = differenceInSeconds(nextDose, now);

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

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const todaySchedule = [
    {
      id: '1',
      name: 'Paracetamol',
      dosage: '500mg',
      time: '09:00 AM',
      status: 'taken',
    },
    {
      id: '2',
      name: 'Vitamin D',
      dosage: '1000 IU',
      time: '01:00 PM',
      status: 'taken',
    },
    {
      id: '3',
      name: 'Amoxicillin',
      dosage: '250mg',
      time: format(nextDose, 'hh:mm a'),
      status: 'upcoming',
    },
    {
      id: '4',
      name: 'Omeprazole',
      dosage: '20mg',
      time: '08:00 PM',
      status: 'pending',
    },
  ];

  const stats = [
    {
      icon: 'pill',
      label: 'Medicines',
      value: '8',
      color: '#74BA1E',
    },
    {
      icon: 'calendar-check',
      label: 'Adherence',
      value: '92%',
      color: '#3B82F6',
    },
    {
      icon: 'clock-alert',
      label: 'Today',
      value: '4',
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
      {/* Header */}
      <LinearGradient colors={['#74BA1E', '#5A9618']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.userName}>Welcome back!</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="bell" size={24} color="#FFFFFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.currentTime}>{format(currentTime, 'EEEE, MMMM d, yyyy • hh:mm:ss a')}</Text>
      </LinearGradient>

      {/* Next Dose Card */}
      <View style={styles.content}>
        <View style={styles.nextDoseCard}>
          <View style={styles.nextDoseHeader}>
            <Icon name="clock-alert" size={24} color="#74BA1E" />
            <Text style={styles.nextDoseTitle}>Next Dose</Text>
          </View>
          <Text style={styles.medicineName}>Amoxicillin 250mg</Text>
          <Text style={styles.doseTime}>
            {format(nextDose, 'hh:mm a')}
          </Text>
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>Time Remaining:</Text>
            <Text style={styles.countdownTime}>{timeRemaining}</Text>
          </View>
          <TouchableOpacity style={styles.markTakenButton}>
            <Text style={styles.markTakenText}>Mark as Taken</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
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

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Medicines')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {todaySchedule.map((item) => (
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
          ))}
        </View>

        {/* Quick Actions */}
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
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="history" size={28} color="#74BA1E" />
              <Text style={styles.actionText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
});

export default DashboardScreen;
