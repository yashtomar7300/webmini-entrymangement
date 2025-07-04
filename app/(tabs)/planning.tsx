import { useRefresh } from '@/contexts/RefreshContext';
import { useEmployees } from '@/hooks/api/entryForms/useEmployees';
import { useParties } from '@/hooks/api/entryForms/useParties';
import { usePaymentPlanning } from '@/hooks/api/entryForms/usePaymentPlanning';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface PaymentPlanning {
  id: string;
  date: string;
  employeeName: string;
  amount: number;
  paymentMode: string;
  paymentType: 'Credit' | 'Debit' | 'Unknown';
  partyName: string;
  remarks: string;
}

export default function PaymentPlanningScreen() {
  const {planningData, loading, error} = usePaymentPlanning();
  const { options: partyOptions, loading: partiesLoading, error: partiesError } = useParties();
  const { options: employeeOptions, loading: employeesLoading, error: employeesError } = useEmployees();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('');
  const [selectedPartyFilter, setSelectedPartyFilter] = useState('');
  const [selectedPaymentModeFilter, setSelectedPaymentModeFilter] = useState('');
  const [formattedPlanningData, setFormattedPlanningData] = useState<PaymentPlanning[]>([]);
  const { triggerRefresh } = useRefresh();
  
  console.log(planningData, "- planning data")

  // Format API data to match mock data structure
  useEffect(() => {
    if (planningData && partyOptions && employeeOptions) {
      const formatted = planningData.map((item, index) => {
        // Get employee name from employee_id
        const employee = employeeOptions.find(emp => emp.value === item.employee_id);
        const employeeName = employee ? employee.label : `Employee ${item.employee_id}`;

        // Get party name from party_id
        const party = partyOptions.find(p => p.value === item.party_id);
        const partyName = party ? party.label : `Party ${item.party_id}`;

        // Map payment_mode_id to payment mode name
        let paymentMode = 'Unknown';
        switch (item.payment_mode_id) {
          case '1':
            paymentMode = 'Bill';
            break;
          case '2':
            paymentMode = 'Cash';
            break;
          default:
            paymentMode = `Mode ${item.payment_mode_id}`;
        }

        // Map type to payment type
        let paymentType: 'Credit' | 'Debit' | 'Unknown' = 'Unknown';
        switch (item.type) {
          case '1':
            paymentType = 'Credit';
            break;
          case '2':
            paymentType = 'Debit';
            break;
          default:
            paymentType = 'Unknown';
        }

        return {
          id: String(index + 1),
          date: item.date,
          employeeName,
          amount: Number(item.amount),
          paymentMode,
          paymentType,
          partyName,
          remarks: item.remarks,
        };
      });
      setFormattedPlanningData(formatted);
    }
  }, [planningData, partyOptions, employeeOptions]);

  const uniqueEmployees = useMemo(() => 
    [...new Set(formattedPlanningData.map(p => p.employeeName))], [formattedPlanningData]);
  
  const uniqueParties = useMemo(() => 
    [...new Set(formattedPlanningData.map(p => p.partyName))], [formattedPlanningData]);
  
  const uniquePaymentModes = useMemo(() => 
    [...new Set(formattedPlanningData.map(p => p.paymentMode))], [formattedPlanningData]);

  const filteredData = useMemo(() => {
    return formattedPlanningData.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.remarks.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDate = selectedDateFilter === '' || item.date.includes(selectedDateFilter);
      const matchesEmployee = selectedEmployeeFilter === '' || item.employeeName === selectedEmployeeFilter;
      const matchesParty = selectedPartyFilter === '' || item.partyName === selectedPartyFilter;
      const matchesPaymentMode = selectedPaymentModeFilter === '' || item.paymentMode === selectedPaymentModeFilter;
      
      return matchesSearch && matchesDate && matchesEmployee && matchesParty && matchesPaymentMode;
    });
  }, [formattedPlanningData, searchQuery, selectedDateFilter, selectedEmployeeFilter, selectedPartyFilter, selectedPaymentModeFilter]);

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'Credit':
        return '#10B981';
      case 'Debit':
        return '#EF4444';
      case 'Unknown':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'Credit':
        return '↗';
      case 'Debit':
        return '↙';
      case 'Unknown':
        return '↔';
      default:
        return '•';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const clearFilters = () => {
    setSelectedDateFilter('');
    setSelectedEmployeeFilter('');
    setSelectedPartyFilter('');
    setSelectedPaymentModeFilter('');
  };

  const renderPaymentItem = ({ item }: { item: PaymentPlanning }) => (
    <View style={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.paymentModeContainer}>
          <Text style={styles.paymentModeText}>{item.paymentMode}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.amountContainer}>
          <View style={[styles.amountBadge, { backgroundColor: getPaymentTypeColor(item.paymentType) }]}>
            <Text style={styles.amountIcon}>{getPaymentTypeIcon(item.paymentType)}</Text>
          </View>
          <View style={styles.amountDetails}>
            <Text style={styles.paymentTypeText}>{item.paymentType.toUpperCase()}</Text>
            <Text style={[styles.amountText, { color: getPaymentTypeColor(item.paymentType) }]}>
              {formatAmount(item.amount)}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={16} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Employee</Text>
              <Text style={styles.detailValue}>{item.employeeName}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="business" size={16} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Party</Text>
              <Text style={styles.detailValue}>{item.partyName}</Text>
            </View>
          </View>
          
          {item.remarks && (
            <View style={styles.detailRow}>
              <View style={styles.remarksContainer}>
                <Text style={styles.remarksLabel}>Remarks</Text>
                <Text style={styles.remarksText}>{item.remarks}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Enter date (YYYY-MM-DD)"
                value={selectedDateFilter}
                onChangeText={setSelectedDateFilter}
              />
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Employee</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterChips}>
                  {uniqueEmployees.map(employee => (
                    <TouchableOpacity
                      key={employee}
                      style={[
                        styles.filterChip,
                        selectedEmployeeFilter === employee && styles.selectedChip
                      ]}
                      onPress={() => setSelectedEmployeeFilter(
                        selectedEmployeeFilter === employee ? '' : employee
                      )}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedEmployeeFilter === employee && styles.selectedChipText
                      ]}>
                        {employee}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Party</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterChips}>
                  {uniqueParties.map(party => (
                    <TouchableOpacity
                      key={party}
                      style={[
                        styles.filterChip,
                        selectedPartyFilter === party && styles.selectedChip
                      ]}
                      onPress={() => setSelectedPartyFilter(
                        selectedPartyFilter === party ? '' : party
                      )}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedPartyFilter === party && styles.selectedChipText
                      ]}>
                        {party}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Payment Mode</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterChips}>
                  {uniquePaymentModes.map(mode => (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.filterChip,
                        selectedPaymentModeFilter === mode && styles.selectedChip
                      ]}
                      onPress={() => setSelectedPaymentModeFilter(
                        selectedPaymentModeFilter === mode ? '' : mode
                      )}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedPaymentModeFilter === mode && styles.selectedChipText
                      ]}>
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Planning</Text>
        <View style={styles.headerRight} />
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by employee, party, or remarks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>
      
      {(selectedDateFilter || selectedEmployeeFilter || selectedPartyFilter || selectedPaymentModeFilter) && (
        <View style={styles.activeFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.activeFiltersContent}>
              {selectedDateFilter && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>Date: {selectedDateFilter}</Text>
                  <TouchableOpacity onPress={() => setSelectedDateFilter('')}>
                    <Text style={styles.removeFilter}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              {selectedEmployeeFilter && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>Employee: {selectedEmployeeFilter}</Text>
                  <TouchableOpacity onPress={() => setSelectedEmployeeFilter('')}>
                    <Text style={styles.removeFilter}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              {selectedPartyFilter && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>Party: {selectedPartyFilter}</Text>
                  <TouchableOpacity onPress={() => setSelectedPartyFilter('')}>
                    <Text style={styles.removeFilter}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              {selectedPaymentModeFilter && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>Mode: {selectedPaymentModeFilter}</Text>
                  <TouchableOpacity onPress={() => setSelectedPaymentModeFilter('')}>
                    <Text style={styles.removeFilter}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}
      
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {loading || partiesLoading || employeesLoading ? 'Loading...' : 
           error || partiesError || employeesError ? 'Error loading data' :
           `${filteredData.length} payment${filteredData.length !== 1 ? 's' : ''} found`
          }
        </Text>
      </View>
      
      {(loading || partiesLoading || employeesLoading) ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading payment planning data...</Text>
        </View>
      ) : (error || partiesError || employeesError) ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || partiesError || employeesError}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={triggerRefresh}
            />
          }
        />
      )}
      
      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop:35
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
  },
  headerRight: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  activeFilters: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  activeFiltersContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  removeFilter: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 6,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  paymentModeContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  paymentModeText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  cardContent: {
    gap: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  amountIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  amountDetails: {
    flex: 1,
  },
  paymentTypeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailsSection: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailContent: {
    flex: 1,
    marginLeft: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 2,
  },
  remarksContainer: {
    flex: 1,
    paddingLeft: 24,
  },
  remarksLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  remarksText: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    marginLeft: 8,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
});