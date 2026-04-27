/**
 * Medication Dose Action Modal
 * Popup for taking, snoozing, or skipping doses
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { NextDose } from '../types';
import { formatTime } from '../utils/timeUtils';

interface MedicationModalProps {
  visible: boolean;
  nextDose: NextDose | null;
  onTaken: () => void;
  onSnooze: () => void;
  onSkip: () => void;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const MedicationModal: React.FC<MedicationModalProps> = ({
  visible,
  nextDose,
  onTaken,
  onSnooze,
  onSkip,
  onClose
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const [soundWave, setSoundWave] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }).start();

      // Simulate voice alert animation
      const interval = setInterval(() => {
        setSoundWave(prev => !prev);
      }, 500);

      return () => clearInterval(interval);
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!nextDose) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {/* Voice Alert Indicator */}
          {nextDose.reminder.voiceAlert && (
            <View style={styles.voiceIndicator}>
              <View style={[styles.soundWave, soundWave && styles.soundWaveActive]} />
              <Text style={styles.voiceText}>🔊 Voice Alert</Text>
              <View style={[styles.soundWave, !soundWave && styles.soundWaveActive]} />
            </View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>💊</Text>
            <Text style={styles.title}>Time to take your medicine!</Text>
          </View>

          {/* Medicine Info */}
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{nextDose.reminder.medicineName}</Text>
            <Text style={styles.dosage}>{nextDose.reminder.dosage}</Text>
            <Text style={styles.scheduledTime}>
              Scheduled: {formatTime(nextDose.scheduledTime)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.takenButton]}
              onPress={onTaken}
            >
              <Text style={styles.buttonText}>✓ Taken</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={[styles.button, styles.snoozeButton]}
                onPress={onSnooze}
              >
                <Text style={styles.secondaryButtonText}>⏰ Snooze</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={onSkip}
              >
                <Text style={styles.secondaryButtonText}>⏭ Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: width - 60,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F0F9E8',
    borderRadius: 20
  },
  soundWave: {
    width: 4,
    height: 12,
    backgroundColor: '#74BA1E',
    borderRadius: 2,
    marginHorizontal: 2,
    opacity: 0.3
  },
  soundWaveActive: {
    opacity: 1,
    height: 20
  },
  voiceText: {
    fontSize: 12,
    color: '#74BA1E',
    marginHorizontal: 8
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8
  },
  title: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center'
  },
  medicineInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center'
  },
  medicineName: {
    fontSize: 22,
    color: '#111827',
    marginBottom: 4
  },
  dosage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8
  },
  scheduledTime: {
    fontSize: 14,
    color: '#9CA3AF'
  },
  actions: {
    gap: 12
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  takenButton: {
    backgroundColor: '#74BA1E'
  },
  snoozeButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14
  }
});
