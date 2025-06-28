import apiClient from '@/utils/apiClient';
import { useEffect, useState } from 'react';

export interface EmployeeOption {
  employee_id: string;
  employee_name: string;
}

export interface EmployeeBalanceData {
  emp_name: string;
  emp_bal: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

const GET_EMP_LIST = "get_emp_list.php";
const GET_EMPLOYEE_BALANCES = "dashboard_employee.php";

export function useEmployees() {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(GET_EMP_LIST);
        const data = response.data;
        if (Array.isArray(data)) {
          setOptions(
            data.map((item: EmployeeOption, index) => ({
              label: item.employee_name,
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
    fetchEmployees();
  }, []);

  return { options, loading, error };
}

export function useEmployeeBalances() {
  const [employees, setEmployees] = useState<EmployeeBalanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployeeBalances() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(GET_EMPLOYEE_BALANCES);
        const data = response.data;
        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          setError('Invalid response format');
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchEmployeeBalances();
  }, []);

  return { employees, loading, error };
} 