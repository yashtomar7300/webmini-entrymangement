import { useRefresh } from '@/contexts/RefreshContext';
import apiClient from '@/utils/apiClient';
import { useEffect, useState } from 'react';

export interface PaymentPlanningResponse {
    payment_planing_id: string | null;
    date: string;
    type: string;
    amount: string;
    party_id: string;
    payment_mode_id: string;
    employee_id: string;
    remarks: string;
}

const GET_PAYMENT_PLANNING = "get_payment_planing.php";

export function usePaymentPlanning() {
    const [planningData, setPlanningData] = useState<PaymentPlanningResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const {refresh} = useRefresh();

    useEffect(() => {
        async function fetchPaymentPlanning() {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get(GET_PAYMENT_PLANNING);
                const data = response.data;
                if (Array.isArray(data)) {
                    setPlanningData(data);
                } else {
                    setError('Invalid response format');
                }
            } catch (err: any) {
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        }
        fetchPaymentPlanning();
    }, [refresh]);

    return { planningData, loading, error };
} 