import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { usePermissions } from '../../../context/PermissionContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeComp = () => {
  const { userData, loading } = usePermissions();
  const router = useRouter();

  if (loading || !userData) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Text className="text-lg font-semibold text-gray-700">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View className="px-6 pt-10 pb-6">
        <Text className="text-3xl font-extrabold text-orange-700">Welcome 👋</Text>
        <Text className="text-xl font-semibold text-orange-900 mt-1">
          Hi, {userData?.firstName} {userData?.lastName}
        </Text>
      </View>

      <View className="flex-1 px-6 justify-center">
        <TouchableOpacity
          className="bg-orange-300 rounded-2xl py-4 mb-5 shadow-lg"
          onPress={() => router.push('/(PortalTab)/portalHome')}
        >
          <Text className="text-white text-center text-lg font-bold">Go to Portal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-orange-300 rounded-2xl py-4 shadow-lg"
          onPress={() => router.push('/(RosterTab)/searchEmployeeandEmployees')}
        >
          <Text className="text-white text-center text-lg font-bold">Go to Roster</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeComp;
