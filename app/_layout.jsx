import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PermissionProvider } from '../context/PermissionContext';
import Toast from 'react-native-toast-message';
import "../global.css";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <PermissionProvider>
        <Slot />
        <Toast />
      </PermissionProvider>
    </SafeAreaProvider>
  );
}
