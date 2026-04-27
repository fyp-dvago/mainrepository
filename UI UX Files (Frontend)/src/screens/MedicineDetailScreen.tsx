import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const MedicineDetailScreen = ({navigation, route}: any) => {
  const medicine = route.params?.medicine || {
    id: '1',
    name: 'Paracetamol',
    dosage: '500mg',
    frequency: 'Twice daily',
    stock: 20,
    nextDose: '6:00 PM',
    color: '#3B82F6',
    category: 'Pain Relief',
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to delete ${medicine.name}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  const schedule = [
    {time: '09:00 AM', status: 'taken', date: 'Today'},
    {time: '06:00 PM', status: 'upcoming', date: 'Today'},
    {time: '09:00 AM', status: 'pending', date: 'Tomorrow'},
    {time: '06:00 PM', status: 'pending', date: 'Tomorrow'},
  ];

  const history = [
    {date: 'Dec 20, 2025', time: '09:00 AM', status: 'taken', onTime: true},
    {date: 'Dec 20, 2025', time: '06:00 PM', status: 'taken', onTime: true},
    {date: 'Dec 19, 2025', time: '09:00 AM', status: 'taken', onTime: false},
    {date: 'Dec 19, 2025', time: '06:00 PM', status: 'taken', onTime: true},
    {date: 'Dec 18, 2025', time: '09:00 AM', status: 'missed', onTime: false},
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <LinearGradient
        colors={[medicine.color, `${medicine.color}DD`]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Icon name="pill" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.medicineDosage}>{medicine.dosage}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{medicine.category}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Icon name="clock-outline" size={24} color="#74BA1E" />
            <Text style={styles.infoLabel}>Frequency</Text>
            <Text style={styles.infoValue}>{medicine.frequency}</Text>
          </View>
          <View style={styles.infoCard}>
            <Icon name="package-variant" size={24} color="#3B82F6" />
            <Text style={styles.infoLabel}>Stock</Text>
            <Text style={styles.infoValue}>{medicine.stock} left</Text>
          </View>
          <View style={styles.infoCard}>
            <Icon name="bell-outline" size={24} color="#F59E0B" />
            <Text style={styles.infoLabel}>Next Dose</Text>
            <Text style={styles.infoValue}>{medicine.nextDose}</Text>
          </View>
        </View>

        {/* Upcoming Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
          {schedule.map((item, index) => (
            <View key={index} style={styles.scheduleItem}>
              <View
                style={[
                  styles.scheduleIcon,
                  {
                    backgroundColor:
                      item.status === 'taken'
                        ? '#DCFCE7'
                        : item.status === 'upcoming'
                        ? '#FEF3C7'
                        : '#F3F4F6',
                  },
                ]}>
                <Icon
                  name={
                    item.status === 'taken'
                      ? 'check-circle'
                      : item.status === 'upcoming'
                      ? 'clock'
                      : 'calendar'
                  }
                  size={24}
                  color={
                    item.status === 'taken'
                      ? '#10B981'
                      : item.status === 'upcoming'
                      ? '#F59E0B'
                      : '#9CA3AF'
                  }
                />
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTime}>{item.time}</Text>
                <Text style={styles.scheduleDate}>{item.date}</Text>
              </View>
              {item.status === 'taken' && (
                <Icon name="check" size={24} color="#10B981" />
              )}
            </View>
          ))}
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>
          {history.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <View
                  style={[
                    styles.historyDot,
                    {
                      backgroundColor:
                        item.status === 'taken' ? '#74BA1E' : '#EF4444',
                    },
                  ]}
                />
                <View style={styles.historyContent}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyTime}>{item.time}</Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                {item.status === 'taken' ? (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: item.onTime
                          ? '#DCFCE7'
                          : '#FEF3C7',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: item.onTime ? '#10B981' : '#F59E0B',
                        },
                      ]}>
                      {item.onTime ? 'On Time' : 'Late'}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.statusBadge,
                      {backgroundColor: '#FEE2E2'},
                    ]}>
                    <Text style={[styles.statusText, {color: '#EF4444'}]}>
                      Missed
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionCard}>
            <Icon name="information-outline" size={24} color="#3B82F6" />
            <Text style={styles.instructionText}>
              Take with food. Avoid alcohol while taking this medication.
              Consult your doctor if symptoms persist.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="pencil" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}>
            <Icon name="delete" size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicineName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  medicineDosage: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  scheduleDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  historyRight: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#74BA1E',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default MedicineDetailScreen;
