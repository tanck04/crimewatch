import React, { useEffect, useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, 
  Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../../constants';

export default function FeedbackScreen() {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState<string | object>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMessage(''); // Clear the message when the page loads
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setMessage(''); // Clear the message when the page is revisited
    }, [])
  );

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity 
        key={index} 
        onPress={() => setRating(index + 1)}
        disabled={isSubmitting}
        style={styles.starButton}
      >
        <FontAwesome
          name={index < rating ? 'star' : 'star-o'}
          size={32}
          color={index < rating ? '#FF9500' : '#C7C7CC'}
        />
      </TouchableOpacity>
    ));
  };

  const handleSubmit = async () => {
    const fetchEmail = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error("User not authenticated. Please log in.");
        }

        const response = await axios.get<{ email: string }>(
          `${BASE_URL}/api/users/email`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          }
        );

        return response.data.email;
      } catch (error: any) {
        console.error("Error fetching email:", error);
        throw new Error(error.response?.data?.msg || "Failed to fetch email.");
      }
    };

    let userEmail = '';
    try {
      userEmail = await fetchEmail();
    } catch (error: any) {
      setMessage(error.message || "An unknown error occurred.");
      return;
    }
    if (!comment.trim()) {
      setMessage("Please enter your feedback");
      return;
    }

    if (rating === 0) {
      setMessage("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setMessage("User not authenticated. Please log in.");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/api/feedback`,
        {
          email: userEmail,
          rating,
          message: comment,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      setMessage("Feedback submitted successfully!");
      alert("Thank you for your feedback!");
      setRating(0);
      setComment('');
      router.replace('/(tabs)');

    } catch (error: any) {
      console.error("Feedback submission error:", error);
      setMessage(
        error.response?.data?.detail || 
        "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
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
              <Text style={styles.heading}>Feedback</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.mainContent}>
              {/* Message display */}
              {typeof message === 'string' && message ? (
                <View style={styles.messageContainer}>
                  <Text style={[
                    styles.messageText, 
                    { color: message.includes('success') ? '#34C759' : '#FF3B30' }
                  ]}>
                    {message}
                  </Text>
                </View>
              ) : null}

              {/* Rating Card */}
              <View style={styles.card}>
                <Text style={styles.label}>How would you rate our app?</Text>
                <View style={styles.starsContainer}>
                  {renderStars()}
                </View>
              </View>

              {/* Comment Card */}
              <View style={styles.card}>
                <Text style={styles.label}>Tell us more</Text>
                <TextInput
                  style={styles.textarea}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  placeholder="Share your experience or suggestions..."
                  placeholderTextColor="#8E8E93"
                  editable={!isSubmitting}
                />
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
                  <Text style={styles.buttonText}>Submit Feedback</Text>
                )}
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
    backgroundColor: '#F2F2F7', // iOS background color
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E5E5EA', // iOS light separator color
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
    color: '#000000',
  },
  mainContent: {
    flex: 1,
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
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    marginBottom: 16,
    fontWeight: '500',
    color: '#3C3C43', // iOS label color
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  textarea: {
    minHeight: 120,
    fontSize: 17,
    color: '#000000',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF', // iOS blue
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#A2D2FF', // Lighter blue
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  }
});
