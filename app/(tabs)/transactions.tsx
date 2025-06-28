import { useTransactions } from '@/hooks/api/creditEntryForm/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Transaction {
  id: string;
  date: string;
  account_id: string;
  amount: string;
  remarks: string;
  tfrom: string;
  account_name: string;
  party_name: string;
  payment_mode: string;
  payment_mode_id: string;
  fid: string;
  tname: string;
}

export default function Transactions() {
  const { user } = useAuth();
  const { transactions, loading, error } = useTransactions(user?.id || '');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    // The hook will automatically refetch when user.id changes
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatCurrency = (amount: string) => {
    // Handle invalid or empty amount
    if (!amount || amount.trim() === '') {
      return '₹0';
    }
    
    const numAmount = parseInt(amount);
    
    // Handle NaN case
    if (isNaN(numAmount)) {
      return '₹N/A';
    }
    
    // Format with Indian number system (lakhs, crores)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'N/A';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Determine if transaction is credit (tfrom = "1") or debit (tfrom = "2")
  const isCredit = (transaction: Transaction) => {
    return transaction.tfrom === "1";
  };

  const getPaymentModeColor = (mode: string) => {
    if (!mode) return '#6b7280';
    
    switch (mode.toLowerCase()) {
      case 'cash':
        return '#10b981';
      case 'bank transfer':
        return '#3b82f6';
      case 'cheque':
        return '#8b5cf6';
      case 'purchase':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'credit') return transaction.tfrom === "1";
    if (selectedFilter === 'debit') return transaction.tfrom === "2";
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error loading transactions</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        {/* <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#6b7280" />
        </TouchableOpacity> */}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All', icon: 'list' },
          { key: 'credit', label: 'Credit', icon: 'trending-up' },
          { key: 'debit', label: 'Debit', icon: 'trending-down' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Feather 
              name={filter.icon as any} 
              size={16} 
              color={selectedFilter === filter.key ? '#ffffff' : '#6b7280'} 
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive,
              ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <ScrollView 
        style={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTransactions.map((transaction, index) => {
          const creditTransaction = isCredit(transaction);
          
          return (
            <View key={index} style={styles.transactionCard}>
              {/* Date Row */}
              <View style={styles.dateRow}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar" size={16} color="#6b7280" />
                  <Text style={styles.dateText}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
              </View>

              {/* Amount Row */}
              <View style={styles.amountRow}>
                <View style={[
                  styles.transactionTypeIcon,
                  { backgroundColor: creditTransaction ? '#dcfce7' : '#fee2e2' }
                ]}>
                  {creditTransaction ? (
                    <Ionicons name="trending-up" size={20} color="#10b981" />
                  ) : (
                    <Ionicons name="trending-down" size={20} color="#ef4444" />
                  )}
                </View>
                <View style={styles.amountDetails}>
                  <Text style={styles.amountLabel}>
                    {creditTransaction ? 'Credit Amount' : 'Debit Amount'}
                  </Text>
                  <Text style={[
                    styles.amountValue,
                    { color: creditTransaction ? '#10b981' : '#ef4444' }
                  ]}>
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              </View>

              {/* Transaction Details */}
              <View style={styles.transactionBody}>
                {/* Party Name */}
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="person" size={16} color="#6b7280" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Party Name</Text>
                    <Text style={styles.detailValue}>
                      {transaction.party_name || 'N/A'}
                    </Text>
                  </View>
                </View>

                {/* Payment Mode */}
                {/* <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="card" size={16} color="#6b7280" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Payment Mode</Text>
                    <View style={styles.paymentModeContainer}>
                      <View style={[
                        styles.paymentModeBadge,
                        { backgroundColor: getPaymentModeColor(transaction.payment_mode) }
                      ]}>
                        <Text style={styles.paymentModeText}>
                          {transaction.payment_mode || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View> */}

                {/* Remarks - Only show if exists */}
                {transaction.remarks && transaction.remarks.trim() !== '' && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Feather name="file-text" size={16} color="#6b7280" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Remarks</Text>
                      <Text style={styles.detailValue}>
                        {transaction.remarks || 'No remarks'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="file-text" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No transactions found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your filters or check back later
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft:10
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    gap: 8,
    minHeight: 44,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateRow: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  transactionTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  amountDetails: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  transactionBody: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    lineHeight: 20,
  },
  paymentModeContainer: {
    flexDirection: 'row',
  },
  paymentModeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paymentModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});