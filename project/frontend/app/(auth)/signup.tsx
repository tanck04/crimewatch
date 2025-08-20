import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../constants';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isWeakPassword, setIsWeakPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (password) checkPasswordStrength();
  }, [password]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = () => {
    let isWeak = false;

    if (!password || password.length < 8 || password.length > 15 || 
        !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*/]/.test(password)) {
      isWeak = true;
    }
    setIsWeakPassword(isWeak);
    return isWeak;
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!name) errors.name = "Name is required";
    if (!email) errors.email = "Email is required";
    else if (!isValidEmail(email)) errors.email = "Please enter a valid email";
    
    if (!phone) errors.phone = "Phone number is required";
    else if (phone.length < 8 || phone.length > 10) errors.phone = "Phone must be 8-10 digits";
    
    if (!password) errors.password = "Password is required";
    else if (checkPasswordStrength()) errors.password = "Password is too weak";
    
    if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords don't match";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage('');

    try {
      type CheckUserResponse = { exists: boolean };
      
      const checkUserResponse = await axios.post<CheckUserResponse>(
        `${BASE_URL}/api/users/check`,
        { email, phone }
      );
  
      if (checkUserResponse.data.exists) {
        setMessage('User already exists with this email or phone number.');
        setIsLoading(false);
        return;
      }
      
      const response = await axios.post<{ msg: string; token: string }>(
        `${BASE_URL}/api/users/signup`,
        { name, email, phone, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Store the token in AsyncStorage
      const { token } = response.data;
      await AsyncStorage.setItem('userToken', token);
      alert(`Sign up successfully for ${name}`);
      setMessage(response.data.msg);
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMsg = error.response?.data?.msg || "Something went wrong.";
      setMessage(errorMsg);
      console.error("Sign-up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>
              </View>

              {message ? (
                <View style={styles.messageContainer}>
                  <Ionicons name="alert-circle" size={18} color="#FF3B30" />
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              ) : null}

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    formErrors.name ? styles.inputError : null
                  ]}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="person-outline" size={20} color="#8E8E93" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Name"
                      placeholderTextColor="#8E8E93"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>
                  {formErrors.name ? (
                    <Text style={styles.errorText}>{formErrors.name}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    formErrors.email ? styles.inputError : null
                  ]}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="mail-outline" size={20} color="#8E8E93" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#8E8E93"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!isLoading}
                    />
                  </View>
                  {formErrors.email ? (
                    <Text style={styles.errorText}>{formErrors.email}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    formErrors.phone ? styles.inputError : null
                  ]}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="call-outline" size={20} color="#8E8E93" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number"
                      placeholderTextColor="#8E8E93"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      editable={!isLoading}
                    />
                  </View>
                  {formErrors.phone ? (
                    <Text style={styles.errorText}>{formErrors.phone}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    formErrors.password ? styles.inputError : null
                  ]}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#8E8E93"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!passwordVisible}
                      editable={!isLoading}
                    />
                    <TouchableOpacity 
                      style={styles.passwordToggle}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                      disabled={isLoading}
                    >
                      <Ionicons
                        name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#8E8E93"
                      />
                    </TouchableOpacity>
                  </View>
                  {formErrors.password ? (
                    <Text style={styles.errorText}>{formErrors.password}</Text>
                  ) : password ? (
                    <Text style={[
                      styles.passwordHint,
                      isWeakPassword ? styles.weakPasswordText : styles.strongPasswordText
                    ]}>
                      {isWeakPassword ? 
                        "Password must be 8-15 characters with uppercase, number & special character" :
                        "Strong password"
                      }
                    </Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    formErrors.confirmPassword ? styles.inputError : null
                  ]}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="shield-checkmark-outline" size={20} color="#8E8E93" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#8E8E93"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!confirmPasswordVisible}
                      editable={!isLoading}
                    />
                    <TouchableOpacity 
                      style={styles.passwordToggle}
                      onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      disabled={isLoading}
                    >
                      <Ionicons
                        name={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#8E8E93"
                      />
                    </TouchableOpacity>
                  </View>
                  {formErrors.confirmPassword ? (
                    <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>
                  ) : null}
                </View>

                <TouchableOpacity 
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/login')}
                  disabled={isLoading}
                >
                  <Text style={styles.footerText}>
                    Already have an account? <Text style={styles.footerLink}>Log In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEEEF0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  messageText: {
    color: '#FF3B30',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    height: 52,
    // Subtle inner shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  inputIconContainer: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#000000',
  },
  passwordToggle: {
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    // iOS-style button shadow
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#A2D2FF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  passwordHint: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  weakPasswordText: {
    color: '#FF9500', // iOS orange for warning
  },
  strongPasswordText: {
    color: '#34C759', // iOS green for success
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  footerLink: {
    color: '#007AFF',
    fontWeight: '500',
  },
});
