import { useTransactions } from '@/hooks/api/creditEntryForm/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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

const ITEMS_PER_PAGE = 20;
const { width: screenWidth } = Dimensions.get('window');

export default function Transactions() {
  const { user } = useAuth();
  const { transactions, loading, error } = useTransactions(user?.id || '');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Animation value for sliding indicator
  const slideAnim = useMemo(() => new Animated.Value(0), []);
  
  // Animation value for active tab scale
  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  // Pre-filter and categorize transactions for instant switching
  const categorizedTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return { all: [], credit: [], debit: [] };
    }

    const all: Transaction[] = [];
    const credit: Transaction[] = [];
    const debit: Transaction[] = [];

    transactions.forEach(transaction => {
      if (!transaction || !transaction.tfrom) return;
      
      all.push(transaction);
      
      if (transaction.tfrom === "1") {
        credit.push(transaction);
      } else if (transaction.tfrom === "2") {
        debit.push(transaction);
      }
    });

    return { all, credit, debit };
  }, [transactions]);

  // Get current filtered transactions instantly
  const getCurrentTransactions = useCallback(() => {
    return categorizedTransactions[selectedFilter] || [];
  }, [categorizedTransactions, selectedFilter]);

  // Get paginated transactions
  const getPaginatedTransactions = useCallback(() => {
    const currentTransactions = getCurrentTransactions();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return currentTransactions.slice(startIndex, endIndex);
  }, [getCurrentTransactions, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  // Animate sliding indicator when filter changes
  useEffect(() => {
    const filterIndex = { all: 0, credit: 1, debit: 2 };
    const targetIndex = filterIndex[selectedFilter];
    const tabWidth = (screenWidth - 32 - 20) / 3; // screen width - padding - gaps
    
    // Reset scale animation
    scaleAnim.setValue(0.95);
    
    // Animate both sliding and scaling
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: targetIndex * tabWidth,
        useNativeDriver: false,
        tension: 80, // Reduced from 100 for smoother movement
        friction: 12, // Increased from 8 for less bouncing
        restDisplacementThreshold: 0.01, // More precise stopping
        restSpeedThreshold: 0.01, // More precise stopping
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 120,
        friction: 8,
      })
    ]).start();
  }, [selectedFilter, slideAnim, scaleAnim]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatCurrency = (amount: string) => {
    if (!amount || amount.trim() === '') {
      return '₹0';
    }
    
    const numAmount = parseInt(amount);
    
    if (isNaN(numAmount)) {
      return '₹N/A';
    }
    
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

  // Instant filter change
  const handleFilterChange = useCallback((filter: 'all' | 'credit' | 'debit') => {
    // Add a subtle press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      })
    ]).start();
    
    setSelectedFilter(filter);
  }, [scaleAnim]);

  // Render transaction item
  const renderTransactionItem = useCallback(({ item: transaction, index }: { item: Transaction; index: number }) => {
    const creditTransaction = isCredit(transaction);
    
    return (
      <View style={styles.transactionCard}>
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
  }, []);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Feather name="file-text" size={48} color="#d1d5db" />
      <Text style={styles.emptyStateText}>No transactions found</Text>
      <Text style={styles.emptyStateSubtext}>
        Try adjusting your filters or check back later
      </Text>
    </View>
  ), []);

  // Render footer for pagination
  const renderFooter = useCallback(() => {
    const currentTransactions = getCurrentTransactions();
    const totalPages = Math.ceil(currentTransactions.length / ITEMS_PER_PAGE);
    
    if (totalPages <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages} • {currentTransactions.length} transactions
        </Text>
        {currentPage < totalPages && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={() => setCurrentPage(prev => prev + 1)}
          >
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [getCurrentTransactions, currentPage]);

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

  const currentTransactions = getPaginatedTransactions();

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
      </View>

      {/* Filter Tabs with Sliding Indicator */}
      <View style={styles.filterContainer}>
        <View style={styles.tabContainer}>
          {/* Sliding Background Indicator */}
          <Animated.View 
            style={[
              styles.slidingIndicator,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]} 
          />
          
          {[
            { key: 'all', label: 'All', icon: 'list' },
            { key: 'credit', label: 'Credit', icon: 'trending-up' },
            { key: 'debit', label: 'Debit', icon: 'trending-down' },
          ].map((filter, index) => (
            <Animated.View
              key={filter.key}
              style={[
                styles.filterButtonWrapper,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => handleFilterChange(filter.key as any)}
                activeOpacity={0.7}
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
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={currentTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item, index) => `${item.id || 'item'}_${index}_${item.date || 'nodate'}`}
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 200, // Approximate height of each item
          offset: 200 * index,
          index,
        })}
      />
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 8
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    gap: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    position: 'relative',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    gap: 0,
    width: '100%',
    height:50
  },
  slidingIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '33.33%',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  filterButtonWrapper: {
    flex: 1,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'transparent',
    gap: 6,
    minHeight: 40,
    zIndex: 1,
  },
  filterButtonActive: {
    backgroundColor: 'transparent',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  transactionsListContent: {
    paddingBottom: 12,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateRow: {
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  amountDetails: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  transactionBody: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    marginRight: 10,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
    lineHeight: 18,
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
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  paginationText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  loadMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    marginLeft: 12,
  },
  loadMoreText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
  },
});