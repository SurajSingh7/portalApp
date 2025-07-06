import AsyncStorage from "@react-native-async-storage/async-storage";

// =========================
// 🔑 Auth Token Management
// =========================
export const setToken = (token) => AsyncStorage.setItem("authToken", token);
export const getToken = () => AsyncStorage.getItem("authToken");
export const clearToken = () => AsyncStorage.removeItem("authToken");

// =========================
// 📝 Remembered Credentials
// =========================
export const saveCredentials = async (username, password) => {
  await AsyncStorage.setItem("rememberedUsername", username);
  await AsyncStorage.setItem("rememberedPassword", password);
};

export const getCredentials = async () => {
  const username = await AsyncStorage.getItem("rememberedUsername");
  const password = await AsyncStorage.getItem("rememberedPassword");
  return { username, password };
};

export const clearCredentials = async () => {
  await AsyncStorage.removeItem("rememberedUsername");
  await AsyncStorage.removeItem("rememberedPassword");
};

// =========================
// 🎨 Theme Color Management
// =========================
const THEME_COLOR_KEY = "themeColor";

// Save selected theme color
export const saveThemeColor = async (color) => {
  try {
    await AsyncStorage.setItem(THEME_COLOR_KEY, color);
  } catch (error) {
    console.error("Error saving theme color:", error);
  }
};

// Load saved theme color
export const getThemeColor = async () => {
  try {
    const color = await AsyncStorage.getItem(THEME_COLOR_KEY);
    return color; // Returns null if not set
  } catch (error) {
    console.error("Error loading theme color:", error);
    return null;
  }
};

// Clear theme color (reset to default)
export const clearThemeColor = async () => {
  try {
    await AsyncStorage.removeItem(THEME_COLOR_KEY);
  } catch (error) {
    console.error("Error clearing theme color:", error);
  }
};
