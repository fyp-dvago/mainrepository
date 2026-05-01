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

const PersonalInformationScreen = ({navigation}: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
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
      const user = response?.data?.user || {};
      const personalInformation = user.personalInformation || {};

      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: personalInformation.phone || '',
        dateOfBirth: personalInformation.dateOfBirth || '',
        gender: personalInformation.gender || '',
        emergencyContact: personalInformation.emergencyContact || '',
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load personal information',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      setError('Name is required');
      return;
    }

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.put('/user/profile', {
        name,
        email,
        personalInformation: {
          phone: form.phone.trim(),
          dateOfBirth: form.dateOfBirth.trim(),
          gender: form.gender.trim(),
          emergencyContact: form.emergencyContact.trim(),
        },
      });

      setSuccess('Personal information saved');
      Alert.alert('Success', 'Personal information saved successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to save personal information',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#74BA1E" />
        <Text style={styles.centerText}>Loading personal information...</Text>
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
          label="Name"
          value={form.name}
          onChangeText={value => updateField('name', value)}
          placeholder="Enter your name"
          editable={!saving}
          required
        />
        <FormInput
          label="Email"
          value={form.email}
          onChangeText={value => updateField('email', value)}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!saving}
          required
        />
        <FormInput
          label="Phone"
          value={form.phone}
          onChangeText={value => updateField('phone', value)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          editable={!saving}
        />
        <FormInput
          label="Date of Birth"
          value={form.dateOfBirth}
          onChangeText={value => updateField('dateOfBirth', value)}
          placeholder="YYYY-MM-DD"
          editable={!saving}
        />
        <FormInput
          label="Gender"
          value={form.gender}
          onChangeText={value => updateField('gender', value)}
          placeholder="Enter your gender"
          editable={!saving}
        />
        <FormInput
          label="Emergency Contact"
          value={form.emergencyContact}
          onChangeText={value => updateField('emergencyContact', value)}
          placeholder="Enter emergency contact"
          keyboardType="phone-pad"
          editable={!saving}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.disabledButton]}
        onPress={handleSave}
        disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Information</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const FormInput = ({
  label,
  required,
  ...inputProps
}: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <TextInput
      style={styles.input}
      placeholderTextColor="#9CA3AF"
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
  required: {
    color: '#EF4444',
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

export default PersonalInformationScreen;
