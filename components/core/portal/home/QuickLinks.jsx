import React from "react";
import { View, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import ThemColorsComp from "../../../common/theme/ThemColorsComp";

const QuickLinks = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white p-5">
      <ThemColorsComp />

      {/* Icon */}
      <FontAwesome5 name="link" size={40} color="#38bdf8" />

      {/* Main Message */}
      <Text className="text-2xl font-bold text-gray-800 mt-5">
        Quick Links Coming Soon
      </Text>

      {/* Sub Message */}
      <Text className="text-base text-gray-500 text-center mt-3 px-4">
        Access your favorite shortcuts and resources here in the next update.
      </Text>

      {/* Fun Tagline */}
      <Text className="text-sm text-sky-400 mt-4 italic">
        🚀 Stay tuned for faster navigation!
      </Text>
    </View>
  );
};

export default QuickLinks;
