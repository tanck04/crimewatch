import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Modal, Animated } from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../../constants'; 
import { Ionicons } from '@expo/vector-icons';
import { crimeTypes, normalizeTitle } from '../../data/crimeTypes';
import { AlertTriangle, Shield } from 'lucide-react-native';

type Report = {
  crime_type: string;
  location: string;
  police_station: string;
  created_at: string;
};

export default function AlertsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const modalAnimation = useRef(new Animated.Value(300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      const fetchReports = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) return;
  
          const response = await axios.get<Report[]>(`${BASE_URL}/api/history`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          const sortedReports = [...response.data].sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          
          setReports(sortedReports);
          setFilteredReports(sortedReports);
        } catch (error) {
          console.error("Error fetching reports:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchReports();
    }, [])
  );

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    // Convert input date to Singapore time
    const date = new Date(dateString);
    const singaporeDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));
    
    const diffInSeconds = Math.floor((now.getTime() - singaporeDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return diffInSeconds <= 5 ? 'Just now' : `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    return singaporeDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredReports(reports);
      return;
    }
    
    const lowercaseQuery = text.toLowerCase();
    const filtered = reports.filter(report => 
      (report.crime_type && report.crime_type.toLowerCase().includes(lowercaseQuery)) ||
      (report.location && report.location.toLowerCase().includes(lowercaseQuery)) ||
      (report.police_station && report.police_station.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredReports(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredReports(reports);
  };

  const openReportDetails = (report: Report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalAnimation, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setModalVisible(false);
    });
  };

  useEffect(() => {
    if (modalVisible) {
      modalAnimation.setValue(300); // Reset position
      overlayOpacity.setValue(0); // Reset opacity
      
      Animated.parallel([
        Animated.spring(modalAnimation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [modalVisible]);

  const ReportDetailsModal = () => {
    if (!selectedReport) return null;
    
    const getCrimeDetails = (crimeTypeName: string) => {
      const normalizedName = normalizeTitle(crimeTypeName);
      const crimeType = crimeTypes.find(c => normalizeTitle(c.title) === normalizedName);
      
      return {
        icon: crimeType?.icon ? 
          React.cloneElement(crimeType.icon, { size: 50, color: "#FFFFFF" }) : 
          <Shield size={50} color="#FFFFFF" />,
        color: crimeType?.color || '#007AFF'
      };
    };
    
    const { icon, color } = getCrimeDetails(selectedReport.crime_type);
    const reportDate = new Date(selectedReport.created_at);
    // Convert to Singapore time (UTC+8)
    const singaporeDate = new Date(reportDate.getTime() + (8 * 60 * 60 * 1000));
    
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableOpacity 
            style={{ flex: 1, justifyContent: 'flex-end' }} 
            activeOpacity={1} 
            onPress={closeModal}
          >
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: modalAnimation }]
                }
              ]}
            >
              <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHandle} />
                  
                  <View style={[styles.headerBanner, { backgroundColor: color }]}>
                    <View style={styles.iconCircle}>
                      {icon}
                    </View>
                    <Text style={styles.modalTitle}>{selectedReport.crime_type}</Text>
                  </View>
                  
                  <View style={styles.modalDetails}>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Date & Time</Text>
                      <Text style={styles.detailValue}>
                        {singaporeDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                      <Text style={styles.detailSubvalue}>
                        {singaporeDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Location</Text>
                      <Text style={styles.detailValue}>{selectedReport.location}</Text>
                    </View>
                    
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Police Station</Text>
                      <Text style={styles.detailValue}>{selectedReport.police_station}</Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={closeModal}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>History</Text>
      
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={handleSearch}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.alertCard}
              onPress={() => openReportDetails(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.alertType}>{item.crime_type}</Text>
              <Text style={styles.alertLocation}>{item.location}</Text>
              {/* <Text style={styles.alertLocation}>{item.police_station}</Text> */}
              <Text style={styles.alertTime}>{formatTimeAgo(item.created_at)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#E5E5EA" />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0 
                  ? `No results for "${searchQuery}"`
                  : "No reports found"}
              </Text>
            </View>
          }
        />
      )}
      
      <ReportDetailsModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 30,
    marginBottom: 16,
  },
  searchBarContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  searchIcon: {
    marginLeft: 6,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 22,
    fontSize: 17,
    color: '#000',
    fontFamily: 'Inter-Regular',
  },
  clearButton: {
    padding: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertType: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 4,
    color: '#000',
  },
  alertLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  alertTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHandle: {
    width: 36,
    height: 5,
    backgroundColor: '#DADADA',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 12,
  },
  headerBanner: {
    backgroundColor: '#007AFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalDetails: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
  },
  detailSubvalue: {
    fontSize: 15,
    color: '#3C3C43',
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  }
});
