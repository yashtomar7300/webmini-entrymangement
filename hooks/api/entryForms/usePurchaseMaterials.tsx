import apiClient from '@/utils/apiClient';
import { useEffect, useState } from 'react';

export interface PurchaseMaterialOption {
  purchase_material_id: string;
  purchase_material_name: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

const GET_PURCHASE_MATERIAL_LIST = "get_purchase_material_list.php";

export function usePurchaseMaterials() {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchaseMaterials() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(GET_PURCHASE_MATERIAL_LIST);
        const data = response.data;
        if (Array.isArray(data)) {
          setOptions(
            data.map((item: PurchaseMaterialOption) => ({
              label: item.purchase_material_name,
              value: item.purchase_material_id,
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
    fetchPurchaseMaterials();
  }, []);

  return { options, loading, error };
} 