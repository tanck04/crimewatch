import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import FormInput from '../../components/FormInput';
import ErrorMessage from '../../components/ErrorMessage';
import { 
  validateLoginForm, 
  checkUserExists, 
  loginUser 
} from '../../services/authService';
import { useAuth } from '../context/authContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    // Clear previous error messages
    setMessage('');
    
    // Validate form
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setMessage(validation.message);
      return;
    }

    setIsLoading(true);

    try {
      // Check if user exists
      const exists = await checkUserExists(email);
      if (!exists) {
        setMessage('Account not found. Please sign up first.');
        return;
      }
      
      // Attempt to login and get token
      const token = await loginUser(email, password);
      // Use context login function to set the token
      await login(token);
      alert('Login successful!');
      // Navigation is handled after successful login
      router.replace('/(tabs)');
    } catch (error: any) {
      setMessage(error.message);
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
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>CrimeWatch</Text>
              <Text style={styles.subtitle}>Login to your account</Text>
            </View>

            <View style={styles.formContainer}>
              <ErrorMessage message={message} />

              <FormInput
                iconName="mail-outline"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                editable={!isLoading}
              />

              <FormInput
                iconName="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                isPassword={true}
                passwordVisible={showPassword}
                onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
                editable={!isLoading}
              />

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Log In</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/signup')}
                disabled={isLoading}
              >
                <Text style={styles.footerText}>
                  Don't have an account? <Text style={styles.footerLink}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 56,
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
  footer: {
    alignItems: 'center',
    marginBottom: 16,
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
