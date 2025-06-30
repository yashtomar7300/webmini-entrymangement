import apiClient from '@/utils/apiClient';
import { useEffect, useState } from 'react';

export interface OtherMaterialOption {
  other_material_id: string;
  other_material_name: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

const GET_OTHER_MATERIAL_LIST = "get_other_material_list.php";

export function useOtherMaterials() {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOtherMaterials() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(GET_OTHER_MATERIAL_LIST);
        const data = response.data;
        if (Array.isArray(data)) {
          setOptions(
            data.map((item: OtherMaterialOption, index) => ({
              label: item.other_material_name,
              value: String(index + 1),
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
    fetchOtherMaterials();
  }, []);

  return { options, loading, error };
} 