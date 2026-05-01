  import React, {useState} from 'react';
  import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    Dimensions,
  } from 'react-native';
  import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
  import {launchCamera} from 'react-native-image-picker';
  import api from '../services/apiClient';
  import {scheduleMedicineReminderNotifications} from '../services/notificationService';

  const {width} = Dimensions.get('window');

  type ReminderTime = {
    hour: string;
    minute: string;
    period: 'AM' | 'PM';
  };

  const getDefaultReminderTime = (): ReminderTime => {
    const date = new Date(Date.now() + 30 * 60 * 1000);
    const hours24 = date.getHours();
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hour12 = hours24 % 12 || 12;

    return {
      hour: String(hour12),
      minute: String(date.getMinutes()).padStart(2, '0'),
      period,
    };
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

  const ScanMedicineScreen = ({navigation}: any) => {
    const [isScanning, setIsScanning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [scannedData, setScannedData] = useState<any>(null);
    const [scanError, setScanError] = useState('');
    const [selectedTimes, setSelectedTimes] = useState<ReminderTime[]>([
      getDefaultReminderTime(),
    ]);

    const handleScan = async () => {
      try {
        setScanError('');

        const pickerResult = await launchCamera({
          mediaType: 'photo',
          quality: 0.8,
        });

        if (pickerResult.didCancel) {
          return;
        }

        if (pickerResult.errorCode) {
          setScanError(
            pickerResult.errorMessage || 'Unable to capture medicine image',
          );
          return;
        }

        const asset = pickerResult.assets?.[0];

        if (!asset?.uri) {
          setScanError('No image was captured. Please try again.');
          return;
        }

        setIsScanning(true);

        const formData = new FormData();
        formData.append('image', {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `medicine-scan-${Date.now()}.jpg`,
        } as any);

        const response = await api.post('/scan/medicine', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const parsed = response?.data?.parsed || response?.data?.medicine || {};

        setScannedData({
          name: parsed.name || '',
          dosage: parsed.dosage || '',
          category: parsed.category || '',
          frequency: '',
          duration: '',
          stock: '',
          instructions: '',
        });
      } catch (error: any) {
        setScanError(
          error?.response?.data?.message ||
            error?.message ||
            'Unable to scan medicine image',
        );
      } finally {
        setIsScanning(false);
      }
    };

    const normalizeValue = (value?: string) => (value ? value.trim() : '');

    const updateScannedField = (field: string, value: string) => {
      setScannedData((current: any) => ({
        ...current,
        [field]: value,
      }));
    };

    const updateTimeSlot = (
      index: number,
      field: keyof ReminderTime,
      value: string,
    ) => {
      const nextTimes = [...selectedTimes];
      nextTimes[index] = {
        ...nextTimes[index],
        [field]: field === 'period' ? (value as 'AM' | 'PM') : value,
      };
      setSelectedTimes(nextTimes);
    };

    const addTimeSlot = () => {
      setSelectedTimes([...selectedTimes, getDefaultReminderTime()]);
    };

    const removeTimeSlot = (index: number) => {
      setSelectedTimes(selectedTimes.filter((_, itemIndex) => itemIndex !== index));
    };

    const handleSaveMedicine = async () => {
      const name = normalizeValue(scannedData?.name);
      const dosage = normalizeValue(scannedData?.dosage);
      const stock = normalizeValue(scannedData?.stock);

      if (!name || !dosage || !stock) {
        Alert.alert('Error', 'Medicine name, dosage, and stock are required');
        return;
      }

      if (selectedTimes.some(time => !validateReminderTime(time))) {
        Alert.alert(
          'Error',
          'Reminder hour must be 1-12 and minute must be 00-59',
        );
        return;
      }

      try {
        setIsSaving(true);
        const reminderTimes = selectedTimes.map(convertToBackendTime);

        const response = await api.post('/medicines', {
          name,
          dosage,
          category: normalizeValue(scannedData?.category),
          frequency: normalizeValue(scannedData?.frequency),
          duration: Number(normalizeValue(scannedData?.duration)) || 0,
          stock: Number(stock),
          instructions: normalizeValue(scannedData?.instructions),
          times: reminderTimes,
        });

        await scheduleMedicineReminderNotifications({
          medicineName: name,
          dosage,
          times: reminderTimes,
          doseSchedules: response.data?.doseSchedules,
        });

        Alert.alert('Success', 'Medicine saved successfully!', [
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
            'Unable to save medicine',
        );
      } finally {
        setIsSaving(false);
      }
    };

    const handleRescan = () => {
      setScannedData(null);
      setScanError('');
      setSelectedTimes([getDefaultReminderTime()]);
    };

    const renderEditableDetail = (
      field: string,
      label: string,
      icon: string,
      color: string,
      placeholder: string,
      keyboardType: 'default' | 'number-pad' = 'default',
      multiline = false,
    ) => (
      <View style={styles.detailRow}>
        <Icon name={icon} size={24} color={color} />
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>{label}</Text>
          <TextInput
            style={[styles.detailInput, multiline && styles.detailTextArea]}
            value={scannedData?.[field] || ''}
            onChangeText={value => updateScannedField(field, value)}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            multiline={multiline}
            editable={!isSaving}
          />
        </View>
      </View>
    );

    if (scannedData) {
      return (
        <View style={styles.container}>
          <ScrollView
            style={styles.successContainer}
            contentContainerStyle={styles.successContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.successIcon}>
              <Icon name="check-circle" size={80} color="#74BA1E" />
            </View>
            <Text style={styles.successTitle}>Medicine Detected!</Text>
            <Text style={styles.successSubtitle}>
              Review the details below and add to your list
            </Text>

            <View style={styles.detailsCard}>
              {renderEditableDetail(
                'name',
                'Medicine Name',
                'pill',
                '#74BA1E',
                'e.g., Panadol',
              )}
              {renderEditableDetail(
                'dosage',
                'Dosage',
                'beaker',
                '#3B82F6',
                'e.g., 500mg or 10ml',
              )}
              {renderEditableDetail(
                'category',
                'Category',
                'tag',
                '#8B5CF6',
                'e.g., Painkiller, Antibiotic',
              )}
              {renderEditableDetail(
                'frequency',
                'Frequency',
                'repeat',
                '#F59E0B',
                'e.g., once/twice/thrice/four',
              )}
              {renderEditableDetail(
                'duration',
                'Duration',
                'calendar-range',
                '#EC4899',
                'e.g., 7 (days)',
                'number-pad',
              )}
              {renderEditableDetail(
                'stock',
                'Stock',
                'package-variant',
                '#10B981',
                'e.g., 20 (tablets)',
                'number-pad',
              )}
              {renderEditableDetail(
                'instructions',
                'Instructions',
                'text-box-outline',
                '#64748B',
                'e.g., Take after meal',
                'default',
                true,
              )}

              <View style={styles.timeSection}>
                <View style={styles.labelRow}>
                  <Text style={styles.detailLabel}>Reminder Times</Text>
                  <TouchableOpacity onPress={addTimeSlot} disabled={isSaving}>
                    <Text style={styles.addTimeButton}>+ Add Time</Text>
                  </TouchableOpacity>
                </View>
                {selectedTimes.map((time, index) => (
                  <View key={index} style={styles.timeSlot}>
                    <Icon name="clock-outline" size={20} color="#0EA5E9" />
                    <TextInput
                      style={styles.timePartInput}
                      placeholder="HH"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={2}
                      value={time.hour}
                      onChangeText={value => updateTimeSlot(index, 'hour', value)}
                      editable={!isSaving}
                    />
                    <Text style={styles.timeSeparator}>:</Text>
                    <TextInput
                      style={styles.timePartInput}
                      placeholder="MM"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={2}
                      value={time.minute}
                      onChangeText={value =>
                        updateTimeSlot(index, 'minute', value)
                      }
                      editable={!isSaving}
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
                          disabled={isSaving}>
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
                        disabled={isSaving}>
                        <Icon name="close-circle" size={22} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.addButton, isSaving && styles.addButtonDisabled]}
              onPress={handleSaveMedicine}
              disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.addButtonText}>Save Medicine</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rescanButton}
              onPress={handleRescan}
              disabled={isSaving}>
              <Icon name="camera-retake" size={20} color="#74BA1E" />
              <Text style={styles.rescanButtonText}>Scan Again</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.scanContainer}>
          {/* Camera Placeholder */}
          <View style={styles.cameraPlaceholder}>
            <View style={styles.scanFrame}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
              
              {isScanning && (
                <View style={styles.scanningLine} />
              )}
              
              {!isScanning && (
                <View style={styles.scanIconContainer}>
                  <Icon name="camera" size={64} color="#FFFFFF" />
                  <Text style={styles.scanIconText}>
                    Position medicine wrapper in frame
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>
              {isScanning ? 'Scanning...' : 'How to Scan'}
            </Text>
            
            {!isScanning && (
              <>
                <View style={styles.instructionItem}>
                  <Icon name="checkbox-marked-circle" size={20} color="#74BA1E" />
                  <Text style={styles.instructionText}>
                    Ensure good lighting
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Icon name="checkbox-marked-circle" size={20} color="#74BA1E" />
                  <Text style={styles.instructionText}>
                    Hold phone steady
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Icon name="checkbox-marked-circle" size={20} color="#74BA1E" />
                  <Text style={styles.instructionText}>
                    Capture the medicine label clearly
                  </Text>
                </View>
              </>
            )}
            
            {isScanning && (
              <View style={styles.scanningInfo}>
                <Text style={styles.scanningText}>
                  AI is analyzing the medicine wrapper...
                </Text>
              </View>
            )}

            {!!scanError && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{scanError}</Text>
              </View>
            )}
          </View>

          {/* Scan Button */}
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
            onPress={handleScan}
            disabled={isScanning}>
            <Icon
              name={isScanning ? 'loading' : 'camera'}
              size={28}
              color="#FFFFFF"
            />
            <Text style={styles.scanButtonText}>
              {isScanning ? 'Scanning...' : 'Scan Medicine'}
            </Text>
          </TouchableOpacity>

          {/* Manual Entry Option */}
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => navigation.navigate('AddMedicine')}>
            <Icon name="pencil" size={20} color="#74BA1E" />
            <Text style={styles.manualButtonText}>Enter Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    scanContainer: {
      flex: 1,
      justifyContent: 'space-between',
      padding: 20,
    },
    cameraPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    scanFrame: {
      width: width - 80,
      height: width - 80,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cornerTopLeft: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 40,
      height: 40,
      borderTopWidth: 4,
      borderLeftWidth: 4,
      borderColor: '#74BA1E',
    },
    cornerTopRight: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 40,
      height: 40,
      borderTopWidth: 4,
      borderRightWidth: 4,
      borderColor: '#74BA1E',
    },
    cornerBottomLeft: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: 40,
      height: 40,
      borderBottomWidth: 4,
      borderLeftWidth: 4,
      borderColor: '#74BA1E',
    },
    cornerBottomRight: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 40,
      height: 40,
      borderBottomWidth: 4,
      borderRightWidth: 4,
      borderColor: '#74BA1E',
    },
    scanningLine: {
      width: '100%',
      height: 2,
      backgroundColor: '#74BA1E',
      position: 'absolute',
    },
    scanIconContainer: {
      alignItems: 'center',
    },
    scanIconText: {
      fontSize: 14,
      color: '#FFFFFF',
      marginTop: 16,
      textAlign: 'center',
      opacity: 0.8,
    },
    instructionsContainer: {
      backgroundColor: '#1F2937',
      borderRadius: 16,
      padding: 20,
      marginVertical: 20,
    },
    instructionsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 16,
    },
    instructionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    instructionText: {
      fontSize: 14,
      color: '#D1D5DB',
    },
    scanningInfo: {
      alignItems: 'center',
    },
    scanningText: {
      fontSize: 14,
      color: '#74BA1E',
      textAlign: 'center',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF2F2',
      borderRadius: 12,
      padding: 12,
      marginTop: 4,
      gap: 8,
    },
    errorText: {
      flex: 1,
      fontSize: 14,
      color: '#EF4444',
    },
    scanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#74BA1E',
      borderRadius: 12,
      paddingVertical: 18,
      gap: 12,
    },
    scanButtonDisabled: {
      opacity: 0.6,
    },
    scanButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    manualButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 16,
      marginTop: 12,
      gap: 8,
    },
    manualButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#74BA1E',
    },
    successContainer: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    successContent: {
      padding: 20,
      paddingBottom: 40,
    },
    successIcon: {
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 20,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1F2937',
      textAlign: 'center',
      marginBottom: 8,
    },
    successSubtitle: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: 32,
    },
    detailsCard: {
      backgroundColor: '#F9FAFB',
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    detailContent: {
      marginLeft: 16,
      flex: 1,
    },
    detailLabel: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1F2937',
    },
    detailInput: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1F2937',
      paddingVertical: 6,
      paddingHorizontal: 0,
    },
    detailTextArea: {
      minHeight: 64,
      textAlignVertical: 'top',
    },
    timeSection: {
      paddingTop: 12,
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
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      marginBottom: 10,
      gap: 8,
    },
    timePartInput: {
      width: 44,
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
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 8,
    },
    periodButtonActive: {
      backgroundColor: '#74BA1E',
    },
    periodText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#6B7280',
    },
    periodTextActive: {
      color: '#FFFFFF',
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
    addButtonDisabled: {
      opacity: 0.7,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    rescanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F0F9FF',
      borderRadius: 12,
      paddingVertical: 14,
      gap: 8,
    },
    rescanButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#74BA1E',
    },
  });

  export default ScanMedicineScreen;
