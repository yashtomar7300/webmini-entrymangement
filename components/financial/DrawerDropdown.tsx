import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, KeyboardAvoidingView, Modal, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DropdownOption {
  label: string;
  value: string;
}

interface DrawerDropdownProps {
  label: string;
  value: string;
  placeholder: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export default function DrawerDropdown({
  label,
  value,
  placeholder,
  options,
  onSelect,
  error,
  required = false,
  disabled = false,
}: DrawerDropdownProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  const selectedOption = options.find(option => option.value === value);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsVisible(false);
    setSearchQuery(''); // Clear search when option is selected
  };

  const openDrawer = () => {
    setIsVisible(true);
    setSearchQuery(''); // Clear search when opening
    // Removed autofocus to prevent keyboard from opening automatically
    // This allows single-tap selection of options
  };

  const closeDrawer = () => {
    setIsVisible(false);
    setSearchQuery(''); // Clear search when closing
    searchInputRef.current?.blur();
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>

        <TouchableOpacity
           style={[styles.trigger, error && styles.errorInput, disabled && styles.disabledTrigger]}
           onPress={() => {
             if (!disabled) openDrawer();
           }}
           activeOpacity={0.7}
           disabled={disabled} 
        >
          <Text style={[styles.triggerText, !value && styles.placeholderText]}>
            {selectedOption?.label || placeholder}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeDrawer}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeDrawer}
          />

          {/* Drawer Content */}
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? (StatusBar.currentHeight || 0) : (StatusBar.currentHeight || 0) + 20}
          >
            <View style={styles.drawerContainer}>
              {/* Header */}
              <View style={styles.drawerHeader}>
                <View style={styles.dragHandle} />
                <View style={styles.headerContent}>
                  <Text style={styles.drawerTitle}>{label}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeDrawer}
                  >
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Bar */}
              {label === "Select Party" && <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder={`Search ${label.toLowerCase()}...`}
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    // autoFocus={false}
                    returnKeyType="search"
                    clearButtonMode="never"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => setSearchQuery('')}
                    >
                      <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>}

              {/* Options List */}
              <View style={styles.optionsContainer}>
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item) => item.value}
                  showsVerticalScrollIndicator={false}
                  style={styles.optionsList}
                  contentContainerStyle={styles.optionsListContent}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="none"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        item.value === value && styles.selectedOption
                      ]}
                      onPress={() => handleSelect(item.value)}
                      activeOpacity={0.6}
                    >
                      <Text style={[
                        styles.optionText,
                        item.value === value && styles.selectedOptionText
                      ]}>
                        {item.label}
                      </Text>
                      {item.value === value && (
                        <View style={styles.checkContainer}>
                          <Ionicons name="checkmark" size={20} color="#3B82F6" />
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="search-outline" size={48} color="#9ca3af" />
                      <Text style={styles.emptyText}>No {label.toLowerCase()} found</Text>
                      <Text style={styles.emptySubtext}>Try adjusting your search</Text>
                    </View>
                  )}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
  trigger: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  triggerText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  errorInput: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: screenHeight * 0.7,
    minHeight: screenHeight * 0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  drawerHeader: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  optionsContainer: {
    backgroundColor: '#ffffff',
    // flex: 1, // REMOVE THIS LINE
  },
  optionsList: {
    flexGrow: 1,
    minHeight: 0,
    paddingHorizontal: 20,
  },
  optionsListContent: {
    paddingBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    minHeight: 56,
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  checkContainer: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchInputContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  disabledTrigger: {
    backgroundColor: '#f8fafc',
    borderColor: '#d1d5db',
    cursor: "not-allowed",
    opacity: 0.5,
  },
});