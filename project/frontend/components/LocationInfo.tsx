import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, ShieldPlus } from 'lucide-react-native';
import { Location } from '../services/crimeReportService';
import { NearestStation } from '../services/crimeReportService';

interface LocationInfoProps {
  location: Location | null;
  nearestStation: NearestStation | null;
  onLocationPress: () => void;
}

const LocationInfo = ({ location, nearestStation, onLocationPress }: LocationInfoProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.locationContainer}
        onPress={onLocationPress}
        activeOpacity={0.7}
      >
        <View style={styles.locationRow}>
          <View style={styles.iconContainer}>
            <MapPin size={20} color="#007AFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.locationTitle}>My Current Location</Text>
            <Text style={styles.locationText}>
              {location ? location.name : 'Fetching location...'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.divider} />
      
      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <View style={styles.iconContainer}>
            <ShieldPlus size={20} color="#007AFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.locationTitle}>Nearest Police Station</Text>
            <Text style={styles.locationText}>
              {nearestStation ? nearestStation.name : 'Finding nearest station...'}
            </Text>
            {nearestStation && (
              <Text style={styles.locationText}>
                {nearestStation.travel_distance_km !== undefined
                  ? `${nearestStation.travel_distance_km.toFixed(1)} km`
                  : 'Distance unavailable'}
                  {' • '}
                {Math.round(nearestStation.travel_time_min)} mins away
            </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    // iOS-style shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  locationContainer: {
    padding: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    // Subtle iOS icon shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1C1C1E',
  },
  locationText: {
    fontSize: 14,
    color: '#8E8E93', // iOS secondary text color
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA', // iOS standard separator color
    marginHorizontal: 16,
  }
});

export default LocationInfo;