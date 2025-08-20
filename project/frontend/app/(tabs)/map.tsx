import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, MapPressEvent, Callout, Polyline } from 'react-native-maps';
import { useLocation } from '../context/locationContext';
import * as Location from 'expo-location';
import { policeStationsData } from '../../data/policeStationData';
import { extractPoliceStationInfo, type PoliceStation } from '../../services/policeDataService';
import { fetchNearestStation, type NearestStation } from '../../services/crimeReportService';

interface ProcessedPoliceStation {
  name: string;
  type: string;
  tel: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function MapScreen() {
  const { location, setLocation } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [policeStations, setPoliceStations] = useState<ProcessedPoliceStation[]>([]);
  const [nearestStation, setNearestStation] = useState<ProcessedPoliceStation | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{latitude: number, longitude: number}[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this app.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      let coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setLocation({ ...coords, name: 'Unknown Location' });
    })();

    if (policeStationsData && policeStationsData.features) {
      const processedStations = policeStationsData.features.map(station =>
        extractPoliceStationInfo(station as unknown as PoliceStation)
      );
      setPoliceStations(processedStations);
    }
  }, []);

  // Find nearest police station when location changes
  useEffect(() => {
    if (location) {
      findNearestPoliceStation();
    }
  }, [location, policeStations]);

  // Update route coordinates when nearest station or location changes
  useEffect(() => {
    if (location && nearestStation) {
      drawRoute();
    }
  }, [location, nearestStation]);

  const findNearestPoliceStation = async () => {
    if (!location || policeStations.length === 0) return;
    
    setIsLoadingRoute(true);
    try {
      // Use the existing service to fetch the nearest station from the backend
      const stationData = await fetchNearestStation({
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name
      });
      
      // Find the matching station in our processed stations array
      const matchingStation = policeStations.find(station => 
        station.name.toLowerCase().includes(stationData.name.toLowerCase()) || 
        stationData.name.toLowerCase().includes(station.name.toLowerCase()
      ));
      
      if (matchingStation) {
        setNearestStation(matchingStation);
      } else {
        console.warn("Couldn't find matching station in local data for:", stationData.name);
      }
    } catch (error) {
      console.error('Error finding nearest police station:', error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const drawRoute = () => {
    if (!location || !nearestStation) return;
    
    // Create direct line between user and nearest station
    setRouteCoordinates([
      { latitude: location.latitude, longitude: location.longitude },
      nearestStation.coordinates
    ]);
  };

  const handleMapPress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation = { latitude, longitude };

    try {
      const [address] = await Location.reverseGeocodeAsync(newLocation);
      const locationName = address ? `${address.name}, ${address.city}` : 'Unknown Location';
      setLocation({ ...newLocation, name: locationName });
      console.log('New location:', { ...newLocation, name: locationName });
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocation({ ...newLocation, name: 'Unknown Location' });
    }

    mapRef.current?.animateToRegion({
      ...newLocation,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const resetToDefaultLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to reset location.');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    let coords = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };

    try {
      const [address] = await Location.reverseGeocodeAsync(coords);
      const locationName = address ? `${address.name}, ${address.city}` : 'Unknown Location';
      setLocation({ ...coords, name: locationName });
      console.log('Live location:', { ...coords, name: locationName });
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocation({ ...coords, name: 'Unknown Location' });
    }

    mapRef.current?.animateToRegion({
      ...coords,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 1.3521,
          longitude: location?.longitude || 103.8198,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {location && (
          <Marker
            coordinate={location}
            title="Selected Location"
            pinColor="red"
          />
        )}

        {/* Draw route to nearest police station */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF8C00" // Orange color
            strokeWidth={3}
            lineDashPattern={[1, 3]} // Dashed line
          />
        )}

        {/* Highlight nearest police station */}
        {nearestStation && (
          <Marker
            coordinate={nearestStation.coordinates}
            title={`Nearest Station: ${nearestStation.name}`}
            description={`${nearestStation.type} | ${nearestStation.tel}`}
            pinColor="#FFD700" // Gold color to highlight it
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={[styles.calloutTitle, {color: '#FF8C00'}]}>
                  {nearestStation.name} (Nearest)
                </Text>
                <View style={styles.calloutDivider} />
                <Text>
                  <Text style={styles.calloutLabel}>Tel: </Text>
                  <Text>{nearestStation.tel}</Text>
                </Text>
              </View>
            </Callout>
          </Marker>
        )}

        {/* Show all other police stations */}
        {policeStations.map((station, index) => (
          nearestStation?.name !== station.name && (
            <Marker
              key={index}
              coordinate={station.coordinates}
              title={station.name}
              description={`${station.type} | ${station.tel}`}
              pinColor="blue"
              onPress={(e) => {
                e.stopPropagation();
              }}
            >
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{station.name}</Text>
                  <View style={styles.calloutDivider} />
                  <Text>
                    <Text style={styles.calloutLabel}>Tel: </Text>
                    <Text>{station.tel}</Text>
                  </Text>
                </View>
              </Callout>
            </Marker>
          )
        ))}
      </MapView>

      {/* Bottom Controls */}
      <View style={styles.bottomControlsContainer}>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { backgroundColor: 'red' }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { backgroundColor: '#FFD700' }]} />
            <Text style={styles.legendText}>Nearest NPC</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { backgroundColor: 'blue' }]} />
            <Text style={styles.legendText}>Other NPC</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaultLocation}>
          <Text style={styles.resetButtonText}>↺</Text>
        </TouchableOpacity>
      </View>

      {isLoadingRoute && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding nearest station...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  resetButton: {
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  callout: {
    width: 200,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 14,
    color: '#0066CC',
    textAlign: 'center',
  },
  calloutDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 6,
  },
  calloutLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  loadingContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  loadingText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    padding: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  legendMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
});
