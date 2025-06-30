
import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StatusBar, Text, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import PortalHeaderComp from '../../components/common/header/portalHeader/PortalHeaderComp';

// Mock permissions (no context used now)
const DEFAULT_PERMISSIONS = [
  { name: 'PortalHome' } // 👈 Only show portalHome tab
];

// Utility to flatten permissions
const flattenModules = (modules = []) => {
  let flat = [];
  for (const mod of modules) {
    flat.push(mod);
    if (mod.children && mod.children.length > 0) {
      flat = flat.concat(flattenModules(mod.children));
    }
  }
  return flat;
};

// Icon mapping
const getIconForTab = (name, { color, size }) => {
  switch (name) {
    case 'portalhome':
      return <Feather name="home" size={size} color={color} />;
    case 'portalteamreport':
      return <MaterialIcons name="people-outline" size={size} color={color} />;
    default:
      return <Feather name="grid" size={size} color={color} />;
  }
};

const PortalTabLayout = () => {
  const permissions = DEFAULT_PERMISSIONS;

  const tabScreens = useMemo(() => {
    const allModules = flattenModules(permissions);

    const PERMISSION_TO_ROUTE_MAP = {
      'portalhome': { routeName: 'portalHome', title: 'Home' },
      'portalteamreport': { routeName: 'portalTeamReport', title: 'Team Report' },
    };

    return allModules
      .map(mod => mod.name?.toLowerCase())
      .filter(name => PERMISSION_TO_ROUTE_MAP[name])
      .map(name => ({
        name: PERMISSION_TO_ROUTE_MAP[name].routeName,
        title: PERMISSION_TO_ROUTE_MAP[name].title,
        moduleName: name,
      }));
  }, [permissions]);

  if (!permissions) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', color: '#555', marginTop: 40 }}>
          Loading permissions...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <PortalHeaderComp/>
      <View style={styles.container}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#fb923c',
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
          }}
        >
          {tabScreens.map((screen) => (
            <Tabs.Screen
              key={screen.name}
              name={screen.name}
              options={{
                title: screen.title,
                tabBarIcon: (props) => getIconForTab(screen.moduleName, props),
              }}
            />
          ))}
        </Tabs>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default PortalTabLayout;
