import { useParties } from '@/hooks/api/creditEntryForm/useParties';
import { usePurchaseMaterials } from '@/hooks/api/creditEntryForm/usePurchaseMaterials';
import formatDate from '@/utils/formatDate';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import qs from 'qs';
import { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DrawerDropdown from './DrawerDropdown';

interface PurchaseEntryData {
  purchase_date: string;
  party_id: string;
  bill_no: string;
  material_id: string;
  qty: string;
  truck_no: string;
  truck_rent: string;
  labour_charge: string;
  waybridge_charge: string;
  remarks: string;
}

const PURCHASE_ENTRY_API = '/purchase_entry.php';

export default function PurchaseEntryForm() {
  const { options: partyOptions, loading: partiesLoading, error: partiesError } = useParties();
  const { options: purchaseMaterialOptions, loading: materialsLoading, error: materialsError } = usePurchaseMaterials();
  const [formData, setFormData] = useState<PurchaseEntryData>({
    purchase_date: formatDate(new Date()),
    party_id: '',
    bill_no: '',
    material_id: '',
    qty: '',
    truck_no: '',
    truck_rent: '',
    labour_charge: '',
    waybridge_charge: '',
    remarks: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PurchaseEntryData, string>>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof PurchaseEntryData, string>> = {};

    if (!formData.purchase_date) newErrors.purchase_date = 'Purchase date is required';
    if (!formData.party_id) newErrors.party_id = 'Party is required';
    if (!formData.bill_no) newErrors.bill_no = 'Bill number is required';
    if (!formData.material_id) newErrors.material_id = 'Purchase material is required';
    if (!formData.qty) newErrors.qty = 'Quantity is required';
    else if (isNaN(Number(formData.qty)) || Number(formData.qty) <= 0) {
      newErrors.qty = 'Quantity must be a valid positive number';
    }
    if (!formData.truck_no) newErrors.truck_no = 'Truck number is required';
    if (!formData.truck_rent) newErrors.truck_rent = 'Truck rent is required';
    else if (isNaN(Number(formData.truck_rent)) || Number(formData.truck_rent) < 0) {
      newErrors.truck_rent = 'Truck rent must be a valid number';
    }
    if (!formData.labour_charge) newErrors.labour_charge = 'Labour charge is required';
    else if (isNaN(Number(formData.labour_charge)) || Number(formData.labour_charge) < 0) {
      newErrors.labour_charge = 'Labour charge must be a valid number';
    }
    if (!formData.waybridge_charge) newErrors.waybridge_charge = 'Waybridge charge is required';
    else if (isNaN(Number(formData.waybridge_charge)) || Number(formData.waybridge_charge) < 0) {
      newErrors.waybridge_charge = 'Waybridge charge must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      formData.purchase_date &&
      formData.party_id &&
      formData.bill_no &&
      formData.material_id &&
      formData.qty &&
      !isNaN(Number(formData.qty)) &&
      Number(formData.qty) > 0 &&
      formData.truck_no &&
      formData.truck_rent &&
      !isNaN(Number(formData.truck_rent)) &&
      Number(formData.truck_rent) >= 0 &&
      formData.labour_charge &&
      !isNaN(Number(formData.labour_charge)) &&
      Number(formData.labour_charge) >= 0 &&
      formData.waybridge_charge &&
      !isNaN(Number(formData.waybridge_charge)) &&
      Number(formData.waybridge_charge) >= 0
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
        apiUrl + PURCHASE_ENTRY_API,
        qs.stringify({...formData, user_id:"1"}),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log(response, "purchase entry submit response");

      if (response.data.res === 1) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setFormData({
            purchase_date: formatDate(new Date()),
            party_id: '',
            bill_no: '',
            material_id: '',
            qty: '',
            truck_no: '',
            truck_rent: '',
            labour_charge: '',
            waybridge_charge: '',
            remarks: '',
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
      console.log(error, "- purchase entry submit error");
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
      purchase_date: formatDate(new Date()),
      party_id: '',
      bill_no: '',
      material_id: '',
      qty: '',
      truck_no: '',
      truck_rent: '',
      labour_charge: '',
      waybridge_charge: '',
      remarks: '',
    });
    setErrors({});
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setFormData({ ...formData, purchase_date: formatDate(selectedDate) });
      if (errors.purchase_date) {
        setErrors({ ...errors, purchase_date: undefined });
      }
    }
  };

  const showDatePickerModal = () => {
    if (Platform.OS === 'web') {
      const dateString = prompt('Enter date (DD-MM-YYYY)', formData.purchase_date);
      if (dateString) {
        const [day, month, year] = dateString.split('-').map(Number);
        if (day && month && year) {
          const newDate = new Date(year, month - 1, day);
          if (!isNaN(newDate.getTime())) {
            setFormData({ ...formData, purchase_date: formatDate(newDate) });
            if (errors.purchase_date) {
              setErrors({ ...errors, purchase_date: undefined });
            }
          }
        }
      }
    } else {
      setShowDatePicker(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Success Animation */}
      {showSuccess && (
        <View style={styles.overlay}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#ffffff" />
            </View>
            <Text style={styles.successText}>Purchase Entry Submitted Successfully!</Text>
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
            <Text style={styles.overlayErrorText}>Failed to submit purchase entry. Please try again.</Text>
          </View>
        </View>
      )}

      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.formTitle}>Add Purchase Entry</Text>
          <View style={styles.tealAccent} />
        </View>

        <View style={styles.formContent}>
          {/* Purchase Date Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Purchase Date
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TouchableOpacity
              style={[styles.dateInputContainer, errors.purchase_date && styles.errorInput]}
              onPress={showDatePickerModal}
            >
              <Text style={styles.dateText}>{formData.purchase_date}</Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" style={styles.dateIcon} />
            </TouchableOpacity>
            {errors.purchase_date && <Text style={styles.errorText}>{errors.purchase_date}</Text>}
          </View>

          {/* Date Picker Modal */}
          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={formData.purchase_date ? new Date(formData.purchase_date.split('-').reverse().join('-')) : new Date()}
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

          {/* Purchase Material Dropdown */}
          {materialsLoading ? (
            <View style={{ marginVertical: 16 }}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : materialsError ? (
            <Text style={{ color: '#EF4444', marginBottom: 12 }}>Failed to load purchase materials</Text>
          ) : (
            <DrawerDropdown
              label="Purchase Material"
              value={formData.material_id}
              placeholder="Select Purchase Material"
              options={purchaseMaterialOptions}
              onSelect={(value) => {
                setFormData({ ...formData, material_id: value });
                if (errors.material_id) setErrors({ ...errors, material_id: undefined });
              }}
              error={errors.material_id}
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
                setFormData({ ...formData, qty: text });
                if (errors.qty) {
                  setErrors({ ...errors, qty: undefined });
                }
              }}
              placeholder="Qty"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.qty && <Text style={styles.errorText}>{errors.qty}</Text>}
          </View>

          {/* Truck No Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Truck No
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.truck_no && styles.errorInput]}
              value={formData.truck_no}
              onChangeText={(text) => {
                setFormData({ ...formData, truck_no: text });
                if (errors.truck_no) {
                  setErrors({ ...errors, truck_no: undefined });
                }
              }}
              placeholder="Truck No"
              placeholderTextColor="#9ca3af"
            />
            {errors.truck_no && <Text style={styles.errorText}>{errors.truck_no}</Text>}
          </View>

          {/* Truck Rent Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Truck Rent
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.truck_rent && styles.errorInput]}
              value={formData.truck_rent}
              onChangeText={(text) => {
                setFormData({ ...formData, truck_rent: text });
                if (errors.truck_rent) {
                  setErrors({ ...errors, truck_rent: undefined });
                }
              }}
              placeholder="Truck Rent"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.truck_rent && <Text style={styles.errorText}>{errors.truck_rent}</Text>}
          </View>

          {/* Labour Charge Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Labour Charge
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.labour_charge && styles.errorInput]}
              value={formData.labour_charge}
              onChangeText={(text) => {
                setFormData({ ...formData, labour_charge: text });
                if (errors.labour_charge) {
                  setErrors({ ...errors, labour_charge: undefined });
                }
              }}
              placeholder="Labour Charge"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.labour_charge && <Text style={styles.errorText}>{errors.labour_charge}</Text>}
          </View>

          {/* Waybridge Charge Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Waybridge Charge
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.waybridge_charge && styles.errorInput]}
              value={formData.waybridge_charge}
              onChangeText={(text) => {
                setFormData({ ...formData, waybridge_charge: text });
                if (errors.waybridge_charge) {
                  setErrors({ ...errors, waybridge_charge: undefined });
                }
              }}
              placeholder="Waybridge Charge"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.waybridge_charge && <Text style={styles.errorText}>{errors.waybridge_charge}</Text>}
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
    </View>
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
  tealAccent: {
    width: 4,
    height: 20,
    backgroundColor: '#14B8A6',
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