import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/apiClient';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'missed' | 'taken';
  time: string;
};

const getNotificationIcon = (type: NotificationItem['type']) => {
  if (type === 'taken') return 'check-circle';
  if (type === 'missed') return 'alert-circle';
  return 'bell-ring';
};

const getNotificationColor = (type: NotificationItem['type']) => {
  if (type === 'taken') return '#10B981';
  if (type === 'missed') return '#EF4444';
  return '#74BA1E';
};

const NotificationsScreen = ({navigation}: any) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/notifications');
      const items = Array.isArray(response.data?.notifications)
        ? response.data.notifications
        : [];

      setNotifications(
        items.map((item: any) => ({
          id: item._id || item.id || item.sourceId,
          title: item.title || 'Notification',
          message: item.message || '',
          type: item.type || 'reminder',
          time: item.time || 'Time unavailable',
        })),
      );
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to load notifications',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const clearAll = async () => {
    try {
      setClearing(true);
      await api.delete('/notifications/clear-all');
      setNotifications([]);
    } catch (clearError: any) {
      Alert.alert(
        'Error',
        clearError?.response?.data?.message ||
          clearError?.message ||
          'Unable to clear notifications',
      );
    } finally {
      setClearing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity
          style={[
            styles.clearButton,
            (notifications.length === 0 || clearing) && styles.disabledButton,
          ]}
          onPress={clearAll}
          disabled={notifications.length === 0 || clearing}>
          {clearing ? (
            <ActivityIndicator size="small" color="#74BA1E" />
          ) : (
            <Text style={styles.clearButtonText}>Clear All</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#74BA1E" />
          <Text style={styles.stateText}>Loading notifications...</Text>
        </View>
      )}

      {!loading && !!error && (
        <View style={styles.stateContainer}>
          <Icon name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.emptyTitle}>Could not load notifications</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadNotifications}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {notifications.length === 0 ? (
            <View style={styles.stateContainer}>
              <Icon name="bell-off-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyText}>
                Dosage reminders and dose updates will appear here.
              </Text>
            </View>
          ) : (
            notifications.map(item => {
              const color = getNotificationColor(item.type);

              return (
                <View key={item.id} style={styles.notificationItem}>
                  <View
                    style={[
                      styles.notificationIcon,
                      {backgroundColor: `${color}15`},
                    ]}>
                    <Icon
                      name={getNotificationIcon(item.type)}
                      size={24}
                      color={color}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <Text style={styles.notificationTime}>{item.time}</Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  clearButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    minWidth: 82,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#74BA1E',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 56,
  },
  stateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationItem: {
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
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
});

export default NotificationsScreen;
