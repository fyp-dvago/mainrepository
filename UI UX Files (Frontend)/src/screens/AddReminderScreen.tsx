/**
 * Add/Edit Reminder Screen - 3-Step Form
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch
} from 'react-native';
import { Reminder } from '../types';

interface AddReminderScreenProps {
  onSave: (reminder: Partial<Reminder>) => void;
  onCancel: () => void;
  onScanMedicine: () => void;
  editReminder?: Reminder;
}

export const AddReminderScreen: React.FC<AddReminderScreenProps> = ({
  onSave,
  onCancel,
  onScanMedicine,
  editReminder
}) => {
  const [step, setStep] = useState(1);
  const [medicineName, setMedicineName] = useState(editReminder?.medicineName || '');
  const [dosage, setDosage] = useState(editReminder?.dosage || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>(
    editReminder?.frequency || 'daily'
  );
  const [times, setTimes] = useState<string[]>(editReminder?.times || ['09:00']);
  const [customDays, setCustomDays] = useState<number[]>(editReminder?.customDays || []);
  const [quantity, setQuantity] = useState(editReminder?.quantity?.toString() || '30');
  const [voiceAlert, setVoiceAlert] = useState(editReminder?.voiceAlert ?? true);
  const [pushNotification, setPushNotification] = useState(editReminder?.pushNotification ?? true);

  const weekDays = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 }
  ];

  const toggleDay = (day: number) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter(d => d !== day));
    } else {
      setCustomDays([...customDays, day]);
    }
  };

  const addTime = () => {
    setTimes([...times, '09:00']);
  };

  const removeTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const handleSave = () => {
    const reminder: Partial<Reminder> = {
      id: editReminder?.id || Date.now().toString(),
      medicineName,
      dosage,
      frequency,
      times,
      customDays: frequency !== 'daily' ? customDays : undefined,
      quantity: parseInt(quantity),
      remainingQuantity: editReminder?.remainingQuantity || parseInt(quantity),
      voiceAlert,
      pushNotification,
      isActive: true,
      startDate: editReminder?.startDate || new Date(),
      createdAt: editReminder?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSave(reminder);
  };

  const isStepValid = () => {
    if (step === 1) {
      return medicineName.trim() !== '' && dosage.trim() !== '';
    }
    if (step === 2) {
      return times.length > 0 && (frequency === 'daily' || customDays.length > 0);
    }
    return true;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {editReminder ? 'Edit Reminder' : 'Add Reminder'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map(s => (
          <View key={s} style={styles.stepContainer}>
            <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
              <Text style={[styles.stepNumber, step >= s && styles.stepNumberActive]}>
                {s}
              </Text>
            </View>
            {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Medicine Info */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Medicine Information</Text>
            <Text style={styles.stepSubtitle}>Enter details about your medicine</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Medicine Name</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="e.g., Panadol"
                  value={medicineName}
                  onChangeText={setMedicineName}
                />
                <TouchableOpacity style={styles.scanButton} onPress={onScanMedicine}>
                  <Text style={styles.scanIcon}>📸</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 500mg"
                value={dosage}
                onChangeText={setDosage}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Total Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="30"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <Text style={styles.hint}>Total number of doses you have</Text>
            </View>

            <View style={styles.medicineTypes}>
              <TouchableOpacity style={styles.medicineType}>
                <Text style={styles.medicineTypeIcon}>💊</Text>
                <Text style={styles.medicineTypeText}>Tablet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.medicineType}>
                <Text style={styles.medicineTypeIcon}>🧪</Text>
                <Text style={styles.medicineTypeText}>Syrup</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.medicineType}>
                <Text style={styles.medicineTypeIcon}>💉</Text>
                <Text style={styles.medicineTypeText}>Injection</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Set Schedule</Text>
            <Text style={styles.stepSubtitle}>When do you need to take this?</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.frequencyButtons}>
                <TouchableOpacity
                  style={[styles.frequencyButton, frequency === 'daily' && styles.frequencyButtonActive]}
                  onPress={() => setFrequency('daily')}
                >
                  <Text style={[styles.frequencyButtonText, frequency === 'daily' && styles.frequencyButtonTextActive]}>
                    Daily
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.frequencyButton, frequency === 'weekly' && styles.frequencyButtonActive]}
                  onPress={() => setFrequency('weekly')}
                >
                  <Text style={[styles.frequencyButtonText, frequency === 'weekly' && styles.frequencyButtonTextActive]}>
                    Weekly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.frequencyButton, frequency === 'custom' && styles.frequencyButtonActive]}
                  onPress={() => setFrequency('custom')}
                >
                  <Text style={[styles.frequencyButtonText, frequency === 'custom' && styles.frequencyButtonTextActive]}>
                    Custom
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {frequency !== 'daily' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select Days</Text>
                <View style={styles.weekDays}>
                  {weekDays.map(day => (
                    <TouchableOpacity
                      key={day.value}
                      style={[styles.dayButton, customDays.includes(day.value) && styles.dayButtonActive]}
                      onPress={() => toggleDay(day.value)}
                    >
                      <Text style={[styles.dayButtonText, customDays.includes(day.value) && styles.dayButtonTextActive]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Times</Text>
                <TouchableOpacity onPress={addTime}>
                  <Text style={styles.addTimeButton}>+ Add Time</Text>
                </TouchableOpacity>
              </View>
              {times.map((time, index) => (
                <View key={index} style={styles.timeRow}>
                  <TextInput
                    style={[styles.input, styles.timeInput]}
                    value={time}
                    onChangeText={value => updateTime(index, value)}
                    placeholder="09:00"
                  />
                  {times.length > 1 && (
                    <TouchableOpacity onPress={() => removeTime(index)}>
                      <Text style={styles.removeTimeButton}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Notifications */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Notification Settings</Text>
            <Text style={styles.stepSubtitle}>How would you like to be reminded?</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔊</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Voice Alert</Text>
                  <Text style={styles.settingDescription}>
                    Spoken reminder when it's time
                  </Text>
                </View>
              </View>
              <Switch
                value={voiceAlert}
                onValueChange={setVoiceAlert}
                trackColor={{ false: '#E5E7EB', true: '#86D957' }}
                thumbColor={voiceAlert ? '#74BA1E' : '#F3F4F6'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔔</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Push Notification</Text>
                  <Text style={styles.settingDescription}>
                    Show notification on your device
                  </Text>
                </View>
              </View>
              <Switch
                value={pushNotification}
                onValueChange={setPushNotification}
                trackColor={{ false: '#E5E7EB', true: '#86D957' }}
                thumbColor={pushNotification ? '#74BA1E' : '#F3F4F6'}
              />
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.previewContent}>
                <Text style={styles.previewMedicine}>{medicineName || 'Medicine Name'}</Text>
                <Text style={styles.previewDosage}>{dosage || 'Dosage'}</Text>
                <View style={styles.previewTimes}>
                  {times.map((time, idx) => (
                    <Text key={idx} style={styles.previewTime}>{time}</Text>
                  ))}
                </View>
                <Text style={styles.previewFrequency}>
                  {frequency === 'daily' ? 'Every day' : `${customDays.length} days per week`}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, !isStepValid() && styles.actionButtonDisabled]}
          onPress={step === 3 ? handleSave : handleNext}
          disabled={!isStepValid()}
        >
          <Text style={styles.actionButtonText}>
            {step === 3 ? 'Save Reminder' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF'
  },
  backButton: {
    fontSize: 16,
    color: '#74BA1E'
  },
  title: {
    fontSize: 18,
    color: '#111827'
  },
  placeholder: {
    width: 60
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF'
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepCircleActive: {
    backgroundColor: '#74BA1E'
  },
  stepNumber: {
    fontSize: 14,
    color: '#9CA3AF'
  },
  stepNumberActive: {
    color: '#FFFFFF'
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8
  },
  stepLineActive: {
    backgroundColor: '#74BA1E'
  },
  content: {
    flex: 1,
    padding: 20
  },
  stepContent: {
    paddingBottom: 20
  },
  stepTitle: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 8
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32
  },
  inputContainer: {
    marginBottom: 24
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827'
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8
  },
  inputFlex: {
    flex: 1
  },
  scanButton: {
    backgroundColor: '#74BA1E',
    borderRadius: 12,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scanIcon: {
    fontSize: 24
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4
  },
  medicineTypes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  medicineType: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  medicineTypeIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  medicineTypeText: {
    fontSize: 12,
    color: '#6B7280'
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  frequencyButtonActive: {
    backgroundColor: '#F0F9E8',
    borderColor: '#74BA1E'
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#6B7280'
  },
  frequencyButtonTextActive: {
    color: '#74BA1E'
  },
  weekDays: {
    flexDirection: 'row',
    gap: 8
  },
  dayButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  dayButtonActive: {
    backgroundColor: '#74BA1E',
    borderColor: '#74BA1E'
  },
  dayButtonText: {
    fontSize: 12,
    color: '#6B7280'
  },
  dayButtonTextActive: {
    color: '#FFFFFF'
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  addTimeButton: {
    fontSize: 14,
    color: '#74BA1E'
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  timeInput: {
    flex: 1
  },
  removeTimeButton: {
    fontSize: 20,
    color: '#EF4444',
    paddingHorizontal: 12
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12
  },
  settingText: {
    flex: 1
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280'
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 24
  },
  previewTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12
  },
  previewContent: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16
  },
  previewMedicine: {
    fontSize: 20,
    color: '#111827',
    marginBottom: 4
  },
  previewDosage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12
  },
  previewTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  previewTime: {
    fontSize: 14,
    color: '#74BA1E',
    backgroundColor: '#F0F9E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8
  },
  previewFrequency: {
    fontSize: 14,
    color: '#9CA3AF'
  },
  actions: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  actionButton: {
    backgroundColor: '#74BA1E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  actionButtonDisabled: {
    backgroundColor: '#E5E7EB'
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16
  }
});
