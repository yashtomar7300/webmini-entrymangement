import { useAuth } from '@/hooks/useAuth';
import { Feather, FontAwesome } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successAnimation] = useState(new Animated.Value(0));
    const [errorAnimation] = useState(new Animated.Value(0));
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const usernameInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setErrorMessage('Please enter both username and password');
            showErrorAnimation();
            return;
        }
        setIsLoading(true);
        setErrorMessage('');
        console.log(username.trim(), ": username");
        console.log(password.trim(), ": password");
        
        try {
            const result = await login(username.trim(), password.trim());
            console.log(result, "- login result");
            
            if (result.success) {
                showSuccessAnimation();
            } else {
                setErrorMessage(result.message);
                showErrorAnimation();
            }
        } catch (error) {
            setErrorMessage('An unexpected error occurred');
            showErrorAnimation();
        } finally {
            setIsLoading(false);
        }
    };

    const showSuccessAnimation = () => {
        setIsSuccessVisible(true);
        Animated.sequence([
            Animated.timing(successAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(successAnimation, {
                toValue: 0,
                duration: 300,
                delay: 1500,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsSuccessVisible(false);
        });
    };

    const showErrorAnimation = () => {
        Animated.sequence([
            Animated.timing(errorAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(errorAnimation, {
                toValue: 0,
                duration: 300,
                delay: 3000,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <FontAwesome name="building" size={48} color="#3B82F6" />
                            </View>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.subtitle}>Sign in to your account</Text>
                        </View>

                        {/* Login Form */}
                        <View style={styles.form}>
                            {/* Username Input */}
                            <View style={[styles.inputContainer, { marginBottom: 20 }]}> 
                                <View style={styles.inputIcon}>
                                    <FontAwesome name="user" size={20} color="#6B7280" />
                                </View>
                                <TextInput
                                    ref={usernameInputRef}
                                    style={styles.input}
                                    placeholder="Username"
                                    placeholderTextColor="#9CA3AF"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                    onSubmitEditing={() => {
                                        passwordInputRef.current?.focus();
                                    }}
                                    editable={!isLoading}
                                />
                            </View>
                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputIcon}>
                                    <FontAwesome name="lock" size={20} color="#6B7280" />
                                </View>
                                <TextInput
                                    ref={passwordInputRef}
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    secureTextEntry={!showPassword}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowPassword(!showPassword)}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    disabled={isLoading}
                                >
                                    <Feather
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>
                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.loginButton, (isLoading || !username.trim() || !password.trim()) && styles.loginButtonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading || !username.trim() || !password.trim()}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Error Toast */}
                        {errorMessage ? (
                            <Animated.View
                                style={[
                                    styles.errorToast,
                                    {
                                        transform: [
                                            {
                                                translateY: errorAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-100, 0],
                                                }),
                                            },
                                        ],
                                        opacity: errorAnimation,
                                    },
                                ]}
                            >
                                <View style={styles.errorContent}>
                                    <Feather name="alert-circle" size={20} color="#FFFFFF" />
                                    <Text style={styles.errorText}>{errorMessage}</Text>
                                </View>
                            </Animated.View>
                        ) : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success Animation - Moved outside ScrollView to avoid blocking */}
            <Animated.View
                style={[
                    styles.overlay,
                    styles.successOverlay,
                    {
                        opacity: successAnimation,
                        transform: [
                            {
                                scale: successAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                            },
                        ],
                        pointerEvents: isSuccessVisible ? 'auto' : 'none',
                    },
                ]}
            >
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Feather name="check" size={32} color="#FFFFFF" />
                    </View>
                    <Text style={styles.successText}>Logged in successfully</Text>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    content: {
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    form: {},
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    passwordToggle: {
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        width: 40,
    },
    loginButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 20,
    },
    loginButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0.1,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    successOverlay: {
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
    },
    successContainer: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    successIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    successText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    errorToast: {
        position: 'absolute',
        top: 60,
        left: 24,
        right: 24,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    errorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
}); 