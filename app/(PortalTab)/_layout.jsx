import React, { useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StatusBar, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Feather, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ Added MaterialCommunityIcons

import PortalHome from "./portalHome";
import PortalTeamReport from "./portalTeamReport";
import CircularNews from "./portalCircularNews"; 
import PortalHeaderComp from "../../components/common/header/portalHeader/PortalHeaderComp";
import { usePermissions } from "../../context/PermissionContext";

const Tab = createBottomTabNavigator();

// Map module names from backend to screens
const PERMISSION_TO_SCREEN_MAP = {
  "team report": {
    routeName: "PortalTeamReport",
    component: PortalTeamReport,
    title: "Team Report",
    icon: (color, size) => (
      <MaterialIcons name="people-outline" size={size} color={color} />
    ),
  },
};

// 🆕 Circular/News tab (always visible)
const CIRCULAR_TAB = {
  routeName: "CircularNews",
  component: CircularNews,
  title: "Circular/News",
  icon: (color, size) => (
    <MaterialCommunityIcons
      name="newspaper-variant-outline" // ✅ Beautiful news icon
      size={size}
      color={color}
    />
  ),
};

// 🏠 Home tab (always visible)
const PORTAL_HOME = {
  routeName: "PortalHome",
  component: PortalHome,
  title: "Home",
  icon: (color, size) => (
    <Feather name="home" size={size} color={color} />
  ),
};

const PortalTabLayout = () => {
  const { permissions, loading, error } = usePermissions();

  // Flatten all nested modules
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

  // Get allowed screens based on permissions
  const tabScreens = useMemo(() => {
    const flattened = flattenModules(permissions);

    const allowedModules = flattened.map((mod) =>
      mod.name?.trim().toLowerCase()
    );

    const filteredScreens = allowedModules
      .filter((name) => PERMISSION_TO_SCREEN_MAP[name])
      .map((name) => PERMISSION_TO_SCREEN_MAP[name]);

    // 🆕 Add Home & Circular tab (always visible)
    const finalScreens = [
      PORTAL_HOME,   // Home tab first
      CIRCULAR_TAB,  // Circular tab second
      ...filteredScreens,
    ];

    return finalScreens;
  }, [permissions]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#fb923c" />
        <Text style={{ marginTop: 10 }}>Loading tabs...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: "red" }}>❌ Error: {error}</Text>
      </SafeAreaView>
    );
  }

  if (tabScreens.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ textAlign: "center", color: "#555" }}>
          🚫 No permissions to view any tabs.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <PortalHeaderComp />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#fb923c", // Active tab color
          tabBarInactiveTintColor: "#999",  // Inactive tab color
          tabBarStyle: {
            height: 60,
            paddingBottom: 6,
            paddingTop: 6,
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#eee",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 4,
            elevation: 5,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        {tabScreens.map((screen) => (
          <Tab.Screen
            key={screen.routeName}
            name={screen.routeName}
            component={screen.component}
            options={{
              title: screen.title,
              tabBarIcon: ({ color, size }) => screen.icon(color, size),
            }}
          />
        ))}
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PortalTabLayout;
