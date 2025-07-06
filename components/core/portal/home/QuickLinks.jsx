import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const QuickLinks = () => {
  return (
    <View style={styles.container}>
      {/* Icon */}
      <FontAwesome5 name="link" size={70} color="#38bdf8" />

      {/* Main Message */}
      <Text style={styles.title}>Quick Links Coming Soon</Text>

      {/* Sub Message */}
      <Text style={styles.subtitle}>
        Access your favorite shortcuts and resources here in the next update.
      </Text>

      {/* Fun Tagline */}
      <Text style={styles.tagline}>🚀 Stay tuned for faster navigation!</Text>
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
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 15,
  },
  tagline: {
    fontSize: 14,
    color: "#38bdf8",
    marginTop: 15,
    fontStyle: "italic",
  },
});

export default QuickLinks;
