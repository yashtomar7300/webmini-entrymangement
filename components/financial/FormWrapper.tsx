import React, { forwardRef, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

interface FormWrapperProps {
  children: React.ReactNode;
  style?: any;
}

export interface FormWrapperRef {
  scrollToRemarks: () => void;
}

const FormWrapper = forwardRef<FormWrapperRef, FormWrapperProps>(({ children, style }, ref) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Function to scroll to bottom when remarks field is focused
  const scrollToRemarks = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Expose the scroll function to parent components
  React.useImperativeHandle(ref, () => ({
    scrollToRemarks,
  }));

  return (
    <KeyboardAvoidingView 
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        alwaysBounceVertical={false}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        nestedScrollEnabled={true}
      >
        {children}
        {/* Add extra space at the bottom to ensure remarks field is visible */}
        <View style={styles.extraSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

FormWrapper.displayName = 'FormWrapper';

export default FormWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10, // Reduced padding since we're adding extra space
  },
  extraSpace: {
    height: 110, // Large extra space to ensure remarks field is always visible
  },
}); 