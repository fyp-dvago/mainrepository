/**
 * Bottom Tab Navigation Component
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabPress }) => {
  const tabs = [
    { key: 'Dashboard', label: 'Home', icon: '🏠' },
    { key: 'History', label: 'History', icon: '📊' },
    { key: 'Settings', label: 'Settings', icon: '⚙️' },
    { key: 'Admin', label: 'Admin', icon: '👨‍💼' }
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
        >
          <Text style={[
            styles.icon,
            activeTab === tab.key && styles.activeIcon
          ]}>
            {tab.icon}
          </Text>
          <Text style={[
            styles.label,
            activeTab === tab.key && styles.activeLabel
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8
  },
  icon: {
    fontSize: 22,
    marginBottom: 4,
    opacity: 0.5
  },
  activeIcon: {
    opacity: 1
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF'
  },
  activeLabel: {
    color: '#74BA1E'
  }
});
