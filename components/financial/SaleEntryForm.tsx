import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import DrawerDropdown from './DrawerDropdown';

interface ProductRow {
  id: string;
  size: string;
  gred: string;
  thickness: string;
  finish: string;
  qty: string;
  remarks: string;
}

interface SaleEntryData {
  saleDate: Date;
  party: string;
  billNo: string;
  totalBillQty: string;
  ins: string;
  gst: string;
  totalBill: string;
  remarks: string;
  products: ProductRow[];
}

const partyOptions = [
  { label: 'Customer A', value: 'Customer A' },
  { label: 'Customer B', value: 'Customer B' },
  { label: 'Customer C', value: 'Customer C' },
  { label: 'Customer D', value: 'Customer D' },
];

const sizeOptions = [
  { label: '4x8', value: '4x8' },
  { label: '4x6', value: '4x6' },
  { label: '3x8', value: '3x8' },
  { label: '3x6', value: '3x6' },
];

const gredOptions = [
  { label: 'A Grade', value: 'A Grade' },
  { label: 'B Grade', value: 'B Grade' },
  { label: 'C Grade', value: 'C Grade' },
  { label: 'Premium', value: 'Premium' },
];

const thicknessOptions = [
  { label: '0.8mm', value: '0.8mm' },
  { label: '1.0mm', value: '1.0mm' },
  { label: '1.2mm', value: '1.2mm' },
  { label: '1.5mm', value: '1.5mm' },
];

const finishOptions = [
  { label: 'Glossy', value: 'Glossy' },
  { label: 'Matte', value: 'Matte' },
  { label: 'Textured', value: 'Textured' },
  { label: 'Satin', value: 'Satin' },
];

export default function SaleEntryForm() {
  const [formData, setFormData] = useState<SaleEntryData>({
    saleDate: new Date(),
    party: '',
    billNo: '',
    totalBillQty: '',
    ins: '',
    gst: '',
    totalBill: '',
    remarks: '',
    products: [
      {
        id: '1',
        size: '',
        gred: '',
        thickness: '',
        finish: '',
        qty: '',
        remarks: '',
      }
    ],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SaleEntryData, string>>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof SaleEntryData, string>> = {};
    
    if (!formData.saleDate) newErrors.saleDate = 'Sale date is required';
    if (!formData.party) newErrors.party = 'Party is required';
    if (!formData.billNo) newErrors.billNo = 'Bill number is required';
    if (!formData.totalBillQty) newErrors.totalBillQty = 'Total bill quantity is required';
    else if (isNaN(Number(formData.totalBillQty)) || Number(formData.totalBillQty) <= 0) {
      newErrors.totalBillQty = 'Total bill quantity must be a valid positive number';
    }
    if (!formData.ins) newErrors.ins = 'Ins is required';
    else if (isNaN(Number(formData.ins)) || Number(formData.ins) < 0) {
      newErrors.ins = 'Ins must be a valid number';
    }
    if (!formData.gst) newErrors.gst = 'GST is required';
    else if (isNaN(Number(formData.gst)) || Number(formData.gst) < 0) {
      newErrors.gst = 'GST must be a valid number';
    }
    if (!formData.totalBill) newErrors.totalBill = 'Total bill is required';
    else if (isNaN(Number(formData.totalBill)) || Number(formData.totalBill) <= 0) {
      newErrors.totalBill = 'Total bill must be a valid positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      formData.saleDate &&
      formData.party &&
      formData.billNo &&
      formData.totalBillQty &&
      !isNaN(Number(formData.totalBillQty)) &&
      Number(formData.totalBillQty) > 0 &&
      formData.ins &&
      !isNaN(Number(formData.ins)) &&
      Number(formData.ins) >= 0 &&
      formData.gst &&
      !isNaN(Number(formData.gst)) &&
      Number(formData.gst) >= 0 &&
      formData.totalBill &&
      !isNaN(Number(formData.totalBill)) &&
      Number(formData.totalBill) > 0
    );
  };

  const handleSubmit = () => {
    if (validateForm()) {
      Alert.alert('Success', 'Sale entry submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setFormData({
              saleDate: new Date(),
              party: '',
              billNo: '',
              totalBillQty: '',
              ins: '',
              gst: '',
              totalBill: '',
              remarks: '',
              products: [
                {
                  id: '1',
                  size: '',
                  gred: '',
                  thickness: '',
                  finish: '',
                  qty: '',
                  remarks: '',
                }
              ],
            });
            setErrors({});
          }
        }
      ]);
    }
  };

  const handleCancel = () => {
    setFormData({
      saleDate: new Date(),
      party: '',
      billNo: '',
      totalBillQty: '',
      ins: '',
      gst: '',
      totalBill: '',
      remarks: '',
      products: [
        {
          id: '1',
          size: '',
          gred: '',
          thickness: '',
          finish: '',
          qty: '',
          remarks: '',
        }
      ],
    });
    setErrors({});
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setFormData({ ...formData, saleDate: selectedDate });
      if (errors.saleDate) {
        setErrors({ ...errors, saleDate: undefined });
      }
    }
  };

  const showDatePickerModal = () => {
    if (Platform.OS === 'web') {
      const dateString = prompt('Enter date (DD-MM-YYYY)', formatDate(formData.saleDate));
      if (dateString) {
        const [day, month, year] = dateString.split('-').map(Number);
        if (day && month && year) {
          const newDate = new Date(year, month - 1, day);
          if (!isNaN(newDate.getTime())) {
            setFormData({ ...formData, saleDate: newDate });
            if (errors.saleDate) {
              setErrors({ ...errors, saleDate: undefined });
            }
          }
        }
      }
    } else {
      setShowDatePicker(true);
    }
  };

  const updateProductRow = (id: string, field: keyof ProductRow, value: string) => {
    setFormData({
      ...formData,
      products: formData.products.map(product =>
        product.id === id ? { ...product, [field]: value } : product
      )
    });
  };

  const addProductRow = () => {
    const newId = (formData.products.length + 1).toString();
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          id: newId,
          size: '',
          gred: '',
          thickness: '',
          finish: '',
          qty: '',
          remarks: '',
        }
      ]
    });
  };

  const removeProductRow = (id: string) => {
    if (formData.products.length > 1) {
      setFormData({
        ...formData,
        products: formData.products.filter(product => product.id !== id)
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.formTitle}>Add Sale Entry</Text>
          <View style={styles.cyanAccent} />
        </View>

        <View style={styles.formContent}>
          {/* Sale Date Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Sale Date
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TouchableOpacity 
              style={[styles.dateInputContainer, errors.saleDate && styles.errorInput]}
              onPress={showDatePickerModal}
            >
              <Text style={styles.dateText}>{formatDate(formData.saleDate)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" style={styles.dateIcon} />
            </TouchableOpacity>
            {errors.saleDate && <Text style={styles.errorText}>{errors.saleDate}</Text>}
          </View>

          {/* Date Picker Modal */}
          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={formData.saleDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Party Dropdown */}
          <DrawerDropdown
            label="Select Party"
            value={formData.party}
            placeholder="Select Party"
            options={partyOptions}
            onSelect={(value) => {
              setFormData({ ...formData, party: value });
              if (errors.party) setErrors({ ...errors, party: undefined });
            }}
            error={errors.party}
            required={true}
          />

          {/* Bill No Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Bill No
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.billNo && styles.errorInput]}
              value={formData.billNo}
              onChangeText={(text) => {
                setFormData({ ...formData, billNo: text });
                if (errors.billNo) {
                  setErrors({ ...errors, billNo: undefined });
                }
              }}
              placeholder="Bill No"
              placeholderTextColor="#9ca3af"
            />
            {errors.billNo && <Text style={styles.errorText}>{errors.billNo}</Text>}
          </View>

          {/* Total Bill QTY Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Total Bill QTY
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.totalBillQty && styles.errorInput]}
              value={formData.totalBillQty}
              onChangeText={(text) => {
                setFormData({ ...formData, totalBillQty: text });
                if (errors.totalBillQty) {
                  setErrors({ ...errors, totalBillQty: undefined });
                }
              }}
              placeholder="Total Bill QTY"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.totalBillQty && <Text style={styles.errorText}>{errors.totalBillQty}</Text>}
          </View>

          {/* Ins Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Ins
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.ins && styles.errorInput]}
              value={formData.ins}
              onChangeText={(text) => {
                setFormData({ ...formData, ins: text });
                if (errors.ins) {
                  setErrors({ ...errors, ins: undefined });
                }
              }}
              placeholder="Ins"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.ins && <Text style={styles.errorText}>{errors.ins}</Text>}
          </View>

          {/* GST Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              GST
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.gst && styles.errorInput]}
              value={formData.gst}
              onChangeText={(text) => {
                setFormData({ ...formData, gst: text });
                if (errors.gst) {
                  setErrors({ ...errors, gst: undefined });
                }
              }}
              placeholder="GST"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.gst && <Text style={styles.errorText}>{errors.gst}</Text>}
          </View>

          {/* Total Bill Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Total Bill
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.totalBill && styles.errorInput]}
              value={formData.totalBill}
              onChangeText={(text) => {
                setFormData({ ...formData, totalBill: text });
                if (errors.totalBill) {
                  setErrors({ ...errors, totalBill: undefined });
                }
              }}
              placeholder="Total Bill"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
            {errors.totalBill && <Text style={styles.errorText}>{errors.totalBill}</Text>}
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

          {/* Product Details Section */}
          <View style={styles.productSectionContainer}>
            <View style={styles.productSectionHeader}>
              <Text style={styles.productSectionTitle}>Product Details</Text>
              <TouchableOpacity style={styles.addRowButton} onPress={addProductRow}>
                <Ionicons name="add" size={16} color="#ffffff" />
                <Text style={styles.addRowButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>

            {/* Product Cards */}
            {formData.products.map((product, index) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productCardHeader}>
                  <Text style={styles.productCardTitle}>Product {index + 1}</Text>
                  {formData.products.length > 1 && (
                    <TouchableOpacity
                      style={styles.deleteProductButton}
                      onPress={() => removeProductRow(product.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.productCardContent}>
                  {/* Size Dropdown */}
                  <DrawerDropdown
                    label="Size"
                    value={product.size}
                    placeholder="Select Size"
                    options={sizeOptions}
                    onSelect={(value) => updateProductRow(product.id, 'size', value)}
                  />

                  {/* Gred Dropdown */}
                  <DrawerDropdown
                    label="Gred"
                    value={product.gred}
                    placeholder="Select Gred"
                    options={gredOptions}
                    onSelect={(value) => updateProductRow(product.id, 'gred', value)}
                  />

                  {/* Thickness Dropdown */}
                  <DrawerDropdown
                    label="Thickness"
                    value={product.thickness}
                    placeholder="Select Thickness"
                    options={thicknessOptions}
                    onSelect={(value) => updateProductRow(product.id, 'thickness', value)}
                  />

                  {/* Finish Dropdown */}
                  <DrawerDropdown
                    label="Finish"
                    value={product.finish}
                    placeholder="Select Finish"
                    options={finishOptions}
                    onSelect={(value) => updateProductRow(product.id, 'finish', value)}
                  />

                  {/* Quantity Field */}
                  <View style={styles.productFieldContainer}>
                    <Text style={styles.productLabel}>Quantity</Text>
                    <TextInput
                      style={styles.productInput}
                      value={product.qty}
                      onChangeText={(text) => updateProductRow(product.id, 'qty', text)}
                      placeholder="Enter quantity"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Remarks Field */}
                  <View style={styles.productFieldContainer}>
                    <Text style={styles.productLabel}>Remarks</Text>
                    <TextInput
                      style={styles.productTextArea}
                      value={product.remarks}
                      onChangeText={(text) => updateProductRow(product.id, 'remarks', text)}
                      placeholder="Enter remarks (optional)"
                      placeholderTextColor="#9ca3af"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                !isFormValid() && styles.disabledButton
              ]} 
              onPress={handleSubmit}
              disabled={!isFormValid()}
            >
              <Text style={[
                styles.submitButtonText,
                !isFormValid() && styles.disabledButtonText
              ]}>
                Submit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
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
    marginBottom: 20,
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
  cyanAccent: {
    width: 4,
    height: 20,
    backgroundColor: '#06B6D4',
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
  productSectionContainer: {
    marginBottom: 20,
  },
  productSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  addRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06B6D4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  addRowButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  productCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  productCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e2e8f0',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  productCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  deleteProductButton: {
    padding: 4,
  },
  productCardContent: {
    padding: 16,
  },
  productFieldContainer: {
    marginBottom: 16,
  },
  productLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  productInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
    color: '#1f2937',
    minHeight: 42,
  },
  productTextArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
    color: '#1f2937',
    minHeight: 70,
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