import React, { useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  StatusBar,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  Feather,
  MaterialIcons,
  FontAwesome5,
  Entypo,
} from "@expo/vector-icons";

import SearchEmployeeAndList from "./searchEmployeeandList";
import ShiftActivityLog from "./shiftActivityLog";
import RosterDashboard from "./rosterDashboard";
import CreateShift from "./createShift";

import PortalHeaderComp from "../../components/common/header/portalHeader/PortalHeaderComp";
import { usePermissions } from "../../context/PermissionContext";

const Tab = createBottomTabNavigator();

// Map module names from backend to screens
const PERMISSION_TO_SCREEN_MAP = {
  "search employee": {
    routeName: "SearchEmployeeAndList",
    component: SearchEmployeeAndList,
    title: "Search",
    icon: (color, size) => <Feather name="search" size={size} color={color} />,
    order: 1, // 👈 Add order
  },
  "shift activity log": {
    routeName: "ShiftActivityLog",
    component: ShiftActivityLog,
    title: "Activity Log",
    icon: (color, size) => (
      <MaterialIcons name="people-outline" size={size} color={color} />
    ),
    order: 2, // 👈 Add order
  },
  "create shift": {
    routeName: "CreateShift",
    component: CreateShift,
    title: "Shift",
    icon: (color, size) => <Entypo name="clock" size={size} color={color} />,
    order: 3, // 👈 Add order
  },
  // Uncomment if you want to add Dashboard later
  // "roster dashboard": {
  //   routeName: "RosterDashboard",
  //   component: RosterDashboard,
  //   title: "Dashboard",
  //   icon: (color, size) => (
  //     <FontAwesome5 name="chart-bar" size={size} color={color} />
  //   ),
  //   order: 4,
  // },
};

const RosterTabLayout = () => {
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

    // 🔥 Sort tabs by their order property
    filteredScreens.sort((a, b) => a.order - b.order);

    return filteredScreens;
  }, [permissions]);

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#fb923c" />
        <Text style={{ marginTop: 10 }}>Loading tabs...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: "red" }}>❌ Error: {error}</Text>
      </SafeAreaView>
    );
  }

  // Show no permission state
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

export default RosterTabLayout;
