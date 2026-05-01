import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/apiClient';

const MedicalHistoryScreen = ({navigation}: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    pastSurgeries: '',
    currentDiseases: '',
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(current => ({
      ...current,
      [field]: value,
    }));
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/user/profile');
      const medicalHistory = response?.data?.user?.medicalHistory || {};

      setForm({
        bloodGroup: medicalHistory.bloodGroup || '',
        allergies: medicalHistory.allergies || '',
        chronicConditions: medicalHistory.chronicConditions || '',
        pastSurgeries: medicalHistory.pastSurgeries || '',
        currentDiseases: medicalHistory.currentDiseases || '',
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load medical history',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.put('/user/profile', {
        medicalHistory: {
          bloodGroup: form.bloodGroup.trim(),
          allergies: form.allergies.trim(),
          chronicConditions: form.chronicConditions.trim(),
          pastSurgeries: form.pastSurgeries.trim(),
          currentDiseases: form.currentDiseases.trim(),
        },
      });

      setSuccess('Medical history saved');
      Alert.alert('Success', 'Medical history saved successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to save medical history',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#74BA1E" />
        <Text style={styles.centerText}>Loading medical history...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      {!!error && (
        <View style={styles.errorCard}>
          <Icon name="alert-circle-outline" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!!success && (
        <View style={styles.successCard}>
          <Icon name="check-circle-outline" size={20} color="#10B981" />
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      <View style={styles.card}>
        <FormInput
          label="Blood Group"
          value={form.bloodGroup}
          onChangeText={value => updateField('bloodGroup', value)}
          placeholder="e.g., O+, A-"
          editable={!saving}
        />
        <FormInput
          label="Allergies"
          value={form.allergies}
          onChangeText={value => updateField('allergies', value)}
          placeholder="Enter allergies"
          editable={!saving}
          multiline
        />
        <FormInput
          label="Chronic Conditions"
          value={form.chronicConditions}
          onChangeText={value => updateField('chronicConditions', value)}
          placeholder="Enter chronic conditions"
          editable={!saving}
          multiline
        />
        <FormInput
          label="Past Surgeries"
          value={form.pastSurgeries}
          onChangeText={value => updateField('pastSurgeries', value)}
          placeholder="Enter past surgeries"
          editable={!saving}
          multiline
        />
        <FormInput
          label="Current Diseases"
          value={form.currentDiseases}
          onChangeText={value => updateField('currentDiseases', value)}
          placeholder="Enter current diseases"
          editable={!saving}
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.disabledButton]}
        onPress={handleSave}
        disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Medical History</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const FormInput = ({label, multiline, ...inputProps}: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      placeholderTextColor="#9CA3AF"
      textAlignVertical={multiline ? 'top' : 'center'}
      multiline={multiline}
      {...inputProps}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  centerText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 86,
  },
  saveButton: {
    backgroundColor: '#74BA1E',
    borderRadius: 12,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    flex: 1,
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MedicalHistoryScreen;
