import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants';

type CheckUserResponse = {
  exists: boolean;
};

type LoginResponse = {
  token: string;
};

export type ValidationResult = {
  isValid: boolean;
  message: string;
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: "Email is required." };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address." };
  }
  
  return { isValid: true, message: "" };
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  if (!password) {
    return { isValid: false, message: "Password is required." };
  }
  
  return { isValid: true, message: "" };
};

export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const response = await axios.post<CheckUserResponse>(
      `${BASE_URL}/api/users/check2`, 
      { email },
      { timeout: 5000 }
    );
    
    return response.data.exists;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<string> => {
  try {
    const response = await axios.post<LoginResponse>(
      `${BASE_URL}/api/users/login`,
      { email, password },
      { timeout: 5000 }
    );
    
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      return response.data.token;
    }
    throw new Error("No token received");
  } catch (error: any) {
    if (error.response?.data?.detail === "Server error: 400: Password Incorrect") {
      throw new Error("Incorrect password. Please try again.");
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("Connection timeout. Please check your internet and try again.");
    } else {
      throw new Error("Unable to login. Please try again later.");
    }
  }
};