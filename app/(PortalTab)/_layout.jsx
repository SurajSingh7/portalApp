import React, { useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StatusBar, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";

import PortalHome from "./portalHome";
import PortalTeamReport from "./portalTeamReport";
import PortalTheme from "./theme"; // 👈 Theme screen
import PortalHeaderComp from "../../components/common/header/portalHeader/PortalHeaderComp";
import { usePermissions } from "../../context/PermissionContext";

const Tab = createBottomTabNavigator();

// Map module names from backend to screens
const PERMISSION_TO_SCREEN_MAP = {
  "employee dashboard": {
    routeName: "PortalHome",
    component: PortalHome,
    title: "Home",
    icon: (color, size) => <Feather name="home" size={size} color={color} />,
  },
  "team report": {
    routeName: "PortalTeamReport",
    component: PortalTeamReport,
    title: "Team Report",
    icon: (color, size) => (
      <MaterialIcons name="people-outline" size={size} color={color} />
    ),
  },
};

// New Theme tab (always visible)
const THEME_TAB = {
  routeName: "PortalTheme",
  component: PortalTheme,
  title: "Theme",
  icon: (color, size) => <Feather name="settings" size={size} color={color} />,
};

const PortalTabLayout = () => {
  const { userData, permissions, loading, error } = usePermissions(); // Get data from context

  console.log("👤 User Data:", userData);
  console.log("📜 Permissions from backend:", permissions);

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
    console.log("🪜 Flattened Modules:", flattened);

    const allowedModules = flattened.map((mod) =>
      mod.name?.trim().toLowerCase()
    );
    console.log("✅ Allowed Module Names:", allowedModules);

    const filteredScreens = allowedModules
      .filter((name) => PERMISSION_TO_SCREEN_MAP[name])
      .map((name) => PERMISSION_TO_SCREEN_MAP[name]);

    console.log("📱 Filtered Screens:", filteredScreens);

    // Add Theme tab (always visible)
    const finalScreens = [...filteredScreens, THEME_TAB];
    console.log("🎨 Final Tab Screens:", finalScreens);

    return finalScreens;
  }, [permissions]);

  // Show loading state
  if (loading) {
    console.log("⏳ Loading permissions...");
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#fb923c" />
        <Text style={{ marginTop: 10 }}>Loading tabs...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    console.log("❌ Permission error:", error);
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: "red" }}>❌ Error: {error}</Text>
      </SafeAreaView>
    );
  }

  // Show no permission state
  if (tabScreens.length === 0) {
    console.log("🚫 No tabs to display. User has no permissions.");
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ textAlign: "center", color: "#555" }}>
          🚫 No permissions to view any tabs.
        </Text>
      </SafeAreaView>
    );
  }

  // Render tab navigator
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <PortalHeaderComp />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#fb923c",
          tabBarInactiveTintColor: "#999",
          tabBarStyle: {
            height: 60,
            paddingBottom: 6,
            paddingTop: 6,
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#eee",
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
