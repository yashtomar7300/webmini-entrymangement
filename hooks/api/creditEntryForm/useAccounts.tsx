import apiClient from '@/utils/apiClient';
import { useEffect, useState } from 'react';

export interface AccountOptions {
  account_id:string;
  account_name: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

const GET_ACCOUNTS_LIST = "get_account_list.php";

export function useAccounts() {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccounts() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(GET_ACCOUNTS_LIST);
        const data = response.data;
        console.log(response, '- response accounts');
        
        if (Array.isArray(data)) {
          setOptions(
            data.map((item: AccountOptions) => ({
              label: item.account_name,
              value: item.account_id,
            }))
          );
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
  }, []);

  return { options, loading, error };
}