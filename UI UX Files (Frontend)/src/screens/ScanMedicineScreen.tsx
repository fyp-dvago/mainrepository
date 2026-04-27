import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

const ScanMedicineScreen = ({navigation}: any) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);

  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      
      // Mock scanned data
      const mockData = {
        name: 'Amoxicillin',
        dosage: '250mg',
        manufacturer: 'PharmaCorp',
        batchNumber: 'BC12345',
        expiryDate: 'Dec 2026',
        category: 'Antibiotic',
      };
      
      setScannedData(mockData);
    }, 2000);
  };

  const handleAddScanned = () => {
    Alert.alert(
      'Success',
      'Medicine added to your list!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Medicines'),
        },
      ],
    );
  };

  const handleRescan = () => {
    setScannedData(null);
  };

  if (scannedData) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={80} color="#74BA1E" />
          </View>
          <Text style={styles.successTitle}>Medicine Detected!</Text>
          <Text style={styles.successSubtitle}>
            Review the details below and add to your list
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Icon name="pill" size={24} color="#74BA1E" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Medicine Name</Text>
                <Text style={styles.detailValue}>{scannedData.name}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="beaker" size={24} color="#3B82F6" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Dosage</Text>
                <Text style={styles.detailValue}>{scannedData.dosage}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="tag" size={24} color="#8B5CF6" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{scannedData.category}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="factory" size={24} color="#F59E0B" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Manufacturer</Text>
                <Text style={styles.detailValue}>
                  {scannedData.manufacturer}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="barcode" size={24} color="#EC4899" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Batch Number</Text>
                <Text style={styles.detailValue}>
                  {scannedData.batchNumber}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="calendar" size={24} color="#EF4444" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Expiry Date</Text>
                <Text style={styles.detailValue}>
                  {scannedData.expiryDate}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddScanned}>
            <Text style={styles.addButtonText}>Add to My Medicines</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rescanButton} onPress={handleRescan}>
            <Icon name="camera-retake" size={20} color="#74BA1E" />
            <Text style={styles.rescanButtonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
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
