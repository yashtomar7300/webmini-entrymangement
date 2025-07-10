import { useRefresh } from '@/contexts/RefreshContext';
import { useAccounts } from '@/hooks/api/entryForms/useAccounts';
import { useOtherMaterials } from '@/hooks/api/entryForms/useOtherMaterials';
import { useParties } from '@/hooks/api/entryForms/useParties';
import { usePaymentModes } from '@/hooks/api/entryForms/usePaymentModes';
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

interface OtherEntryData {
  other_entry_type: '1' | '2' | '';
  other_sale_date: string;
  party_id: string;
  sale_type: string;
  bill_no: string;
  material: string;
  qty: string;
  rate: string;
  total: string;
  remarks: string;
  user_id: string;
}

const paymentTypeOptions = [
  { label: 'Cash', value: 'Cash' },
  { label: 'Bill', value: 'Bill' },
];

const OTHER_ENTRY_API = '/other_entry.php';

export default function OtherEntryForm() {
  const { options: paymentModeOptions, loading: paymentModesLoading, error: paymentModesError } = usePaymentModes();
  const { options: accountOptions, loading: accountsLoading, error: accountsError } = useAccounts();
  const { options: partyOptions, loading: partiesLoading, error: partiesError } = useParties();
  const { options: otherMaterialOptions, loading: materialsLoading, error: materialsError } = useOtherMaterials();
  const { user } = useAuth();
  const remarksInputRef = useRef<TextInput>(null);
  const formWrapperRef = useRef<FormWrapperRef>(null);
  const [formData, setFormData] = useState<OtherEntryData>({
    other_entry_type: '',
    other_sale_date: formatDate(new Date()),
    party_id: '',
    sale_type: '',
    bill_no: '',
    material: '',
    qty: '',
    rate: '',
    total: '',
    remarks: '',
    user_id: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof OtherEntryData, string>>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const { triggerRefresh } = useRefresh();

  const validateForm = () => {
    const newErrors: Partial<Record<keyof OtherEntryData, string>> = {};

    if (!formData.other_entry_type) newErrors.other_entry_type = 'Entry type is required';
    if (!formData.other_sale_date) newErrors.other_sale_date = 'Date is required';
    if (!formData.party_id) newErrors.party_id = 'Party is required';
    if (!formData.sale_type) newErrors.sale_type = 'Payment type is required';
    if (!formData.bill_no) newErrors.bill_no = 'Bill number is required';
    if (!formData.material) newErrors.material = 'Material is required';
    if (!formData.qty) newErrors.qty = 'Quantity is required';
    else if (isNaN(Number(formData.qty)) || Number(formData.qty) <= 0) {
      newErrors.qty = 'Quantity must be a valid positive number';
    }
    if (!formData.rate) newErrors.rate = 'Rate is required';
    else if (isNaN(Number(formData.rate)) || Number(formData.rate) <= 0) {
      newErrors.rate = 'Rate must be a valid positive number';
    }
    if (!formData.total) newErrors.total = 'Total is required';
    else if (isNaN(Number(formData.total)) || Number(formData.total) <= 0) {
      newErrors.total = 'Total must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      formData.other_entry_type &&
      formData.other_sale_date &&
      formData.party_id &&
      formData.sale_type &&
      formData.bill_no &&
      formData.material &&
      formData.qty &&
      !isNaN(Number(formData.qty)) &&
      Number(formData.qty) > 0 &&
      formData.rate &&
      !isNaN(Number(formData.rate)) &&
      Number(formData.rate) > 0 &&
      formData.total &&
      !isNaN(Number(formData.total)) &&
      Number(formData.total) > 0
    );
  };
  const resetForm = () => {
    setFormData({
      other_entry_type: '',
      other_sale_date: formatDate(new Date()),
      party_id: '',
      sale_type: '',
      bill_no: '',
      material: '',
      qty: '',
      rate: '',
      total: '',
      remarks: '',
      user_id: ''
    });
  }

  const handleSubmit = async () => {
    if (!validateForm()) return;
    console.log(formData, "- formData");

    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    const apiUrl = "https://cmp2023.webmini.in/api";
    try {
      const response = await axios.post(
        apiUrl + OTHER_ENTRY_API,
        qs.stringify({ ...formData, user_id: user?.id }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log(response, "other entry submit response");

      if (response.data.res === 1) {
        setShowSuccess(true);
        resetForm();
        triggerRefresh();
        setTimeout(() => {
          setShowSuccess(false);
          setErrors({});
        }, 2000);
      } else {
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
        }, 3000);
      }
    } catch (error) {
      console.log(error, "- other entry submit error");
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    } finally {
      resetForm();
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setErrors({});
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setFormData({ ...formData, other_sale_date: formatDate(new Date()) });
      if (errors.other_sale_date) {
        setErrors({ ...errors, other_sale_date: undefined });
      }
    }
  };

  const showDatePickerModal = () => {
    if (Platform.OS === 'web') {
      const dateString = prompt('Enter date (DD-MM-YYYY)', formData.other_sale_date);
      if (dateString) {
        const [day, month, year] = dateString.split('-').map(Number);
        if (day && month && year) {
          const newDate = new Date(year, month - 1, day);
          if (!isNaN(newDate.getTime())) {
            setFormData({ ...formData, other_sale_date: formatDate(newDate) });
            if (errors.other_sale_date) {
              setErrors({ ...errors, other_sale_date: undefined });
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
            <Text style={styles.successText}>Other Entry Submitted Successfully!</Text>
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
            <Text style={styles.overlayErrorText}>Failed to submit other entry. Please try again.</Text>
          </View>
        </View>
      )}

      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.formTitle}>Add Other Entry</Text>
          <View style={styles.indigoAccent} />
        </View>

        <View style={styles.formContent}>
          {/* Entry Type Radio Buttons */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Entry Type
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <View style={styles.radioGroup}>
              <RadioButton
                selected={formData.other_entry_type === '1'}
                onPress={() => {
                  setFormData({ ...formData, other_entry_type: '1' });
                  if (errors.other_entry_type) setErrors({ ...errors, other_entry_type: undefined });
                }}
                label="Sale Entry"
              />
              <RadioButton
                selected={formData.other_entry_type === '2'}
                onPress={() => {
                  setFormData({ ...formData, other_entry_type: '2' });
                  if (errors.other_entry_type) setErrors({ ...errors, other_entry_type: undefined });
                }}
                label="Purchase Entry"
              />
            </View>
            {errors.other_entry_type && <Text style={styles.errorText}>{errors.other_entry_type}</Text>}
          </View>

          {/* Other Entry Date Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Other Entry Date
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TouchableOpacity
              style={[styles.dateInputContainer, errors.other_sale_date && styles.errorInput]}
              onPress={showDatePickerModal}
            >
              <Text style={styles.dateText}>{formData.other_sale_date}</Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" style={styles.dateIcon} />
            </TouchableOpacity>
            {errors.other_sale_date && <Text style={styles.errorText}>{errors.other_sale_date}</Text>}
          </View>

          {/* Date Picker Modal */}
          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              // value={formData.other_sale_date}
              value={formData.other_sale_date ? new Date(formData.other_sale_date.split('-').reverse().join('-')) : new Date()}

              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

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

          {/* Payment Type Dropdown */}
          <DrawerDropdown
            label="Payment Type"
            value={formData.sale_type}
            placeholder="Select Other Type"
            options={paymentTypeOptions}
            onSelect={(value) => {
              setFormData({ ...formData, sale_type: value });
              if (errors.sale_type) setErrors({ ...errors, sale_type: undefined });
            }}
            error={errors.sale_type}
            required={true}
          />

          {/* Bill No Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Bill No
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.bill_no && styles.errorInput]}
              value={formData.bill_no}
              onChangeText={(text) => {
                setFormData({ ...formData, bill_no: text });
                if (errors.bill_no) {
                  setErrors({ ...errors, bill_no: undefined });
                }
              }}
              placeholder="Bill No"
              placeholderTextColor="#9ca3af"
            />
            {errors.bill_no && <Text style={styles.errorText}>{errors.bill_no}</Text>}
          </View>

          {/* Material Dropdown */}
          {materialsLoading ? (
            <View style={{ marginVertical: 16 }}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : materialsError ? (
            <Text style={{ color: '#EF4444', marginBottom: 12 }}>Failed to load materials</Text>
          ) : (
            <DrawerDropdown
              label="Material"
              value={formData.material}
              placeholder="Select Other Material"
              options={otherMaterialOptions}
              onSelect={(value) => {
                setFormData({ ...formData, material: value });
                if (errors.material) setErrors({ ...errors, material: undefined });
              }}
              error={errors.material}
              required={true}
            />
          )}

          {/* Qty Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Qty
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.qty && styles.errorInput]}
              value={formData.qty}
              onChangeText={(text) => {
                const newQty = text;
                const newRate = formData.rate;
                const calculatedTotal = Number(newQty || 0) * Number(newRate || 0);
                setFormData({
                  ...formData,
                  qty: newQty,
                  total: calculatedTotal > 0 ? calculatedTotal.toString() : ''
                });
                if (errors.qty) {
                  setErrors({ ...errors, qty: undefined });
                }
                if (errors.total) {
                  setErrors({ ...errors, total: undefined });
                }
              }}
              placeholder="Qty"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.qty && <Text style={styles.errorText}>{errors.qty}</Text>}
          </View>

          {/* Rate Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Rate
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.rate && styles.errorInput]}
              value={formData.rate}
              onChangeText={(text) => {
                const newRate = text;
                const newQty = formData.qty;
                const calculatedTotal = Number(newQty || 0) * Number(newRate || 0);
                setFormData({
                  ...formData,
                  rate: newRate,
                  total: calculatedTotal > 0 ? calculatedTotal.toString() : ''
                });
                if (errors.rate) {
                  setErrors({ ...errors, rate: undefined });
                }
                if (errors.total) {
                  setErrors({ ...errors, total: undefined });
                }
              }}
              placeholder="Rate"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.rate && <Text style={styles.errorText}>{errors.rate}</Text>}
          </View>

          {/* Total Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Total
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.total && styles.errorInput]}
              value={formData.total}
              onChangeText={(text) => {
                setFormData({ ...formData, total: text });
                if (errors.total) {
                  setErrors({ ...errors, total: undefined });
                }
              }}
              placeholder="Total"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.total && <Text style={styles.errorText}>{errors.total}</Text>}
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
  indigoAccent: {
    width: 4,
    height: 20,
    backgroundColor: '#6366F1',
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
    borderColor: '#6366F1',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
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