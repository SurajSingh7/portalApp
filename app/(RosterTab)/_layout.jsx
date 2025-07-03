import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PortalHeaderComp from '../../components/common/header/portalHeader/PortalHeaderComp';
import { View, StatusBar } from 'react-native';
import { Feather, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';

const RosterTabLayout = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <PortalHeaderComp />

      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: '#fb923c', // Orange active icon
            tabBarInactiveTintColor: '#999',
            tabBarStyle: {
              height: 60,
              paddingBottom: 6,
              paddingTop: 6,
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#eee',
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
            tabBarIcon: ({ color, size }) => {
              switch (route.name) {
                case 'searchEmployeeandList':
                  return <Feather name="search" size={size} color={color} />;
                case 'shiftActivityLog':
                  return <MaterialIcons name="people-outline" size={size} color={color} />;
                case 'createShift':
                  return <Entypo name="clock" size={size} color={color} />;
                case 'rosterDashboard':
                  return <FontAwesome5 name="chart-bar" size={size} color={color} />;
                default:
                  return null;
              }
            },
          })}
        >
        
          <Tabs.Screen name="searchEmployeeandList" options={{ title: "Search" }} />
          <Tabs.Screen name="shiftActivityLog" options={{ title: "ActivityLog" }} />
          <Tabs.Screen name="rosterDashboard" options={{ title: "Dashboard" }} />
          <Tabs.Screen name="createShift" options={{ title: "Shift" }} />
        </Tabs>
      </View>
    </SafeAreaView>
  );
};

export default RosterTabLayout;
