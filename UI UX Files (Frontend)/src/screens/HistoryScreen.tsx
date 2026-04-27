/**
 * History & Statistics Screen - Fixed Analytics
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { DoseRecord, Reminder } from '../types';
import {
  calculateAdherenceStats,
  getWeeklyChartData,
  getMonthlyChartData,
  getCurrentStreak,
  getDoseDistribution
} from '../utils/analyticsUtils';
import { formatDate, formatTime } from '../utils/timeUtils';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface HistoryScreenProps {
  reminders: Reminder[];
  doseRecords: DoseRecord[];
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  reminders,
  doseRecords
}) => {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [filter, setFilter] = useState<'all' | 'taken' | 'missed' | 'pending'>('all');

  const now = new Date();
  const startDate = period === 'week' 
    ? startOfWeek(now, { weekStartsOn: 0 })
    : startOfMonth(now);
  const endDate = period === 'week'
    ? endOfWeek(now, { weekStartsOn: 0 })
    : endOfMonth(now);

  // Calculate statistics
  const stats = calculateAdherenceStats(doseRecords, startDate, endDate);
  const chartData = period === 'week' 
    ? getWeeklyChartData(doseRecords)
    : getMonthlyChartData(doseRecords);
  const streak = getCurrentStreak(doseRecords);
  const distribution = getDoseDistribution(doseRecords);

  // Filter records
  const filteredRecords = doseRecords
    .filter(record => {
      if (filter === 'all') return true;
      if (filter === 'taken') return record.status === 'taken';
      if (filter === 'missed') return record.status === 'skipped' || (record.status === 'pending' && new Date() > record.scheduledTime);
      if (filter === 'pending') return record.status === 'pending' && new Date() <= record.scheduledTime;
      return true;
    })
    .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
    .slice(0, 50);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return '#10B981';
      case 'snoozed': return '#F59E0B';
      case 'skipped': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'taken': return '✓';
      case 'snoozed': return '⏰';
      case 'skipped': return '⏭';
      default: return '⏱';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History & Stats</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.periodButtonText, period === 'week' && styles.periodButtonTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
            onPress={() => setPeriod('month')}
          >
            <Text style={[styles.periodButtonText, period === 'month' && styles.periodButtonTextActive]}>
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={styles.statValue}>{stats.adherenceRate}%</Text>
            <Text style={styles.statLabel}>Adherence</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.statValue}>{stats.taken}</Text>
            <Text style={styles.statLabel}>Taken</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
            <Text style={styles.statValue}>{stats.missed}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        {/* Adherence Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Adherence Trend</Text>
          <View style={styles.chart}>
            {chartData.map((point, index) => {
              const maxValue = Math.max(...chartData.map(p => p.value), 1);
              const heightPercent = (point.value / maxValue) * 100;
              
              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.chartBarContainer}>
                    <View
                      style={[
                        styles.chartBarFill,
                        { 
                          height: `${heightPercent}%`,
                          backgroundColor: point.value >= 80 ? '#74BA1E' : point.value >= 50 ? '#F59E0B' : '#EF4444'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>{point.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Distribution Pie */}
        <View style={styles.distributionCard}>
          <Text style={styles.chartTitle}>Status Distribution</Text>
          <View style={styles.distributionRow}>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.distributionLabel}>Taken</Text>
              <Text style={styles.distributionValue}>{distribution.taken}</Text>
            </View>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.distributionLabel}>Missed</Text>
              <Text style={styles.distributionValue}>{distribution.missed}</Text>
            </View>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionDot, { backgroundColor: '#6B7280' }]} />
              <Text style={styles.distributionLabel}>Pending</Text>
              <Text style={styles.distributionValue}>{distribution.pending}</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {['all', 'taken', 'missed', 'pending'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f as any)}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History Timeline */}
        <View style={styles.timeline}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {filteredRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          ) : (
            filteredRecords.map((record) => {
              const isOverdue = record.status === 'pending' && new Date() > record.scheduledTime;
              const actualStatus = isOverdue ? 'missed' : record.status;
              
              return (
                <View key={record.id} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineIndicator,
                      { backgroundColor: getStatusColor(actualStatus) }
                    ]}
                  >
                    <Text style={styles.timelineIndicatorText}>
                      {getStatusEmoji(actualStatus)}
                    </Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineMedicine}>{record.medicineName}</Text>
                    <Text style={styles.timelineTime}>
                      {formatDate(record.scheduledTime)} at {formatTime(record.scheduledTime)}
                    </Text>
                    {record.takenTime && (
                      <Text style={styles.timelineTaken}>
                        Taken at {formatTime(record.takenTime)}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(actualStatus) + '20' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: getStatusColor(actualStatus) }
                      ]}
                    >
                      {actualStatus}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 28,
    color: '#111827'
  },
  content: {
    flex: 1,
    padding: 20
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  periodButtonActive: {
    backgroundColor: '#74BA1E'
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6B7280'
  },
  periodButtonTextActive: {
    color: '#FFFFFF'
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 32,
    color: '#111827',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280'
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20
  },
  chartTitle: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 20
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    gap: 8
  },
  chartBar: {
    flex: 1,
    alignItems: 'center'
  },
  chartBarContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 8
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4
  },
  chartLabel: {
    fontSize: 11,
    color: '#9CA3AF'
  },
  distributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  distributionItem: {
    flex: 1,
    alignItems: 'center'
  },
  distributionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8
  },
  distributionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  distributionValue: {
    fontSize: 20,
    color: '#111827'
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF'
  },
  filterTabActive: {
    backgroundColor: '#74BA1E'
  },
  filterTabText: {
    fontSize: 14,
    color: '#6B7280'
  },
  filterTabTextActive: {
    color: '#FFFFFF'
  },
  timeline: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 16
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  timelineIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  timelineIndicatorText: {
    fontSize: 18,
    color: '#FFFFFF'
  },
  timelineContent: {
    flex: 1
  },
  timelineMedicine: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4
  },
  timelineTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2
  },
  timelineTaken: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  statusBadgeText: {
    fontSize: 12,
    textTransform: 'capitalize'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280'
  }
});
