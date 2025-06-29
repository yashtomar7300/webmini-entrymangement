import { useAccountStats } from '@/hooks/api/creditEntryForm/useAccountStats';
import { useCashbookBalance } from '@/hooks/api/creditEntryForm/useCashbookBalance';
import { useEmployeeBalances } from '@/hooks/api/creditEntryForm/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { logout, user } = useAuth();
  const { accounts: accountsData, loading: accountsLoading, error: accountsError } = useAccountStats();
  const { employees: employeeData, loading: employeesLoading, error: employeesError } = useEmployeeBalances();
  const { cashbookBalance, loading: cashbookLoading, error: cashbookError } = useCashbookBalance();
  const [totalEmployeeAmount, setTotalEmployeeAmount] = useState<number>(0);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  // console.log(accountsData, "- accountsData");
  // console.log(employeeData, "- employeeData");
  // console.log(cashbookBalance, "- cashbookBalance");
  // console.log(user, "- user");

  // Calculate total employee amount from positive balances
  useEffect(() => {
    if (employeeData && Array.isArray(employeeData)) {
      const total = employeeData
        .filter(emp => !emp.emp_bal.startsWith('-'))
        .reduce((total, emp) => {
          const numericBalance = parseFloat(emp.emp_bal.replace(/,/g, ''));
          return total + numericBalance;
        }, 0);
      setTotalEmployeeAmount(total);
    } else {
      setTotalEmployeeAmount(0);
    }
  }, [employeeData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatAccountBalance = (balance: string) => {
    // Remove commas and convert to number
    const numericBalance = parseFloat(balance.replace(/,/g, ''));
    return formatCurrency(numericBalance);
  };

  const quickActions = [
    { title: 'Add Entry', icon: 'plus', color: '#3b82f6' },
    { title: 'View Transactions', icon: 'repeat', color: '#10b981' },
    // { title: 'Accounts', icon: 'card', color: '#f59e0b' },
    // { title: 'Activity', icon: 'trending-up', color: '#8b5cf6' },
  ];

  const handleQuickAction = (actionTitle: string) => {
    if (actionTitle === 'View Transactions') {
      router.push('/(tabs)/transactions');
    } else if (actionTitle === "Add Entry") {
      router.push('/(tabs)/add-entry');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutMessage(true);
      setTimeout(() => {
        setShowLogoutMessage(false);
      }, 2000);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fund transer - to which account api replace 

  return (
    <SafeAreaView style={styles.container}>
      {/* Logout Success Message */}
      {showLogoutMessage && (
        <View style={styles.logoutMessage}>
          <View style={styles.logoutMessageContent}>
            <Feather name="check-circle" size={20} color="#10B981" />
            <Text style={styles.logoutMessageText}>Logout successfully</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.username}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Feather name="log-out" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards */}
        {user.username === "anil" && user.id === "1" && <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: '#3b82f6' }]}>
            <View style={styles.summaryContent}>
              <View style={styles.summaryIcon}>
                <FontAwesome name="dollar" size={18} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Cashbook</Text>
                {cashbookLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : cashbookError ? (
                  <Text style={[styles.summaryValue, { fontSize: 12 }]}>Error loading</Text>
                ) : (
                  <Text style={styles.summaryValue}>
                    {formatAccountBalance(cashbookBalance)}
                  </Text>
                )}
              </View>
            </View>
            {/* <Feather name="trending-up" size={20} color="#ffffff" style={styles.trendIcon} /> */}
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
            <View style={styles.summaryContent}>
              <View style={styles.summaryIcon}>
                <FontAwesome name="users" size={18} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Employees</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalEmployeeAmount)}</Text>
              </View>
            </View>
            {/* <Feather name="trending-up" size={20} color="#ffffff" style={styles.trendIcon} /> */}
          </View>
        </View>}

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard} onPress={() => handleQuickAction(action.title)}>
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  {action.icon === 'plus' && <Feather name="plus" size={20} color="#ffffff" />}
                  {action.icon === 'repeat' && <Feather name="repeat" size={20} color="#ffffff" />}
                  {action.icon === 'card' && <Feather name="credit-card" size={20} color="#ffffff" />}
                  {action.icon === 'trending-up' && <Feather name="trending-up" size={20} color="#ffffff" />}
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Accounts Overview */}
        {user.username === "anil" && user.id === "1" && <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Accounts Overview</Text>
          {accountsLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : accountsError ? (
            <Text style={{ color: '#EF4444', textAlign: 'center', paddingVertical: 20 }}>
              Failed to load accounts
            </Text>
          ) : (
            <View style={styles.accountsContainer}>
              {accountsData.map((account, index) => {
                const numericBalance = parseFloat(account.account_bal.replace(/,/g, ''));
                return (
                  <View key={index} style={styles.accountCard}>
                    <View style={styles.accountInfo}>
                      <View style={styles.accountIcon}>
                        {numericBalance >= 0 ? (
                          <FontAwesome name="money" size={18} color="#3b82f6" />
                        ) : (
                          <Feather name="trending-down" size={18} color="#ef4444" />
                        )}
                      </View>
                      <View style={styles.accountDetails}>
                        <Text style={styles.accountName}>{account.account_name}</Text>
                        <Text style={styles.accountType}>
                          {numericBalance >= 0 ? 'ACCOUNT' : 'LOAN'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.balanceContainer}>
                      <Text
                        style={[
                          styles.balanceAmount,
                          { color: numericBalance >= 0 ? '#10b981' : '#ef4444' },
                        ]}>
                        {formatAccountBalance(account.account_bal)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>}

        {/* Employee Accounts */}
        {user.username === "anil" && user.id === "1" && <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Employee Accounts</Text>
          {employeesLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : employeesError ? (
            <Text style={{ color: '#EF4444', textAlign: 'center', paddingVertical: 20 }}>
              Failed to load employee accounts
            </Text>
          ) : (
            <View style={styles.employeeContainer}>
              {employeeData.map((employee, index) => {
                const numericBalance = parseFloat(employee.emp_bal.replace(/,/g, ''));
                return (
                  <View key={index} style={styles.employeeCard}>
                    <View style={styles.employeeInfo}>
                      <View style={styles.employeeAvatar}>
                        <Text style={styles.employeeInitial}>
                          {employee.emp_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.employeeName}>{employee.emp_name}</Text>
                    </View>
                    <Text style={[
                      styles.employeeAmount,
                      { color: employee.emp_bal.startsWith('-') ? '#ef4444' : '#10b981' }
                    ]}>
                      {formatAccountBalance(employee.emp_bal)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 2,
    textTransform: "capitalize"
  },
  dateContainer: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 10,
    position: 'relative',
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
    marginTop: 2,
  },
  trendIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    opacity: 0.7,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  accountsContainer: {
    gap: 12,
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  accountType: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  employeeContainer: {
    gap: 12,
  },
  employeeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employeeInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  employeeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  logoutButton: {
    padding: 8,
    marginLeft: "auto"
  },
  logoutMessage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutMessageContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutMessageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 12,
  },
});