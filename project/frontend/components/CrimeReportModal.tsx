import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { ChevronLeft, Shield } from 'lucide-react-native';
import { CrimeType } from '../data/crimeTypes';
import { Location, NearestStation } from '../services/crimeReportService';

interface CrimeReportModalProps {
  visible: boolean;
  selectedCrimeType: CrimeType | null;
  location: Location | null;
  nearestStation: NearestStation | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const CrimeReportModal: React.FC<CrimeReportModalProps> = ({
  visible,
  selectedCrimeType,
  location,
  nearestStation,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  // Format the current date for display
  const formattedDate = new Date().toLocaleString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Helper function to get background colors based on crime type
  const getColors = () => {
    const mainColor = selectedCrimeType?.color || '#007AFF';
    return {
      background: mainColor,
      button: '#FFFFFF',
      buttonText: mainColor,
      text: '#FFFFFF'
    };
  };

  const colors = getColors();

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Submitting report...</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
            </View>

            {/* Crime Icon and Title */}
            <View style={styles.iconContainer}>
              {selectedCrimeType?.icon ? (
                React.cloneElement(selectedCrimeType.icon, { 
                  size: 160,
                  color: "#FFFFFF"
                })
              ) : (
                <Shield size={120} color="#FFFFFF" />
              )}
            </View>
            
            <Text style={styles.title}>{selectedCrimeType?.title || 'Report Crime'}</Text>
            
            <View style={styles.divider} />

            {/* Report Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {location ? location.name : 'Fetching location...'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{formattedDate}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Nearest Police Station</Text>
                <Text style={styles.detailValue}>
                  {nearestStation ? nearestStation.name : 'Finding nearest station...'}
                </Text>
                {nearestStation && (
                  <Text style={styles.detailSubvalue}>
                    {nearestStation.travel_distance_km !== undefined
                      ? `${nearestStation.travel_distance_km.toFixed(1)} km`
                      : 'Distance unavailable'}
                    {' • '}
                    {Math.round(nearestStation.travel_time_min)} mins away
                  </Text>
                )}
              </View>
            </View>

            {/* Confirmation Section */}
            <View style={styles.confirmationContainer}>
              <Text style={styles.confirmationText}>
                Confirm this crime report?
              </Text>
              
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: colors.button }]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text style={[styles.confirmButtonText, { color: colors.buttonText }]}>
                  Confirm Report
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    height: 44,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  iconContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 20,
    width: '100%',
  },
  detailsContainer: {
    marginBottom: 30,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  detailSubvalue: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  confirmationContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  confirmationText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  confirmButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    width: '100%',
    alignItems: 'center',
    // iOS-style shadow
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CrimeReportModal;