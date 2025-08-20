import axios from 'axios';
import { BASE_URL } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

export interface NearestStation {
  name: string;
  travel_distance_km: number;
  travel_time_min: number;
  divcode?: string;
}

export interface CrimeReport {
  crime_type: string;
  location: string;
  email: string;
  latitude: number;
  longitude: number;
  police_station: string;
}

export const fetchNearestStation = async (location: Location): Promise<NearestStation> => {
  const response = await axios.get(`${BASE_URL}/api/location/nearest`, {
    params: {
      lat: location.latitude,
      lon: location.longitude,
    },
  });
  
  return response.data.nearest_station;
};

export const fetchTopCrimes = async (stationName: string, divcode?: string): Promise<string[]> => {
  const response = await axios.post(`${BASE_URL}/get_top_crimes`, {
    station_name: stationName,
    divcode: divcode,
  });
  
  return response.data.top_crimes;
};

export const fetchUserEmail = async (): Promise<string> => {
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
};

export const submitCrimeReport = async (report: CrimeReport): Promise<void> => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) {
    throw new Error("User not authenticated. Please log in.");
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  await axios.post(`${BASE_URL}/api/crime-report`, report, { headers });
};

export const sendSMS = async (divcode: string, message: string): Promise<void> => {
  await axios.post(`${BASE_URL}/api/send-sms`, {
    divcode,
    message,
  });
};
