import apiClient from '@/utils/apiClient';
import { useEffect, useState } from 'react';

export interface PartyOption {
  party_id: string;
  party_name: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

const GET_PARTY_LIST = "get_party_list.php";

export function useParties() {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchParties() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(GET_PARTY_LIST);
        const data = response.data;
        if (Array.isArray(data)) {
          setOptions(
            data.map((item: PartyOption) => ({
              label: item.party_name,
              value: item.party_id,
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
    fetchParties();
  }, []);

  return { options, loading, error };
}