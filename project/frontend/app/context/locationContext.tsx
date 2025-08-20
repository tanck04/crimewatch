import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location'; // Import expo-location

// Define the context with default values
export const LocationContext = createContext<{
  location: { latitude: number; longitude: number; name: string } | null;
  setLocation: React.Dispatch<React.SetStateAction<{ latitude: number; longitude: number; name: string } | null>>;
}>({
  location: null,
  setLocation: () => {},
});

// Create a provider component
export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number; name: string } | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error("Permission to access location was denied");
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        const [reverseGeocode] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        const detailedLocationName = [
          reverseGeocode.name, // Street name or specific location
          reverseGeocode.street, // Street
          reverseGeocode.country, // Country
        ]
          .filter(Boolean) // Remove undefined or null values
          .join(", "); // Join with commas for a detailed name

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          name: detailedLocationName || "Unknown Location",
        });
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchLocation(); // Fetch location on component mount
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

export default LocationProvider;