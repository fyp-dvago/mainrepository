  import React, {useCallback, useState} from 'react';
  import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
  } from 'react-native';
  import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
  import LinearGradient from 'react-native-linear-gradient';
  import {useFocusEffect} from '@react-navigation/native';
  import api from '../services/apiClient';

  const {width} = Dimensions.get('window');

  type Period = 'week' | 'month' | 'year';

  type AdherenceItem = {
    day: string;
    percentage: number;
    taken: number;
    total: number;
  };

  type MedicineStat = {
    name: string;
    adherence: number;
    taken: number;
    total: number;
    color: string;
  };

  type AnalyticsData = {
    stats: {
      adherenceRate: number;
      dosesTaken: string;
      onTimeRate: number;
      streak: string;
    };
    adherenceData: AdherenceItem[];
    medicineStats: MedicineStat[];
    bestTime: {
      slot: string;
      rate: string;
    };
  };

  const medicineColors = ['#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#10B981'];

  const normalizeAnalytics = (data: any): AnalyticsData => ({
    stats: {
      adherenceRate: Number(data?.stats?.adherenceRate || 0),
      dosesTaken: data?.stats?.dosesTaken || '0/0',
      onTimeRate: Number(data?.stats?.onTimeRate || 0),
      streak: data?.stats?.streak || '0 days',
    },
    adherenceData: Array.isArray(data?.adherenceData)
      ? data.adherenceData.map((item: any) => ({
          day: item.day || '',
          percentage: Number(item.percentage || 0),
          taken: Number(item.taken || 0),
          total: Number(item.total || 0),
        }))
      : [],
    medicineStats: Array.isArray(data?.medicineStats)
      ? data.medicineStats.map((item: any, index: number) => ({
          name: item.name || 'Medicine',
          adherence: Number(item.adherence || 0),
          taken: Number(item.taken || 0),
          total: Number(item.total || 0),
          color: medicineColors[index % medicineColors.length],
        }))
      : [],
    bestTime: {
      slot: data?.bestTime?.slot || 'No data',
      rate: data?.bestTime?.rate || '0%',
    },
  });

  const AnalyticsScreen = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const periods: {id: Period; label: string}[] = [
      {id: 'week', label: 'Week'},
      {id: 'month', label: 'Month'},
      {id: 'year', label: 'Year'},
    ];

    const loadAnalytics = useCallback(async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(`/analytics?period=${selectedPeriod}`);
        setAnalytics(normalizeAnalytics(response.data));
      } catch (requestError: any) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            'Unable to load analytics',
        );
      } finally {
        setLoading(false);
      }
    }, [selectedPeriod]);

    useFocusEffect(
      useCallback(() => {
        loadAnalytics();
      }, [loadAnalytics]),
    );

    const adherenceData = analytics?.adherenceData || [];
    const medicineStats = analytics?.medicineStats || [];
    const maxPercentage = Math.max(
      ...adherenceData.map(data => data.percentage),
      1,
    );
    const hasAnalyticsData =
      adherenceData.length > 0 ||
      medicineStats.length > 0 ||
      Boolean(analytics?.stats.dosesTaken !== '0/0');

    const stats = [
      {
        icon: 'chart-line',
        label: 'Adherence Rate',
        value: `${analytics?.stats.adherenceRate || 0}%`,
        change: selectedPeriod,
        color: '#74BA1E',
        isPositive: true,
      },
      {
        icon: 'check-circle',
        label: 'Doses Taken',
        value: analytics?.stats.dosesTaken || '0/0',
        change: 'Total',
        color: '#3B82F6',
        isPositive: true,
      },
      {
        icon: 'clock-alert',
        label: 'On Time',
        value: `${analytics?.stats.onTimeRate || 0}%`,
        change: 'Rate',
        color: '#F59E0B',
        isPositive: true,
      },
      {
        icon: 'calendar-check',
        label: 'Streak',
        value: analytics?.stats.streak || '0 days',
        change: 'Current',
        color: '#8B5CF6',
        isPositive: true,
      },
    ];

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>

        <View style={styles.periodSelector}>
          {periods.map(period => (
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

        {loading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#74BA1E" />
            <Text style={styles.stateText}>Loading analytics...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.emptyState}>
            <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.emptyText}>Could not load analytics</Text>
            <Text style={styles.emptySubtext}>{error}</Text>
          </View>
        )}

        {!loading && !error && !hasAnalyticsData && (
          <View style={styles.emptyState}>
            <Icon name="chart-line" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>No analytics yet</Text>
            <Text style={styles.emptySubtext}>
              Add medicines and dose schedules to see analytics.
            </Text>
          </View>
        )}

        {!loading && !error && hasAnalyticsData && (
          <>
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

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                {periods.find(period => period.id === selectedPeriod)?.label}{' '}
                Adherence
              </Text>
              {adherenceData.length === 0 ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>No adherence data</Text>
                </View>
              ) : (
                <View style={styles.chart}>
                  {adherenceData.map((data, index) => (
                    <View key={`${data.day}-${index}`} style={styles.chartBar}>
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
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medicine Breakdown</Text>
              {medicineStats.length === 0 ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>No medicine data</Text>
                </View>
              ) : (
                medicineStats.map((medicine, index) => (
                  <View key={`${medicine.name}-${index}`} style={styles.medicineItem}>
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
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights</Text>

              <View style={styles.insightCard}>
                <View style={[styles.insightIcon, {backgroundColor: '#DCFCE7'}]}>
                  <Icon name="thumb-up" size={24} color="#10B981" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Adherence</Text>
                  <Text style={styles.insightText}>
                    Your {selectedPeriod} adherence rate is{' '}
                    {analytics?.stats.adherenceRate || 0}%.
                  </Text>
                </View>
              </View>

              <View style={styles.insightCard}>
                <View style={[styles.insightIcon, {backgroundColor: '#FEF3C7'}]}>
                  <Icon name="lightbulb" size={24} color="#F59E0B" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>On-Time Rate</Text>
                  <Text style={styles.insightText}>
                    {analytics?.stats.onTimeRate || 0}% of taken doses were on time.
                  </Text>
                </View>
              </View>

              <View style={styles.insightCard}>
                <View style={[styles.insightIcon, {backgroundColor: '#DBEAFE'}]}>
                  <Icon name="information" size={24} color="#3B82F6" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Current Streak</Text>
                  <Text style={styles.insightText}>
                    Current adherence streak: {analytics?.stats.streak || '0 days'}.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Best Performance Time</Text>
              <View style={styles.bestTimeCard}>
                <Icon name="clock-check" size={32} color="#74BA1E" />
                <Text style={styles.bestTimeValue}>
                  {analytics?.bestTime.slot || 'No data'}
                </Text>
                <Text style={styles.bestTimeLabel}>
                  You take {analytics?.bestTime.rate || '0%'} of your{' '}
                  {analytics?.bestTime.slot || 'best'} doses on time
                </Text>
              </View>
            </View>
          </>
        )}
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
      paddingHorizontal: 20,
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
