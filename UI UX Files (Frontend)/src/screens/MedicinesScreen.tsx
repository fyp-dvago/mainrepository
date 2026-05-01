import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/apiClient';

type Medicine = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  stock: number;
  nextDose: string;
  color: string;
  category: string;
  isActive: boolean;
};

const frequencyLabels: Record<string, string> = {
  once: 'Once daily',
  twice: 'Twice daily',
  thrice: 'Thrice daily',
  four: '4 times daily',
};

const mapMedicine = (medicine: any): Medicine => ({
  id: medicine._id || medicine.id,
  name: medicine.name || '',
  dosage: medicine.dosage || '',
  frequency:
    frequencyLabels[medicine.frequency] || medicine.frequency || 'Once daily',
  stock: Number(medicine.stock || 0),
  nextDose:
    Array.isArray(medicine.times) && medicine.times.length > 0
      ? medicine.times[0]
      : 'No reminder',
  color: medicine.color || '#74BA1E',
  category: medicine.category || 'Medicine',
  isActive: medicine.isActive !== false,
});

const MedicinesScreen = ({navigation}: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/medicines');
      const data = Array.isArray(response.data) ? response.data : [];

      setMedicines(data.map(mapMedicine));
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to load medicines',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedicines();

    const unsubscribe = navigation.addListener('focus', loadMedicines);

    return unsubscribe;
  }, [loadMedicines, navigation]);

  const filters = [
    {id: 'all', label: 'All', count: medicines.length},
    {
      id: 'active',
      label: 'Active',
      count: medicines.filter(medicine => medicine.isActive).length,
    },
    {
      id: 'low',
      label: 'Low Stock',
      count: medicines.filter(medicine => medicine.stock < 10).length,
    },
  ];

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch = medicine.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'active' && medicine.isActive) ||
      (activeFilter === 'low' && medicine.stock < 10);
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Medicines</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMedicine')}>
          <Icon name="plus" size={24} color="#74BA1E" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon
          name="magnify"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              activeFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter.id)}>
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive,
              ]}>
              {filter.label}
            </Text>
            <View
              style={[
                styles.filterBadge,
                activeFilter === filter.id && styles.filterBadgeActive,
              ]}>
              <Text
                style={[
                  styles.filterBadgeText,
                  activeFilter === filter.id && styles.filterBadgeTextActive,
                ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Medicines List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#74BA1E" />
            <Text style={styles.stateText}>Loading medicines...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.emptyState}>
            <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.emptyText}>Could not load medicines</Text>
            <Text style={styles.emptySubtext}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadMedicines}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading &&
          !error &&
          filteredMedicines.map(medicine => (
            <TouchableOpacity
              key={medicine.id}
              style={styles.medicineCard}
              onPress={() => navigation.navigate('MedicineDetail', {medicine})}>
              <View
                style={[
                  styles.medicineColorBar,
                  {backgroundColor: medicine.color},
                ]}
              />
              <View style={styles.medicineContent}>
                <View style={styles.medicineHeader}>
                  <View style={styles.medicineInfo}>
                    <Text style={styles.medicineName}>{medicine.name}</Text>
                    <Text style={styles.medicineDosage}>{medicine.dosage}</Text>
                  </View>
                  <View
                    style={[
                      styles.stockBadge,
                      medicine.stock < 10 && styles.lowStockBadge,
                    ]}>
                    <Icon
                      name="package-variant"
                      size={14}
                      color={medicine.stock < 10 ? '#EF4444' : '#74BA1E'}
                    />
                    <Text
                      style={[
                        styles.stockText,
                        medicine.stock < 10 && styles.lowStockText,
                      ]}>
                      {medicine.stock}
                    </Text>
                  </View>
                </View>

                <View style={styles.medicineDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="clock-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{medicine.frequency}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="tag-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{medicine.category}</Text>
                  </View>
                </View>

                <View style={styles.nextDoseContainer}>
                  <Icon name="bell-outline" size={16} color="#74BA1E" />
                  <Text style={styles.nextDoseText}>
                    Next: {medicine.nextDose}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

        {!loading && !error && filteredMedicines.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="pill-off" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>No medicines found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first medicine to get started'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ScanMedicine')}>
        <Icon name="camera" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
filtersContainer: {
  marginHorizontal: 20,
  marginTop: 0,
  marginBottom: 16,
  maxHeight: 48,
  flexGrow: 0,
},

filtersContent: {
  flexDirection: 'row',
  backgroundColor: '#FFFFFF',
  padding: 4,
  borderRadius: 12,
  gap: 8,
},

filterButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 8,
  gap: 8,
},

filterButtonActive: {
  backgroundColor: '#74BA1E',
},

filterText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#6B7280',
},

filterTextActive: {
  color: '#FFFFFF',
},
  filterBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterBadgeTextActive: {
    color: '#74BA1E',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  stateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medicineColorBar: {
    width: '100%',
    height: 4,
  },
  medicineContent: {
    padding: 16,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  medicineDosage: {
    fontSize: 14,
    color: '#6B7280',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  lowStockBadge: {
    backgroundColor: '#FEF2F2',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#74BA1E',
  },
  lowStockText: {
    color: '#EF4444',
  },
  medicineDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  nextDoseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  nextDoseText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#74BA1E',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#74BA1E',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#74BA1E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default MedicinesScreen;
