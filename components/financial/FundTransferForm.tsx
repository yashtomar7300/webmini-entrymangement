import { useAccounts } from '@/hooks/api/creditEntryForm/useAccounts';
import { usePaymentModes } from '@/hooks/api/creditEntryForm/usePaymentModes';
import { useAuth } from '@/hooks/useAuth';
import formatDate from '@/utils/formatDate';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import qs from 'qs';
import { useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DrawerDropdown from './DrawerDropdown';
import FormWrapper, { FormWrapperRef } from './FormWrapper';

interface FundTransferData {
  date: string;
  type: '1' | '2' | '';
  from_account_id: string;
  payment_mode_id: string;
  amount: string;
  remarks: string;
  user_id: string;
}

const FUND_TRANSFER_API = '/account_transfer_entry.php';

export default function FundTransferForm() {
  const { options: paymentModeOptions, loading: paymentModesLoading, error: paymentModesError } = usePaymentModes();
  const { options: accountOptions, loading: accountsLoading, error: accountsError } = useAccounts();
  const {user} = useAuth();
  const remarksInputRef = useRef<TextInput>(null);
  const formWrapperRef = useRef<FormWrapperRef>(null);
  const [formData, setFormData] = useState<FundTransferData>({
    date: formatDate(new Date()),
    type: '',
    from_account_id: '',
    payment_mode_id: '',
    amount: '',
    remarks: '',
    user_id: ""
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FundTransferData, string>>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FundTransferData, string>> = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.type) newErrors.type = 'Payment type is required';
    if (!formData.from_account_id) newErrors.from_account_id = 'Account is required';
    if (!formData.payment_mode_id) newErrors.payment_mode_id = 'Payment mode is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';
    else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      formData.date &&
      formData.type &&
      formData.from_account_id &&
      formData.payment_mode_id &&
      formData.amount &&
      !isNaN(Number(formData.amount)) &&
      Number(formData.amount) > 0
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    console.log(formData, "- formData");
    
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    const apiUrl = "https://cmp2023.webmini.in/api";
    try {
      const response = await axios.post(
        apiUrl + FUND_TRANSFER_API,
        qs.stringify({ ...formData, user_id: user?.id }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log(response, "fund transfer submit response");

      if (response.data.res === 1) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setFormData({
            date: formatDate(new Date()),
            type: '',
            from_account_id: '',
            payment_mode_id: '',
            amount: '',
            remarks: '',
            user_id: '1',
          });
          setErrors({});
        }, 2000);
      } else {
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
        }, 3000);
      }
    } catch (error) {
      console.log(error, "- fund transfer submit error");
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      date: formatDate(new Date()),
      type: '',
      from_account_id: '',
      payment_mode_id: '',
      amount: '',
      remarks: '',
      user_id: "1"
    });
    setErrors({});
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
        const [day, month, year] = dateString.split('-').map(Number);
        if (day && month && year) {
          const newDate = new Date(year, month - 1, day);
          if (!isNaN(newDate.getTime())) {
            setFormData({ ...formData, date: formatDate(newDate) });
            if (errors.date) {
              setErrors({ ...errors, date: undefined });
            }
          }
        }
      }
    } else {
      setShowDatePicker(true);
    }
  };

  const RadioButton = ({ selected, onPress, label }: { selected: boolean; onPress: () => void; label: string }) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
      <View style={[styles.radioCircle, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <FormWrapper ref={formWrapperRef}>
      {/* Success Animation */}
      {showSuccess && (
        <View style={styles.overlay}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#ffffff" />
            </View>
            <Text style={styles.successText}>Fund Transfer Submitted Successfully!</Text>
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
            <Text style={styles.overlayErrorText}>Failed to submit fund transfer. Please try again.</Text>
          </View>
        </View>
      )}

      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.formTitle}>Add Fund Transfer</Text>
          <View style={styles.purpleAccent} />
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

          {/* Payment Type Radio Buttons */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Payment Type
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <View style={styles.radioGroup}>
              <RadioButton
                selected={formData.type === '1'}
                onPress={() => {
                  setFormData({ ...formData, type: '1' });
                  if (errors.type) setErrors({ ...errors, type: undefined });
                }}
                label="Credit"
              />
              <RadioButton
                selected={formData.type === '2'}
                onPress={() => {
                  setFormData({ ...formData, type: '2' });
                  if (errors.type) setErrors({ ...errors, type: undefined });
                }}
                label="Debit"
              />
            </View>
            {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
          </View>

          {/* Account Dropdown */}
          {accountsLoading ? (
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

          {/* Amount Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Amount
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.amount && styles.errorInput]}
              value={formData.amount}
              onChangeText={(text) => {
                setFormData({ ...formData, amount: text });
                if (errors.amount) {
                  setErrors({ ...errors, amount: undefined });
                }
              }}
              placeholder="Amount"
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
              placeholder="Remarks"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              ref={remarksInputRef}
              onFocus={() => {
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
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={isSubmitting}>
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
  purpleAccent: {
    width: 4,
    height: 20,
    backgroundColor: '#8B5CF6',
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
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#8B5CF6',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
  },
  radioLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
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
});