import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {clearAuthData, getStoredUser} from '../services/authService';
import api from '../services/apiClient';
import {cancelMedicineReminderNotifications} from '../services/notificationService';

type ProfileStats = {
  medicines: number;
  adherence: number;
  daysActive: number;
};

type NotificationSettings = {
  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  voiceEnabled: boolean;
};

const defaultNotifications: NotificationSettings = {
  pushEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  voiceEnabled: false,
};

const ProfileScreen = ({navigation}: any) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<ProfileStats>({
    medicines: 0,
    adherence: 0,
    daysActive: 0,
  });
  const [loadError, setLoadError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formError, setFormError] = useState('');

  const applyNotifications = useCallback((notifications?: Partial<NotificationSettings>) => {
    const next = {
      ...defaultNotifications,
      ...notifications,
    };

    setNotificationsEnabled(next.pushEnabled);
    setSoundEnabled(next.soundEnabled);
    setVibrationEnabled(next.vibrationEnabled);
    setVoiceEnabled(next.voiceEnabled);
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');

      const storedUser = await getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      const response = await api.get('/user/profile');

      if (response?.data?.user) {
        setUser(response.data.user);
      }

      if (response?.data?.stats) {
        setStats({
          medicines: Number(response.data.stats.medicines || 0),
          adherence: Number(response.data.stats.adherence || 0),
          daysActive: Number(response.data.stats.daysActive || 0),
        });
      }

      applyNotifications(response?.data?.settings?.notifications);
    } catch (error: any) {
      setLoadError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to load profile',
      );
    } finally {
      setLoading(false);
    }
  }, [applyNotifications]);

  useEffect(() => {
    const unsubscribe = navigation.addListener?.('focus', loadProfile);
    loadProfile();

    return unsubscribe;
  }, [loadProfile, navigation]);

  const getCurrentNotifications = (
    overrides: Partial<NotificationSettings> = {},
  ): NotificationSettings => ({
    pushEnabled: notificationsEnabled,
    soundEnabled,
    vibrationEnabled,
    voiceEnabled,
    ...overrides,
  });

  const saveNotificationSettings = async (
    nextNotifications: NotificationSettings,
  ) => {
    try {
      setSaving(true);
      setSaveMessage('');

      await api.put('/user/settings', {
        notifications: nextNotifications,
      });

      if (!nextNotifications.pushEnabled) {
        await cancelMedicineReminderNotifications();
      }

      setSaveMessage('Settings saved');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.message ||
          'Unable to save settings',
      );
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = async (
    key: keyof NotificationSettings,
    value: boolean,
  ) => {
    const nextNotifications = getCurrentNotifications({[key]: value});

    setNotificationsEnabled(nextNotifications.pushEnabled);
    setSoundEnabled(nextNotifications.soundEnabled);
    setVibrationEnabled(nextNotifications.vibrationEnabled);
    setVoiceEnabled(nextNotifications.voiceEnabled);

    await saveNotificationSettings(nextNotifications);
  };

  const handleOpenEditProfile = () => {
    setFormName(user?.name || '');
    setFormEmail(user?.email || '');
    setFormError('');
    setSaveMessage('');
    setIsEditVisible(true);
  };

  const handleSaveProfile = async () => {
    const nextName = formName.trim();
    const nextEmail = formEmail.trim();

    if (!nextName) {
      setFormError('Name is required');
      return;
    }

    if (!nextEmail) {
      setFormError('Email is required');
      return;
    }

    try {
      setSaving(true);
      setSaveMessage('');
      setFormError('');

      await api.put('/user/profile', {
        name: nextName,
        email: nextEmail,
      });

      await loadProfile();
      setIsEditVisible(false);
      setSaveMessage('Profile saved');
    } catch (error: any) {
      setFormError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to save profile',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearAuthData();
          navigation.replace('Auth');
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: 'account-circle',
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      color: '#74BA1E',
      onPress: () => navigation.navigate('PersonalInformation'),
    },
    {
      icon: 'hospital-box',
      title: 'Medical History',
      subtitle: 'View your medical records',
      color: '#3B82F6',
      onPress: () => navigation.navigate('MedicalHistory'),
    },
    {
      icon: 'card-account-details',
      title: 'Prescriptions',
      subtitle: 'Manage your prescriptions',
      color: '#8B5CF6',
      onPress: () => Alert.alert('Coming soon', 'Prescriptions will be available soon.'),
    },
    {
      icon: 'doctor',
      title: 'My Doctors',
      subtitle: 'Healthcare providers',
      color: '#EC4899',
      onPress: () => Alert.alert('Coming soon', 'My Doctors will be available soon.'),
    },
  ];

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#74BA1E" />
        <Text style={styles.loaderText}>Loading profile...</Text>
      </View>
    );
  }

  if (loadError && !user) {
    return (
      <View style={styles.loaderContainer}>
        <Icon name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Could not load profile</Text>
        <Text style={styles.errorText}>{loadError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#74BA1E', '#5A9618']} style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="account-circle" size={80} color="#FFFFFF" />
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No email available'}</Text>
        <TouchableOpacity
          style={[styles.editButton, saving && styles.disabledButton]}
          onPress={handleOpenEditProfile}
          disabled={saving}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
          <Icon name="pencil" size={16} color="#74BA1E" />
        </TouchableOpacity>
      </LinearGradient>

      <Modal
        visible={isEditVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !saving && setIsEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setIsEditVisible(false)}
                disabled={saving}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {!!formError && (
              <View style={styles.modalErrorCard}>
                <Text style={styles.modalErrorText}>{formError}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={formName}
                onChangeText={setFormName}
                placeholder="Enter your name"
                editable={!saving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={formEmail}
                onChangeText={setFormEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditVisible(false)}
                disabled={saving}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={handleSaveProfile}
                disabled={saving}>
                <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {!!loadError && (
        <View style={styles.statusCardError}>
          <Text style={styles.statusTextError}>{loadError}</Text>
        </View>
      )}

      {!!saveMessage && (
        <View style={styles.statusCardSuccess}>
          <Text style={styles.statusTextSuccess}>{saveMessage}</Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.medicines}</Text>
          <Text style={styles.statLabel}>Medicines</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.adherence}%</Text>
          <Text style={styles.statLabel}>Adherence</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.daysActive}</Text>
          <Text style={styles.statLabel}>Days Active</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Profile</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}>
            <View
              style={[
                styles.menuIcon,
                {backgroundColor: `${item.color}15`},
              ]}>
              <Icon name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="bell" size={24} color="#74BA1E" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSubtitle}>
                Receive medicine reminders
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={value =>
              updateNotificationSetting('pushEnabled', value)
            }
            trackColor={{false: '#D1D5DB', true: '#74BA1E'}}
            thumbColor="#FFFFFF"
            disabled={saving}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="volume-high" size={24} color="#74BA1E" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Sound</Text>
              <Text style={styles.settingSubtitle}>Play notification sound</Text>
            </View>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={value =>
              updateNotificationSetting('soundEnabled', value)
            }
            trackColor={{false: '#D1D5DB', true: '#74BA1E'}}
            thumbColor="#FFFFFF"
            disabled={!notificationsEnabled || saving}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="vibrate" size={24} color="#74BA1E" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Vibration</Text>
              <Text style={styles.settingSubtitle}>Vibrate on reminders</Text>
            </View>
          </View>
          <Switch
            value={vibrationEnabled}
            onValueChange={value =>
              updateNotificationSetting('vibrationEnabled', value)
            }
            trackColor={{false: '#D1D5DB', true: '#74BA1E'}}
            thumbColor="#FFFFFF"
            disabled={!notificationsEnabled || saving}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="microphone" size={24} color="#74BA1E" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Voice Reminders</Text>
              <Text style={styles.settingSubtitle}>
                Enable voice notifications
              </Text>
            </View>
          </View>
          <Switch
            value={voiceEnabled}
            onValueChange={value =>
              updateNotificationSetting('voiceEnabled', value)
            }
            trackColor={{false: '#D1D5DB', true: '#74BA1E'}}
            thumbColor="#FFFFFF"
            disabled={!notificationsEnabled || saving}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          DVAGO Smart Medicine Reminder System
        </Text>
        <Text style={styles.footerSubtext}>
          Industry Collaboration - Final Year Project
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  errorText: {
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
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#74BA1E',
  },
  statusCardSuccess: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
  },
  statusCardError: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
  },
  statusTextSuccess: {
    fontSize: 14,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '600',
  },
  statusTextError: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
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
  modalErrorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  modalErrorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#74BA1E',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#74BA1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  menuItem: {
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
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default ProfileScreen;
