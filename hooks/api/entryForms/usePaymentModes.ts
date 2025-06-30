import { useEffect, useState } from 'react';
import apiClient from '../../../utils/apiClient';

export interface PaymentModeOption {
  payment_mode_id: string;
  payment_mode: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

const GET_PAYMENT_MODE = '/get_payment_mode.php';

export function usePaymentModes() {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaymentModes() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(GET_PAYMENT_MODE);
        console.log(response, "_ response");
        
        const data = response.data;
        // console.log(data, "- data");
        if (response.status===200 && Array.isArray(data)) {
            console.log(data, "- data");
            
          setOptions(
            data.map((item: PaymentModeOption) => ({
              label: item.payment_mode,
              value: item.payment_mode_id,
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
    fetchPaymentModes();
  }, []);

  return { options, loading, error };
} 