/**
 * TypeScript Type Definitions for DVAGO
 */

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;
  frequency: 'daily' | 'weekly' | 'custom';
  times: string[]; // Array of time strings like "09:00", "14:00"
  quantity: number;
  remainingQuantity: number;
  startDate: Date;
  endDate?: Date;
  voiceAlert: boolean;
  pushNotification: boolean;
  isActive: boolean;
  customDays?: number[]; // 0-6 for Sunday-Saturday
  createdAt: Date;
  updatedAt: Date;
}

export interface DoseRecord {
  id: string;
  reminderId: string;
  medicineName: string;
  scheduledTime: Date;
  takenTime?: Date;
  status: 'pending' | 'taken' | 'snoozed' | 'skipped';
  snoozedUntil?: Date;
  createdAt: Date;
}

export interface MedicineScanned {
  name: string;
  confidence: number;
  detectedText: string;
}

export interface NotificationSettings {
  voiceEnabled: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface UserSettings {
  userId: string;
  notifications: NotificationSettings;
  reminderLeadTime: number; // minutes before dose
  language: 'en' | 'ms';
  theme: 'light' | 'dark';
}

export interface AdherenceStats {
  totalScheduled: number;
  taken: number;
  missed: number;
  snoozed: number;
  skipped: number;
  adherenceRate: number; // percentage
}

export interface AdminStats {
  totalUsers: number;
  totalReminders: number;
  activeReminders: number;
  averageAdherence: number;
  dailyDoses: number;
  weeklyDoses: number;
}

export interface NextDose {
  reminder: Reminder;
  scheduledTime: Date;
  timeUntil: number; // milliseconds
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export type TabParamList = {
  Dashboard: undefined;
  History: undefined;
  Settings: undefined;
  Admin: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  AddReminder: { editReminder?: Reminder };
  Scanner: undefined;
};
