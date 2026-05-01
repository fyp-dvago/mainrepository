import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/apiClient';
import {scheduleMedicineReminderNotifications} from '../services/notificationService';

type ReminderTime = {
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
};

const getDefaultReminderTime = (): ReminderTime => {
  const date = new Date(Date.now() + 30 * 60 * 1000);
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hour12 = hours24 % 12 || 12;

  return {
    hour: String(hour12),
    minute: String(minutes).padStart(2, '0'),
    period,
  };
};

const convertToBackendTime = (time: ReminderTime) => {
  const hour = Number(time.hour);
  const minute = Number(time.minute);
  let hour24 = hour;

  if (time.period === 'AM' && hour === 12) {
    hour24 = 0;
  } else if (time.period === 'PM' && hour !== 12) {
    hour24 = hour + 12;
  }

  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const validateReminderTime = (time: ReminderTime) => {
  const hour = Number(time.hour);
  const minute = Number(time.minute);

  return (
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    hour >= 1 &&
    hour <= 12 &&
    minute >= 0 &&
    minute <= 59 &&
    (time.period === 'AM' || time.period === 'PM')
  );
};

const AddMedicineScreen = ({navigation, route}: any) => {
  const [medicineName, setMedicineName] = useState(
    route?.params?.medicineName || '',
  );
  const [dosage, setDosage] = useState(route?.params?.dosage || '');
  const [frequency, setFrequency] = useState('once');
  const [duration, setDuration] = useState('');
  const [stock, setStock] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<ReminderTime[]>([
    getDefaultReminderTime(),
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route?.params?.medicineName !== undefined) {
      setMedicineName(route.params.medicineName);
    }

    if (route?.params?.dosage !== undefined) {
      setDosage(route.params.dosage);
    }
  }, [route?.params?.dosage, route?.params?.medicineName]);

  const frequencyOptions = [
    {id: 'once', label: 'Once Daily', times: 1},
    {id: 'twice', label: 'Twice Daily', times: 2},
    {id: 'thrice', label: 'Thrice Daily', times: 3},
    {id: 'four', label: '4 Times Daily', times: 4},
  ];

  const handleAddMedicine = async () => {
    const trimmedName = medicineName.trim();
    const trimmedDosage = dosage.trim();

    if (!trimmedName || !trimmedDosage || !stock.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const invalidTime = selectedTimes.find(time => !validateReminderTime(time));
    if (invalidTime) {
      Alert.alert(
        'Error',
        'Reminder hour must be 1-12 and minute must be 00-59',
      );
      return;
    }

    try {
      setLoading(true);
      const reminderTimes = selectedTimes.map(convertToBackendTime);

      const response = await api.post('/medicines', {
        name: trimmedName,
        dosage: trimmedDosage,
        frequency,
        duration: duration ? Number(duration) : 0,
        stock: Number(stock),
        instructions: instructions.trim(),
        times: reminderTimes,
      });

      await scheduleMedicineReminderNotifications({
        medicineName: trimmedName,
        dosage: trimmedDosage,
        times: reminderTimes,
        doseSchedules: response.data?.doseSchedules,
      });

      Alert.alert('Success', 'Medicine added successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MainTabs', {screen: 'Medicines'}),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.message ||
          'Unable to add medicine',
      );
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = () => {
    setSelectedTimes([...selectedTimes, getDefaultReminderTime()]);
  };

  const removeTimeSlot = (index: number) => {
    const newTimes = selectedTimes.filter((_, i) => i !== index);
    setSelectedTimes(newTimes);
  };

  const updateTimeSlot = (
    index: number,
    field: keyof ReminderTime,
    value: string,
  ) => {
    const newTimes = [...selectedTimes];
    newTimes[index] = {
      ...newTimes[index],
      [field]: field === 'period' ? (value as 'AM' | 'PM') : value,
    };
    setSelectedTimes(newTimes);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Medicine Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Medicine Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Icon name="pill" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Enter medicine name"
              placeholderTextColor="#9CA3AF"
              value={medicineName}
              onChangeText={setMedicineName}
              editable={!loading}
            />
          </View>
        </View>

        {/* Dosage */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Dosage <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Icon name="beaker" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="e.g., 500mg, 10ml"
              placeholderTextColor="#9CA3AF"
              value={dosage}
              onChangeText={setDosage}
              editable={!loading}
            />
          </View>
        </View>

        {/* Frequency */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.frequencyContainer}>
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.frequencyButton,
                  frequency === option.id && styles.frequencyButtonActive,
                ]}
                onPress={() => setFrequency(option.id)}
                disabled={loading}>
                <Text
                  style={[
                    styles.frequencyText,
                    frequency === option.id && styles.frequencyTextActive,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Reminder Times</Text>
            <TouchableOpacity onPress={addTimeSlot} disabled={loading}>
              <Text style={styles.addTimeButton}>+ Add Time</Text>
            </TouchableOpacity>
          </View>
          {selectedTimes.map((time, index) => (
            <View key={index} style={styles.timeSlot}>
              <Icon name="clock-outline" size={20} color="#74BA1E" />
              <TextInput
                style={styles.timePartInput}
                placeholder="HH"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={2}
                value={time.hour}
                onChangeText={text => updateTimeSlot(index, 'hour', text)}
                editable={!loading}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timePartInput}
                placeholder="MM"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={2}
                value={time.minute}
                onChangeText={text => updateTimeSlot(index, 'minute', text)}
                editable={!loading}
              />
              <View style={styles.periodToggle}>
                {(['AM', 'PM'] as const).map(period => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      time.period === period && styles.periodButtonActive,
                    ]}
                    onPress={() => updateTimeSlot(index, 'period', period)}
                    disabled={loading}>
                    <Text
                      style={[
                        styles.periodText,
                        time.period === period && styles.periodTextActive,
                      ]}>
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedTimes.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeTimeSlot(index)}
                  disabled={loading}>
                  <Icon name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Duration */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (Days)</Text>
          <View style={styles.inputContainer}>
            <Icon name="calendar-range" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="e.g., 7, 14, 30"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={duration}
              onChangeText={setDuration}
              editable={!loading}
            />
          </View>
        </View>

        {/* Stock */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Stock Quantity <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Icon name="package-variant" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Number of tablets/doses"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={stock}
              onChangeText={setStock}
              editable={!loading}
            />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instructions</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Take with food, Before meals"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={instructions}
              onChangeText={setInstructions}
              editable={!loading}
            />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            You'll receive notifications at the scheduled times. Make sure to
            enable notifications in your device settings.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <TouchableOpacity
          style={[styles.addButton, loading && styles.disabledButton]}
          onPress={handleAddMedicine}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>Add Medicine</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  formScroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  frequencyContainer: {
    gap: 12,
  },
  frequencyButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  frequencyButtonActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#74BA1E',
  },
  frequencyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  frequencyTextActive: {
    color: '#74BA1E',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addTimeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#74BA1E',
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    gap: 12,
  },
  timePartInput: {
    width: 48,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    paddingVertical: 8,
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#74BA1E',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  footerActions: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: '#74BA1E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 54,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default AddMedicineScreen;
