import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { APP_BACKGROUND_COLOR, loadThemeColor } from "../../../config/api";
import { saveThemeColor, clearThemeColor } from "../../../utils/storage";

// 🟠 Company Colors (highlighted at top)
const companyColors = ["orange", "blue"];

// 🌈 All Other Colors
const otherColors = [
  "red", "amber", "yellow", "lime", "green",
  "emerald", "teal", "cyan", "sky", "indigo",
  "violet", "purple", "fuchsia", "pink", "rose", "gray"
];

const ThemColorsComp = () => {
  const [currentColor, setCurrentColor] = useState(APP_BACKGROUND_COLOR);

  useEffect(() => {
    const fetchColor = async () => {
      await loadThemeColor();
      setCurrentColor(APP_BACKGROUND_COLOR);
    };
    fetchColor();
  }, []);

  const changeTheme = async (color) => {
    await saveThemeColor(color);
    setCurrentColor(color);
  };

  const resetTheme = async () => {
    await clearThemeColor();
    setCurrentColor(APP_BACKGROUND_COLOR);
  };

  return (
    <View className={`flex-1 items-center justify-start p-6 bg-${currentColor}-50`}>
      {/* 🎨 Title */}
      <Text className="text-xl font-bold text-gray-800 mb-2">Choose Your Theme</Text>

      {/* 🟠 Company Colors (horizontal carousel) */}
      <Text className="text-lg font-semibold text-gray-700 mb-2">Primary Colors</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2"
      >
        {companyColors.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => changeTheme(color)}
            className={`w-10 h-10 rounded-full mx-2 justify-center items-center border-4 ${
              currentColor === color
                ? `border-${color}-800`
                : "border-transparent"
            } bg-${color}-500`}
          >
            {currentColor === color && (
              <MaterialIcons name="check" size={18} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🌈 Other Colors (grid view) */}
      <Text className="text-lg font-semibold text-gray-700 mb-2">Other Colors</Text>
      <ScrollView
        contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}
        className="max-h-72"
      >
        {otherColors.map((color) => (
          <View key={color} className="p-2">
            <TouchableOpacity
              onPress={() => changeTheme(color)}
              className={`w-8 h-8 rounded-full border-2 justify-center items-center shadow-md ${
                currentColor === color
                  ? `border-${color}-800`
                  : "border-gray-300"
              } bg-${color}-500`}
            >
              {currentColor === color && (
                <MaterialIcons name="check" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* 🔄 Reset Button */}
      <TouchableOpacity
        onPress={resetTheme}
        className="mt-6 bg-red-500 px-4 py-2 rounded-full shadow-lg"
      >
        <Text className="text-white font-bold text-base">Reset to Default</Text>
      </TouchableOpacity>

      {/* 🟣 Current Color */}
      <Text className="mt-4 text-gray-600">
        Current Color:{" "}
        <Text className={`text-${currentColor}-700 font-bold`}>
          {currentColor}
        </Text>
      </Text>
    </View>
  );
};

export default ThemColorsComp;
