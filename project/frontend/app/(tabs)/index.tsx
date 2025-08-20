import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LocationContext } from '../context/locationContext';
import CrimeTypeGrid from '../../components/CrimeTypeGrid';
import LocationInfo from '../../components/LocationInfo';
import CrimeReportModal from '../../components/CrimeReportModal';
import { crimeTypes, getDefaultCrimeTypes, normalizeTitle, CrimeType } from '../../data/crimeTypes';
import { 
  fetchNearestStation, 
  fetchTopCrimes, 
  fetchUserEmail, 
  submitCrimeReport,
  NearestStation,
  Location as LocationType,
  sendSMS,
} from '../../services/crimeReportService';

type Nav = {
  navigate: (value: string, options?: { screen: string }) => void;
};

export default function ReportScreen() {
  const { location } = useContext(LocationContext);
  const navigation = useNavigation<Nav>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCrimeType, setSelectedCrimeType] = useState<CrimeType | null>(null);
  const [nearestStation, setNearestStation] = useState<NearestStation | null>(null);
  const [topCrimes, setTopCrimes] = useState<string[]>([]);
  const [displayedCrimeTypes, setDisplayedCrimeTypes] = useState(getDefaultCrimeTypes());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location) {
      handleLocationUpdate();
    }
  }, [location]);

  useEffect(() => {
    updateDisplayedCrimeTypes();
  }, [topCrimes]);

  const handleLocationUpdate = async () => {
    if (!location) return;
    
    setIsLoading(true);
    try {
      const station = await fetchNearestStation(location as LocationType);
      setNearestStation(station);
      
      if (station.divcode) {
        const crimes = await fetchTopCrimes(station.name, station.divcode);
        setTopCrimes(crimes);
      }
    } catch (error) {
      console.error("Error fetching station data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDisplayedCrimeTypes = () => {
    if (topCrimes.length === 0) return;
    
    const mappedTopCrimes = topCrimes
      .map(crime => crimeTypes.find(btn => normalizeTitle(btn.title) === normalizeTitle(crime)))
      .filter(Boolean) as CrimeType[];
    
    // Always include "Others" category
    const othersCategory = crimeTypes.find(btn => btn.title === "Others");
    if (othersCategory && !mappedTopCrimes.some(crime => crime.id === othersCategory.id)) {
      mappedTopCrimes.push(othersCategory);
    }
    
    setDisplayedCrimeTypes(mappedTopCrimes.length > 0 ? mappedTopCrimes : getDefaultCrimeTypes());
  };

  const handleCrimeTypeSelect = (crimeType: CrimeType) => {
    setSelectedCrimeType(crimeType);
    setModalVisible(true);
  };

  const handleConfirmPress = async () => {
    if (!location || location.name === "Unknown Location") {
      Alert.alert("Error", "Location is unknown. Please select your location manually from the map.");
      navigation.navigate('(tabs)', { screen: 'map' });
      return;
    }

    if (!selectedCrimeType || !nearestStation) {
      Alert.alert("Error", "Missing required information. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const userEmail = await fetchUserEmail();
      
      await submitCrimeReport({
        crime_type: selectedCrimeType.title,
        location: location.name,
        email: userEmail,
        latitude: location.latitude,
        longitude: location.longitude,
        police_station: nearestStation.name,
      });

      const smsMessage = `
      Crime Report Notification
      -------------------------
      Type: ${selectedCrimeType.title}
      Location: ${location.name}
      Coordinates: ${location.latitude}, ${location.longitude}
      Reporter Email: ${userEmail}
      Time: ${new Date().toLocaleString()}
      `.trim();

      await sendSMS(nearestStation.divcode || "UNKNOWN", smsMessage);

      Alert.alert("Success", "Crime report submitted successfully!");
      setModalVisible(false);
    } catch (error: any) {
      console.error("Error submitting report:", error);

      if (error.response) {
        console.error("Backend error response:", error.response.data);
        Alert.alert("Backend Error", JSON.stringify(error.response.data));
      } else {
        Alert.alert("Error", error.message || "Failed to submit crime report. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Report a Crime</Text>
        
        <CrimeTypeGrid 
          crimeTypes={displayedCrimeTypes}
          onSelectCrimeType={handleCrimeTypeSelect}
        />
        
        <LocationInfo
          location={location as LocationType || null}
          nearestStation={nearestStation}
          onLocationPress={() => navigation.navigate('(tabs)', { screen: 'map' })}
        />
        
        <CrimeReportModal
          visible={modalVisible}
          selectedCrimeType={selectedCrimeType}
          location={location as LocationType || null}
          nearestStation={nearestStation}
          onClose={() => setModalVisible(false)}
          onConfirm={handleConfirmPress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS light gray background
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    marginTop: 10,
  },
});