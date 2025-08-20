import { Tabs } from 'expo-router';
import { MapPin, Bell, User, FileText, History } from 'lucide-react-native'; // Added History icon

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#ddd',
        },
        tabBarActiveTintColor: '#007AFF',
      }}>
      <Tabs.Screen
        name="index" // Updated to point to the new index.tsx (previously report.tsx)
        options={{
          title: 'Report',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />, // Icon for Report tab
        }}
      />
      <Tabs.Screen
        name="map" // Updated to point to the new map.tsx (previously index.tsx)
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <History size={size} color={color} />, // Updated to History icon
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="feedback" options={{ href: null }} />
      <Tabs.Screen name="editprofile" options={{ href: null }} />
      
    </Tabs>
  );
}