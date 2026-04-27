import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AddMedicineScreen = ({navigation}: any) => {
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [duration, setDuration] = useState('');
  const [stock, setStock] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['09:00']);

  const frequencyOptions = [
    {id: 'once', label: 'Once Daily', times: 1},
    {id: 'twice', label: 'Twice Daily', times: 2},
    {id: 'thrice', label: 'Thrice Daily', times: 3},
    {id: 'four', label: '4 Times Daily', times: 4},
  ];

  const handleAddMedicine = () => {
    if (!medicineName || !dosage || !stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Success',
      'Medicine added successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  const addTimeSlot = () => {
    setSelectedTimes([...selectedTimes, '09:00']);
  };

  const removeTimeSlot = (index: number) => {
    const newTimes = selectedTimes.filter((_, i) => i !== index);
    setSelectedTimes(newTimes);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
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
                onPress={() => setFrequency(option.id)}>
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
            <TouchableOpacity onPress={addTimeSlot}>
              <Text style={styles.addButton}>+ Add Time</Text>
            </TouchableOpacity>
          </View>
          {selectedTimes.map((time, index) => (
            <View key={index} style={styles.timeSlot}>
              <Icon name="clock-outline" size={20} color="#74BA1E" />
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                placeholderTextColor="#9CA3AF"
                value={time}
                onChangeText={(text) => {
                  const newTimes = [...selectedTimes];
                  newTimes[index] = text;
                  setSelectedTimes(newTimes);
                }}
              />
              {selectedTimes.length > 1 && (
                <TouchableOpacity onPress={() => removeTimeSlot(index)}>
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

        {/* Buttons */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMedicine}>
          <Text style={styles.addButtonText}>Add Medicine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
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
  addButton: {
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
  timeInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
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
  addButton: {
    backgroundColor: '#74BA1E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
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
