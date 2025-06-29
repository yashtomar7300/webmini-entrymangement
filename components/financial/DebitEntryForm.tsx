import { useAccounts } from '@/hooks/api/creditEntryForm/useAccounts';
import { useParties } from '@/hooks/api/creditEntryForm/useParties';
import { useAuth } from '@/hooks/useAuth';
import formatDate from '@/utils/formatDate';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import qs from 'qs';
import { useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePaymentModes } from '../../hooks/api/creditEntryForm/usePaymentModes';
import DrawerDropdown from './DrawerDropdown';
import FormWrapper, { FormWrapperRef } from './FormWrapper';

// Updated interface to match API payload
interface DebitEntryData {
  date: string;
  payment_mode_id: string;
  account_id: string;
  party_id: string;
  from_account_id: string;
  amount: number;
  remarks: string;
}

const DEBIT_ENTRY_API = '/debit_entry.php';

export default function DebitEntryForm() {
  const { options: paymentModeOptions, loading: paymentModesLoading, error: paymentModesError } = usePaymentModes();
  const { options: accountOptions, loading: accountsLoading, error: accountsError } = useAccounts();
  const { options: partyOptions, loading: partiesLoading, error: partiesError } = useParties();
  const { user } = useAuth();
  const remarksInputRef = useRef<TextInput>(null);
  const formWrapperRef = useRef<FormWrapperRef>(null);

  // Updated form state to match API
  const [formData, setFormData] = useState<DebitEntryData>({
    date: formatDate(new Date()),
    payment_mode_id: '',
    account_id: '',
    party_id: '',
    from_account_id: '',
    amount: 0,
    remarks: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DebitEntryData, string>>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof DebitEntryData, string>> = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.payment_mode_id) newErrors.payment_mode_id = 'Payment mode is required';
    if (formData.payment_mode_id !== "3" && !formData.from_account_id) newErrors.from_account_id = 'Account is required';
    if (!formData.party_id) newErrors.party_id = 'Party is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';
    else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a valid positive number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    const accountRequired = formData.payment_mode_id !== "3";
    return (
      formData.date &&
      formData.payment_mode_id &&
      (!accountRequired || formData.from_account_id) &&
      formData.party_id &&
      formData.amount &&
      !isNaN(Number(formData.amount)) &&
      Number(formData.amount) > 0
    );
  };

  const resetForm = () => {
    setFormData({
      date: formatDate(new Date()),
      payment_mode_id: '',
      account_id: '',
      party_id: '',
      from_account_id: '',
      amount: 0,
      remarks: '',
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    const apiUrl = "https://cmp2023.webmini.in/api";
    try {
      const response = await axios.post(
        apiUrl + DEBIT_ENTRY_API,
        qs.stringify({ ...formData, account_id: user?.id }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log(response, "debit submit response");

      if (response.data.res === 1) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
        }, 2000);
      } else {
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
        }, 3000);
      }
    } catch (error) {
      console.log(error, "- submit error");
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setFormData({ ...formData, date: formatDate(selectedDate) });
      if (errors.date) {
        setErrors({ ...errors, date: undefined });
      }
    }
  };

  const showDatePickerModal = () => {
    if (Platform.OS === 'web') {
      const dateString = prompt('Enter date (DD-MM-YYYY)', formData.date);
      if (dateString) {
        setFormData({ ...formData, date: dateString });
        if (errors.date) {
          setErrors({ ...errors, date: undefined });
        }
      }
    } else {
      setShowDatePicker(true);
    }
  };

  return (
    <FormWrapper ref={formWrapperRef}>
      {/* Success Animation */}
      {showSuccess && (
        <View style={styles.overlay}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#ffffff" />
            </View>
            <Text style={styles.successText}>Debit Entry Submitted Successfully!</Text>
          </View>
        </View>
      )}

      {/* Error Animation */}
      {showError && (
        <View style={styles.overlay}>
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Ionicons name="close" size={40} color="#ffffff" />
            </View>
            <Text style={styles.overlayErrorText}>Failed to submit debit entry. Please try again.</Text>
          </View>
        </View>
      )}

      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.formTitle}>Add Debit Entry</Text>
          <View style={styles.orangeAccent} />
        </View>
        <View style={styles.formContent}>
          {/* Date Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Date
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TouchableOpacity
              style={[styles.dateInputContainer, errors.date && styles.errorInput]}
              onPress={showDatePickerModal}
            >
              <Text style={styles.dateText}>{formData.date}</Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" style={styles.dateIcon} />
            </TouchableOpacity>
            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>
          {/* Date Picker Modal */}
          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={formData.date ? new Date(formData.date.split('-').reverse().join('-')) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
          {/* Payment Mode Dropdown */}
          {paymentModesLoading ? (
            <View style={{ marginVertical: 16 }}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : paymentModesError ? (
            <Text style={{ color: '#EF4444', marginBottom: 12 }}>Failed to load payment modes</Text>
          ) : (
            <DrawerDropdown
              label="Select Payment Mode"
              value={formData.payment_mode_id}
              placeholder="Select Payment Mode"
              options={paymentModeOptions}
              onSelect={(value) => {
                setFormData({ ...formData, payment_mode_id: value });
                if (errors.payment_mode_id) setErrors({ ...errors, payment_mode_id: undefined });
              }}
              error={errors.payment_mode_id}
              required={true}
            />
          )}
          {/* Account Dropdown */}
          {formData.payment_mode_id !== "3" && (accountsLoading ? (
            <View style={{ marginVertical: 16 }}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : accountsError ? (
            <Text style={{ color: '#EF4444', marginBottom: 12 }}>Failed to load accounts</Text>
          ) : (
            <DrawerDropdown
              label="To Which Account"
              value={formData.from_account_id}
              placeholder="Select Account"
              options={accountOptions}
              onSelect={(value) => {
                setFormData({ ...formData, from_account_id: value });
                if (errors.from_account_id) setErrors({ ...errors, from_account_id: undefined });
              }}
              error={errors.from_account_id}
              required={true}
            />
          ))}
          {/* Party Dropdown */}
          {partiesLoading ? (
            <View style={{ marginVertical: 16 }}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : partiesError ? (
            <Text style={{ color: '#EF4444', marginBottom: 12 }}>Failed to load parties</Text>
          ) : (
            <DrawerDropdown
              label="Select Party"
              value={formData.party_id}
              placeholder="Select Party"
              options={partyOptions}
              onSelect={(value) => {
                setFormData({ ...formData, party_id: value });
                if (errors.party_id) setErrors({ ...errors, party_id: undefined });
              }}
              error={errors.party_id}
              required={true}
            />
          )}
          {/* Amount Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Amount
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.amount && styles.errorInput]}
              value={formData.amount ? String(formData.amount) : ''}
              onChangeText={(text) => {
                setFormData({ ...formData, amount: Number(text) });
                if (errors.amount) {
                  setErrors({ ...errors, amount: undefined });
                }
              }}
              placeholder="Enter amount"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
          </View>
          {/* Remarks Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={[styles.textArea, errors.remarks && styles.errorInput]}
              value={formData.remarks}
              onChangeText={(text) => setFormData({ ...formData, remarks: text })}
              placeholder="Enter remarks (optional)"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              ref={remarksInputRef}
              onFocus={() => {
                // Automatically scroll to remarks field when focused
                setTimeout(() => {
                  formWrapperRef.current?.scrollToRemarks();
                }, 150);
              }}
            />
            {errors.remarks && <Text style={styles.errorText}>{errors.remarks}</Text>}
          </View>
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid() || isSubmitting) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={[
                  styles.submitButtonText,
                  (!isFormValid() || isSubmitting) && styles.disabledButtonText
                ]}>
                  Submit
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </FormWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  overlayErrorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  orangeAccent: {
    width: 4,
    height: 20,
    backgroundColor: '#f97316',
    borderRadius: 2,
  },
  formContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  dateInputContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  dateIcon: {
    marginLeft: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
    color: '#1f2937',
    minHeight: 80,
  },
  errorInput: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  disabledButtonText: {
    color: '#ffffff',
    opacity: 0.8,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});