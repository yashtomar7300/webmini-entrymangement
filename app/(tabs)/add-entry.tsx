import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import CreditEntryForm from '@/components/financial/CreditEntryForm';
import DebitEntryForm from '@/components/financial/DebitEntryForm';
import PaymentPlanningForm from '@/components/financial/PaymentPlanningForm';
import FundTransferForm from '@/components/financial/FundTransferForm';
import SaleEntryForm from '@/components/financial/SaleEntryForm';
import PurchaseEntryForm from '@/components/financial/PurchaseEntryForm';
import OtherEntryForm from '@/components/financial/OtherEntryForm';
import FinancialEntryTabs from '@/components/financial/FinancialEntryTabs';

export default function Financial() {
  const [activeTab, setActiveTab] = useState('Credit Entry');

  const renderActiveForm = () => {
    switch (activeTab) {
      case 'Credit Entry':
        return <CreditEntryForm />;
      case 'Debit Entry':
        return <DebitEntryForm />;
      case 'Payment Planning':
        return <PaymentPlanningForm />;
      case 'Fund Transfer':
        return <FundTransferForm />;
      case 'Sale Entry':
        return <SaleEntryForm />;
      case 'Purchase Entry':
        return <PurchaseEntryForm />;
      case 'Other Entry':
        return <OtherEntryForm />;
      default:
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>{activeTab} Form</Text>
            <Text style={styles.placeholderSubtext}>Coming soon...</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Entries</Text>
        <Text style={styles.subtitle}>Manage your financial transactions</Text>
      </View>

      <FinancialEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* <ScrollView style={styles.content} showsVerticalScrollIndicator={false}> */}
      <View style={styles.content}>
        {renderActiveForm()}
      </View>
      {/* </ScrollView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  placeholderContainer: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});