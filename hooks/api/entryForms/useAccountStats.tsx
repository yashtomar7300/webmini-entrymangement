import { useRefresh } from '@/contexts/RefreshContext';
import apiClient from '@/utils/apiClient';
import { useEffect, useState } from 'react';

export interface AccountData {
  account_name: string;
  account_bal: string;
}

const GET_ACCOUNTS_BALANCE = "dashboard_account.php";

export function useAccountStats() {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {refresh} = useRefresh();

  useEffect(() => {
    async function fetchAccounts() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(GET_ACCOUNTS_BALANCE);
        const data = response.data;
        if (Array.isArray(data)) {
          setAccounts(data);
        } else {
          setError('Invalid response format');
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, [refresh]);

  return { accounts, loading, error };
}