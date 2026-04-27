/**
 * Admin Dashboard - Fixed Statistics & Analytics
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Reminder, DoseRecord } from '../types';
import { getAdminStats, getTopReminders } from '../utils/analyticsUtils';

interface AdminDashboardProps {
  reminders: Reminder[];
  doseRecords: DoseRecord[];
  totalUsers: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reminders,
  doseRecords,
  totalUsers
}) => {
  const stats = getAdminStats(reminders, doseRecords, totalUsers);
  const topReminders = getTopReminders(reminders, doseRecords, 5);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>System Overview & Analytics</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: '#DBEAFE' }]}>
              <Text style={styles.metricIcon}>👥</Text>
              <Text style={styles.metricValue}>{stats.totalUsers}</Text>
              <Text style={styles.metricLabel}>Total Users</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: '#ECFDF5' }]}>
              <Text style={styles.metricIcon}>💊</Text>
              <Text style={styles.metricValue}>{stats.totalReminders}</Text>
              <Text style={styles.metricLabel}>Total Reminders</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.metricIcon}>✅</Text>
              <Text style={styles.metricValue}>{stats.activeReminders}</Text>
              <Text style={styles.metricLabel}>Active Reminders</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: '#FCE7F3' }]}>
              <Text style={styles.metricIcon}>📊</Text>
              <Text style={styles.metricValue}>{stats.averageAdherence.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Avg Adherence</Text>
            </View>
          </View>
        </View>

        {/* Activity Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Overview</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityLabel}>Daily Doses Scheduled</Text>
                <Text style={styles.activityValue}>{stats.dailyDoses}</Text>
              </View>
              <View style={styles.activityIconContainer}>
                <Text style={styles.activityIcon}>📅</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.activityRow}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityLabel}>Weekly Doses Scheduled</Text>
                <Text style={styles.activityValue}>{stats.weeklyDoses}</Text>
              </View>
              <View style={styles.activityIconContainer}>
                <Text style={styles.activityIcon}>📆</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Performing Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Reminders</Text>
          
          {topReminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>No reminder data available</Text>
            </View>
          ) : (
            topReminders.map((item, index) => (
              <View key={item.reminder.id} style={styles.reminderCard}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderName}>{item.reminder.medicineName}</Text>
                  <Text style={styles.reminderDosage}>{item.reminder.dosage}</Text>
                </View>
                <View style={styles.adherenceContainer}>
                  <Text style={styles.adherencePercent}>{item.adherenceRate.toFixed(0)}%</Text>
                  <View style={styles.adherenceBar}>
                    <View
                      style={[
                        styles.adherenceBarFill,
                        {
                          width: `${Math.min(item.adherenceRate, 100)}%`,
                          backgroundColor: item.adherenceRate >= 80
                            ? '#10B981'
                            : item.adherenceRate >= 50
                            ? '#F59E0B'
                            : '#EF4444'
                        }
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* System Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          
          <View style={styles.healthCard}>
            <View style={styles.healthItem}>
              <View style={styles.healthIndicator}>
                <View style={[styles.healthDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.healthLabel}>Notifications</Text>
              </View>
              <Text style={styles.healthStatus}>Operational</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.healthItem}>
              <View style={styles.healthIndicator}>
                <View style={[styles.healthDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.healthLabel}>Database</Text>
              </View>
              <Text style={styles.healthStatus}>Healthy</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.healthItem}>
              <View style={styles.healthIndicator}>
                <View style={[styles.healthDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.healthLabel}>AI Scanner</Text>
              </View>
              <Text style={styles.healthStatus}>Active</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📢</Text>
            <Text style={styles.actionText}>Send Promotional Message</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>View Detailed Reports</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>System Settings</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📥</Text>
            <Text style={styles.actionText}>Export Data</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            DVAGO Admin Panel v1.0{'\n'}
            Last updated: {new Date().toLocaleString()}
          </Text>
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
    color: '#111827',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280'
  },
  content: {
    flex: 1,
    padding: 20
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 12
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center'
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  metricValue: {
    fontSize: 28,
    color: '#111827',
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center'
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  activityInfo: {
    flex: 1
  },
  activityLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4
  },
  activityValue: {
    fontSize: 24,
    color: '#111827'
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9E8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activityIcon: {
    fontSize: 24
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#74BA1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  rankText: {
    fontSize: 16,
    color: '#FFFFFF'
  },
  reminderInfo: {
    flex: 1
  },
  reminderName: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2
  },
  reminderDosage: {
    fontSize: 14,
    color: '#6B7280'
  },
  adherenceContainer: {
    alignItems: 'flex-end',
    minWidth: 80
  },
  adherencePercent: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 4
  },
  adherenceBar: {
    width: 80,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden'
  },
  adherenceBarFill: {
    height: '100%',
    borderRadius: 3
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12
  },
  healthLabel: {
    fontSize: 16,
    color: '#111827'
  },
  healthStatus: {
    fontSize: 14,
    color: '#6B7280'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#111827'
  },
  actionChevron: {
    fontSize: 20,
    color: '#9CA3AF'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280'
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18
  }
});
