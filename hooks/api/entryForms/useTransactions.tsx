import { useRefresh } from '@/contexts/RefreshContext';
import apiClient from '@/utils/apiClient';
import { useEffect, useState } from 'react';

export interface Transaction {
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

const GET_TRANSACTIONS = "get_trantion_employee.php";

export function useTransactions(employeeId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {refresh} = useRefresh();

  useEffect(() => {
    async function fetchTransactions() {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`${GET_TRANSACTIONS}?employee_id=${1}`);
        const {data} = response.data;
        console.log(response, "- response transactions");
        
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setError('Invalid response format');
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [employeeId, refresh]);

  return { transactions, loading, error };
} 