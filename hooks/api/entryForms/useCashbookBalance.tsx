import { useRefresh } from '@/contexts/RefreshContext';
import apiClient from '@/utils/apiClient';
import { useEffect, useState } from 'react';

export interface CashbookData {
  cashbook: string;
}

const GET_CASHBOOK_BALANCE = "dashboard_cashbook.php";

export function useCashbookBalance() {
  const [cashbookBalance, setCashbookBalance] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {refresh} = useRefresh();
  
  useEffect(() => {
    async function fetchCashbookBalance() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(GET_CASHBOOK_BALANCE);
        const data = response.data;
        if (data && data.cashbook) {
          setCashbookBalance(data.cashbook);
        } else {
          setError('Invalid response format');
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchCashbookBalance();
  }, [refresh]);

  return { cashbookBalance, loading, error };
} 