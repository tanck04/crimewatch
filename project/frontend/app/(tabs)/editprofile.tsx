import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../../constants';

export default function EditProfileScreen() {
  const [message, setMessage] = useState<string | object>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    current_password: '',
    new_password: ''
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setForm({
          name: response.data.name,
          phone: response.data.phone,
          current_password: '',
          new_password: '',
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
        setMessage("Failed to load user information.");
      }
    };

    fetchUserInfo();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setMessage(''); // Clear the message when the page is revisited
    }, [])
  );

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setMessage("User not authenticated. Please log in.");
        return;
      }

      // Basic validation for required fields
      if (!form.name.trim() || !form.phone.trim()) {
        setMessage("Name and Phone fields cannot be blank.");
        return;
      }

      if (form.phone.length < 8 || form.phone.length > 10) {
        setMessage("Phone number must be between 8 to 10 digits.");
        return;
      }

      // Only validate new password if the user is trying to change it
      if (form.new_password) {
        if (form.new_password.length < 8 || form.new_password.length > 15 ||
            !/[A-Z]/.test(form.new_password) || !/[0-9]/.test(form.new_password) ||
            !/[!@#$%^&*/]/.test(form.new_password)) {
          setMessage("New password must be 8-15 characters long, include at least one uppercase letter, one number, and one special character.");
          return;
        }
        
        // Require current password if setting a new password
        if (!form.current_password) {
          setMessage("Current password is required to set a new password.");
          return;
        }
      }

      // Prepare data to send - only include password fields if changing password
      const updateData = {
        name: form.name,
        phone: form.phone,
        ...(form.new_password ? {
          current_password: form.current_password,
          new_password: form.new_password
        } : {})
      };

      await axios.put(
        `${BASE_URL}/api/users/update`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage("Profile updated successfully!");
      alert("Profile updated");
      // Clear password fields after successful update
      setForm({
        ...form,
        current_password: '',
        new_password: ''
      });
      
      router.replace('/(tabs)/profile');
    } catch (error: any) {
      console.log("Update failed:", error);
      const errorMessage = error.response?.data?.detail || error.message;
      if (errorMessage?.toLowerCase().includes("incorrect current password")) {
        setMessage("Incorrect current password");
      } else {
        setMessage("Failed to update profile: " + errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace('/(tabs)/profile')}
                disabled={isSubmitting}
              >
                <View style={styles.backButtonContent}>
                  <ChevronLeft size={20} color="#007AFF" />
                  <Text style={styles.backButtonText}>Back</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.heading}>Edit Profile</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Feedback Message */}
              {typeof message === 'string' && message ? (
                <View style={styles.messageContainer}>
                  <Text style={[
                    styles.messageText,
                    { color: message.includes("success") ? "#34C759" : "#FF3B30" }
                  ]}>
                    {message}
                  </Text>
                </View>
              ) : null}

              {/* Form Card */}
              <View style={styles.card}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={form.name}
                    onChangeText={(text) => handleChange("name", text)}
                    editable={!isSubmitting}
                    placeholder="Your full name"
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={form.phone}
                    onChangeText={(text) => handleChange("phone", text)}
                    keyboardType="phone-pad"
                    editable={!isSubmitting}
                    placeholder="Your phone number"
                  />
                </View>
              </View>

              {/* Password Card */}
              <View style={styles.card}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Current Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={form.current_password}
                      onChangeText={(text) => handleChange("current_password", text)}
                      secureTextEntry={!showCurrentPassword}
                      editable={!isSubmitting}
                      placeholder="Enter current password"
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? 
                        <EyeOff size={20} color="#8E8E93" /> : 
                        <Eye size={20} color="#8E8E93" />
                      }
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.formGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={form.new_password}
                      onChangeText={(text) => handleChange("new_password", text)}
                      secureTextEntry={!showNewPassword}
                      editable={!isSubmitting}
                      placeholder="Enter new password"
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? 
                        <EyeOff size={20} color="#8E8E93" /> : 
                        <Eye size={20} color="#8E8E93" />
                      }
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.passwordHint}>
                    Must be 8-15 characters with at least one uppercase letter,
                    one number, and one special character.
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS background color
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E5E5EA', 
    // backgroundColor: '#FFFFFF',
  },
  headerSpacer: {
    width: 70, // Matches back button width for centered title
  },
  backButton: {
    width: 70,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF', // iOS blue
    fontSize: 17,
    fontWeight: '400',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formGroup: {
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA', // iOS light separator color
    marginHorizontal: 16,
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '400',
    color: '#3C3C43', // iOS label color
  },
  input: {
    fontSize: 17,
    color: '#000000',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  passwordHint: {
    fontSize: 13,
    color: '#8E8E93', // iOS secondary label color
    marginTop: 8,
  },
  togglePasswordText: {
    fontSize: 15,
    color: '#007AFF', // iOS blue
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF', // iOS blue
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#A2D2FF', // Lighter blue
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 17,
    color: '#000000',
    paddingVertical: 12,
  },
  eyeIcon: {
    marginLeft: 8,
  },
});
