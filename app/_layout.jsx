import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PermissionProvider } from "../context/PermissionContext";
import { ThemeProvider } from "../context/ThemeContext";
import Toast from "react-native-toast-message";
import "../global.css";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <PermissionProvider>
        <ThemeProvider>
          <Slot />
          <Toast />
        </ThemeProvider>
      </PermissionProvider>
    </SafeAreaProvider>
  );
}
