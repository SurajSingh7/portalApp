import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const CircularNews = () => {
  return (
    <View style={styles.container}>
      {/* Icon */}
      <MaterialIcons name="announcement" size={80} color="#fb923c" />
      
      {/* Big "Coming Soon" text */}
      <Text style={styles.title}>Coming Soon</Text>

      {/* Subtext */}
      <Text style={styles.subtitle}>
        We’re working hard to bring you something amazing. Stay tuned!
      </Text>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 10,
  },
});

export default CircularNews;
