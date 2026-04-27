/**
 * AI Medicine Scanner Screen
 * Uses camera/image picker to scan medicine labels
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator
} from 'react-native';

interface ScannerScreenProps {
  onScanComplete: (medicineName: string) => void;
  onCancel: () => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  onScanComplete,
  onCancel
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [detectedName, setDetectedName] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);

  // Simulated AI scanning (in production, integrate Google Vision API)
  const simulateScan = () => {
    setScanning(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockMedicines = [
        'Panadol 500mg',
        'Aspirin 100mg',
        'Metformin 850mg',
        'Amoxicillin 500mg',
        'Ibuprofen 400mg'
      ];
      
      const randomMedicine = mockMedicines[Math.floor(Math.random() * mockMedicines.length)];
      const randomConfidence = Math.floor(Math.random() * 15) + 85; // 85-100%
      
      setDetectedName(randomMedicine);
      setConfidence(randomConfidence);
      setScanning(false);
    }, 2000);
  };

  const handleTakePhoto = () => {
    // In production: Use react-native-image-picker
    // For now, simulate with a placeholder
    setImageUri('https://via.placeholder.com/300x200?text=Medicine+Package');
    simulateScan();
  };

  const handleUploadImage = () => {
    // In production: Use react-native-image-picker
    setImageUri('https://via.placeholder.com/300x200?text=Uploaded+Medicine');
    simulateScan();
  };

  const handleUseDetected = () => {
    if (detectedName) {
      onScanComplete(detectedName);
    }
  };

  const handleRetry = () => {
    setImageUri(null);
    setDetectedName('');
    setConfidence(0);
    setScanning(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan Medicine</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {!imageUri ? (
          /* Initial State */
          <View style={styles.initialState}>
            <View style={styles.iconContainer}>
              <Text style={styles.cameraIcon}>📸</Text>
            </View>
            <Text style={styles.mainText}>Scan Medicine Label</Text>
            <Text style={styles.subText}>
              Use AI to automatically detect medicine name from the package
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleTakePhoto}>
                <Text style={styles.buttonIcon}>📷</Text>
                <Text style={styles.primaryButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleUploadImage}>
                <Text style={styles.buttonIcon}>🖼️</Text>
                <Text style={styles.secondaryButtonText}>Upload Image</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>Powered by Google Vision API</Text>
            </View>
          </View>
        ) : (
          /* Scanning/Result State */
          <View style={styles.resultState}>
            {/* Image Preview */}
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            {scanning ? (
              /* Scanning */
              <View style={styles.scanningContainer}>
                <ActivityIndicator size="large" color="#74BA1E" />
                <Text style={styles.scanningText}>Analyzing image...</Text>
                <View style={styles.scanLine} />
              </View>
            ) : (
              /* Results */
              <View style={styles.resultsContainer}>
                <View style={styles.successBadge}>
                  <Text style={styles.successIcon}>✓</Text>
                  <Text style={styles.successText}>Detection Complete</Text>
                </View>

                <View style={styles.detectionCard}>
                  <Text style={styles.detectionLabel}>Detected Medicine</Text>
                  <Text style={styles.detectionName}>{detectedName}</Text>
                  <View style={styles.confidenceBar}>
                    <View style={styles.confidenceBarBg}>
                      <View style={[styles.confidenceBarFill, { width: `${confidence}%` }]} />
                    </View>
                    <Text style={styles.confidenceText}>{confidence}% confidence</Text>
                  </View>
                </View>

                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleUseDetected}
                  >
                    <Text style={styles.primaryButtonText}>Use This Name</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleRetry}
                  >
                    <Text style={styles.secondaryButtonText}>Retry Scan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Scanning Tips</Text>
          <Text style={styles.tip}>• Ensure good lighting</Text>
          <Text style={styles.tip}>• Keep medicine label in focus</Text>
          <Text style={styles.tip}>• Avoid shadows and reflections</Text>
          <Text style={styles.tip}>• Hold camera steady</Text>
        </View>
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
  cancelButton: {
    fontSize: 16,
    color: '#6B7280'
  },
  title: {
    fontSize: 18,
    color: '#111827'
  },
  placeholder: {
    width: 60
  },
  content: {
    flex: 1,
    padding: 20
  },
  initialState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F9E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  cameraIcon: {
    fontSize: 60
  },
  mainText: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 8
  },
  subText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 40
  },
  actions: {
    width: '100%',
    gap: 12
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#74BA1E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#74BA1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16
  },
  badge: {
    marginTop: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  badgeText: {
    fontSize: 12,
    color: '#6B7280'
  },
  resultState: {
    flex: 1
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#E5E7EB'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  scanningContainer: {
    alignItems: 'center',
    paddingVertical: 40
  },
  scanningText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16
  },
  scanLine: {
    width: '80%',
    height: 2,
    backgroundColor: '#74BA1E',
    marginTop: 24,
    opacity: 0.5
  },
  resultsContainer: {
    flex: 1
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 24
  },
  successIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#10B981'
  },
  successText: {
    fontSize: 16,
    color: '#10B981'
  },
  detectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24
  },
  detectionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8
  },
  detectionName: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 16
  },
  confidenceBar: {
    gap: 8
  },
  confidenceBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden'
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: '#74BA1E',
    borderRadius: 4
  },
  confidenceText: {
    fontSize: 14,
    color: '#6B7280'
  },
  resultActions: {
    gap: 12
  },
  tipsContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginTop: 'auto'
  },
  tipsTitle: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8
  },
  tip: {
    fontSize: 13,
    color: '#B45309',
    marginBottom: 4
  }
});
