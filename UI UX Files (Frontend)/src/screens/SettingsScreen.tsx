/**
 * Settings & Profile Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch
} from 'react-native';
import { UserSettings } from '../types';

interface SettingsScreenProps {
  userName: string;
  userEmail: string;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userName,
  userEmail,
  settings,
  onUpdateSettings,
  onLogout
}) => {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [editingProfile, setEditingProfile] = useState(false);

  const handleSaveProfile = () => {
    // In production: Save to backend
    setEditingProfile(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            
            {editingProfile ? (
              <View style={styles.profileForm}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                </View>
                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditingProfile(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userName}</Text>
                <Text style={styles.profileEmail}>{userEmail}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditingProfile(true)}
                >
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🔔 Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get reminders on your device
                </Text>
              </View>
              <Switch
                value={settings.notifications.pushEnabled}
                onValueChange={(value) =>
                  onUpdateSettings({
                    notifications: {
                      ...settings.notifications,
                      pushEnabled: value
                    }
                  })
                }
                trackColor={{ false: '#E5E7EB', true: '#86D957' }}
                thumbColor={settings.notifications.pushEnabled ? '#74BA1E' : '#F3F4F6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🔊 Voice Alerts</Text>
                <Text style={styles.settingDescription}>
                  Spoken reminders
                </Text>
              </View>
              <Switch
                value={settings.notifications.voiceEnabled}
                onValueChange={(value) =>
                  onUpdateSettings({
                    notifications: {
                      ...settings.notifications,
                      voiceEnabled: value
                    }
                  })
                }
                trackColor={{ false: '#E5E7EB', true: '#86D957' }}
                thumbColor={settings.notifications.voiceEnabled ? '#74BA1E' : '#F3F4F6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🔉 Sound</Text>
                <Text style={styles.settingDescription}>
                  Play notification sound
                </Text>
              </View>
              <Switch
                value={settings.notifications.soundEnabled}
                onValueChange={(value) =>
                  onUpdateSettings({
                    notifications: {
                      ...settings.notifications,
                      soundEnabled: value
                    }
                  })
                }
                trackColor={{ false: '#E5E7EB', true: '#86D957' }}
                thumbColor={settings.notifications.soundEnabled ? '#74BA1E' : '#F3F4F6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>📳 Vibration</Text>
                <Text style={styles.settingDescription}>
                  Vibrate on notification
                </Text>
              </View>
              <Switch
                value={settings.notifications.vibrationEnabled}
                onValueChange={(value) =>
                  onUpdateSettings({
                    notifications: {
                      ...settings.notifications,
                      vibrationEnabled: value
                    }
                  })
                }
                trackColor={{ false: '#E5E7EB', true: '#86D957' }}
                thumbColor={settings.notifications.vibrationEnabled ? '#74BA1E' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⏰</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Reminder Lead Time</Text>
              <Text style={styles.menuValue}>{settings.reminderLeadTime} minutes</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🌐</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Language</Text>
              <Text style={styles.menuValue}>{settings.language === 'en' ? 'English' : 'Bahasa Melayu'}</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🎨</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Theme</Text>
              <Text style={styles.menuValue}>{settings.theme === 'light' ? 'Light' : 'Dark'}</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📖</Text>
            <Text style={styles.menuLabel}>Help & Support</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>ℹ️</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>App Version</Text>
              <Text style={styles.menuValue}>1.0.0</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          DVAGO - Smart Medicine Reminder System{'\n'}
          Final Year Project © 2025
        </Text>
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
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 12
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center'
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#74BA1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  avatarText: {
    fontSize: 32,
    color: '#FFFFFF'
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%'
  },
  profileName: {
    fontSize: 22,
    color: '#111827',
    marginBottom: 4
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16
  },
  editButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  editButtonText: {
    fontSize: 14,
    color: '#374151'
  },
  profileForm: {
    width: '100%'
  },
  inputContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827'
  },
  profileActions: {
    flexDirection: 'row',
    gap: 8
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#74BA1E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  settingInfo: {
    flex: 1,
    marginRight: 16
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280'
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12
  },
  menuInfo: {
    flex: 1
  },
  menuLabel: {
    fontSize: 16,
    color: '#111827'
  },
  menuValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2
  },
  menuChevron: {
    fontSize: 20,
    color: '#9CA3AF'
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#DC2626'
  },
  footer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18
  }
});
