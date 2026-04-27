import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const AnalyticsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    {id: 'week', label: 'Week'},
    {id: 'month', label: 'Month'},
    {id: 'year', label: 'Year'},
  ];

  const adherenceData = [
    {day: 'Mon', percentage: 95, taken: 4, total: 4},
    {day: 'Tue', percentage: 100, taken: 4, total: 4},
    {day: 'Wed', percentage: 75, taken: 3, total: 4},
    {day: 'Thu', percentage: 100, taken: 4, total: 4},
    {day: 'Fri', percentage: 100, taken: 4, total: 4},
    {day: 'Sat', percentage: 50, taken: 2, total: 4},
    {day: 'Sun', percentage: 75, taken: 3, total: 4},
  ];

  const stats = [
    {
      icon: 'chart-line',
      label: 'Adherence Rate',
      value: '92%',
      change: '+5%',
      color: '#74BA1E',
      isPositive: true,
    },
    {
      icon: 'check-circle',
      label: 'Doses Taken',
      value: '24/28',
      change: '86%',
      color: '#3B82F6',
      isPositive: true,
    },
    {
      icon: 'clock-alert',
      label: 'On Time',
      value: '21/24',
      change: '88%',
      color: '#F59E0B',
      isPositive: true,
    },
    {
      icon: 'calendar-check',
      label: 'Streak',
      value: '5 days',
      change: 'Current',
      color: '#8B5CF6',
      isPositive: true,
    },
  ];

  const medicineStats = [
    {
      name: 'Paracetamol',
      adherence: 100,
      taken: 14,
      total: 14,
      color: '#3B82F6',
    },
    {
      name: 'Amoxicillin',
      adherence: 95,
      taken: 20,
      total: 21,
      color: '#EF4444',
    },
    {
      name: 'Vitamin D',
      adherence: 86,
      taken: 6,
      total: 7,
      color: '#F59E0B',
    },
    {
      name: 'Omeprazole',
      adherence: 71,
      taken: 5,
      total: 7,
      color: '#8B5CF6',
    },
  ];

  const maxPercentage = Math.max(...adherenceData.map((d) => d.percentage));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.id)}>
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period.id && styles.periodTextActive,
              ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Overview */}
      <View style={styles.statsGrid}>
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
            <View style={styles.statChange}>
              <Icon
                name={stat.isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={stat.isPositive ? '#10B981' : '#EF4444'}
              />
              <Text
                style={[
                  styles.statChangeText,
                  {color: stat.isPositive ? '#10B981' : '#EF4444'},
                ]}>
                {stat.change}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Adherence Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly Adherence</Text>
        <View style={styles.chart}>
          {adherenceData.map((data, index) => (
            <View key={index} style={styles.chartBar}>
              <Text style={styles.chartPercentage}>{data.percentage}%</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(data.percentage / maxPercentage) * 100}%`,
                      backgroundColor:
                        data.percentage >= 90
                          ? '#74BA1E'
                          : data.percentage >= 70
                          ? '#F59E0B'
                          : '#EF4444',
                    },
                  ]}
                />
              </View>
              <Text style={styles.chartDay}>{data.day}</Text>
              <Text style={styles.chartCount}>
                {data.taken}/{data.total}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Medicine Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medicine Breakdown</Text>
        {medicineStats.map((medicine, index) => (
          <View key={index} style={styles.medicineItem}>
            <View style={styles.medicineHeader}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>{medicine.name}</Text>
                <Text style={styles.medicineCount}>
                  {medicine.taken}/{medicine.total} doses
                </Text>
              </View>
              <Text
                style={[
                  styles.adherencePercentage,
                  {
                    color:
                      medicine.adherence >= 90
                        ? '#74BA1E'
                        : medicine.adherence >= 70
                        ? '#F59E0B'
                        : '#EF4444',
                  },
                ]}>
                {medicine.adherence}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[medicine.color, `${medicine.color}CC`]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[
                  styles.progressFill,
                  {width: `${medicine.adherence}%`},
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>
        
        <View style={styles.insightCard}>
          <View style={[styles.insightIcon, {backgroundColor: '#DCFCE7'}]}>
            <Icon name="thumb-up" size={24} color="#10B981" />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Great Progress!</Text>
            <Text style={styles.insightText}>
              Your adherence rate improved by 5% this week
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={[styles.insightIcon, {backgroundColor: '#FEF3C7'}]}>
            <Icon name="lightbulb" size={24} color="#F59E0B" />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Tip</Text>
            <Text style={styles.insightText}>
              Most missed doses occur on weekends. Set extra reminders!
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={[styles.insightIcon, {backgroundColor: '#DBEAFE'}]}>
            <Icon name="information" size={24} color="#3B82F6" />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Reminder</Text>
            <Text style={styles.insightText}>
              Omeprazole adherence is below target. Stay consistent!
            </Text>
          </View>
        </View>
      </View>

      {/* Best Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Best Performance Time</Text>
        <View style={styles.bestTimeCard}>
          <Icon name="clock-check" size={32} color="#74BA1E" />
          <Text style={styles.bestTimeValue}>9:00 AM - 12:00 PM</Text>
          <Text style={styles.bestTimeLabel}>
            You take 98% of your morning doses on time
          </Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    padding: 4,
    borderRadius: 12,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#74BA1E',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartPercentage: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  barContainer: {
    flex: 1,
    width: '70%',
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  chartCount: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  medicineItem: {
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
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  medicineCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  adherencePercentage: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightCard: {
    flexDirection: 'row',
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
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bestTimeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bestTimeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  bestTimeLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
