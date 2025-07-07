import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { clearToken, getToken } from '../../../../utils/storage';
import { API_BASE_URL } from '../../../../config/api';
import Ionicons from '@expo/vector-icons/Ionicons'; // ✅ Import Ionicons

const PortalProfileMenu = ({ userData }) => {
  const router = useRouter();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleLogout = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/hrms/logout`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'reactnative',
        },
      });

      if (response.ok) {
        await clearToken();
        router.replace('/');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Logout Failed',
          text2: `Status: ${response.status}`,
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setDropdownVisible(!dropdownVisible)}
        className="flex-row items-center gap-2"
      >
        <Text className="text-white font-semibold text-sm">
          Hi, {userData?.firstName || 'User'} !
        </Text>
        <Image
          source={{ uri: userData?.profileImage || 'https://via.placeholder.com/36' }}
          className="w-8 h-8 rounded-full border-2 border-green-400"
        />
      </TouchableOpacity>

      <Modal
        transparent
        animationType="fade"
        visible={dropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View className="flex-1 bg-transparent ">
            <View className="absolute top-12 right-4 bg-[#0f172a] border-2 border-white rounded-md shadow-lg p-1  z-50 mt-2">
              {/* <Text className="text-gray-700 font-medium mb-2">{userData?.email}</Text> */}
              {/* <TouchableOpacity onPress={() => router.push('/')} className="py-2">
                <Text className="text-gray-800">Change Password</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/employee/username-alias')} className="py-2">
                <Text className="text-gray-800">Username Alias</Text>
              </TouchableOpacity> */}
               <TouchableOpacity onPress={handleLogout} className="px-2 flex-row gap-2 items-end  ">
                 <Ionicons name="log-out-outline" size={20} color="#fff" /> 
                <Text className="text-white text-base font-bold ">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default PortalProfileMenu;
