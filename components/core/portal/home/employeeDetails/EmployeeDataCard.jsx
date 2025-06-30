import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';

const EmployeeDataCard = ({ userData }) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const fullName = `${userData?.firstName || ''} ${userData?.lastName === 'undefined' ? '' : userData?.lastName || ''}`.trim();

  const profileImage = userData?.profileImage?.includes('svg')
    ? `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(fullName)}&backgroundColor=fb923c&textColor=ffffff`
    : userData?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=fb923c&color=fff&size=200`;

  return (
    <>
      <View className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-200 w-full max-w-full self-center">
        <View className="flex-row p-6 items-center">
          {/* Profile section */}
          <View className="items-center mr-6 flex-shrink-0">
            <TouchableOpacity
              onPress={() => setImageModalVisible(true)}
              activeOpacity={0.7}
              className="shadow-lg"
            >
              <View className="bg-orange-200 p-1.5 rounded-3xl mb-3 shadow-md">
                <Image
                  source={{ uri: profileImage }}
                  className="w-20 h-20 rounded-2xl"
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>

            <View className="items-center mb-3 w-24">
              <Text className="text-gray-900 text-base font-bold text-center leading-tight" numberOfLines={2}>
                {fullName || 'No Name'}
              </Text>
            </View>

            <View className="bg-orange-500 rounded-xl px-4 py-1.5 items-center shadow-md">
              <Text className="text-white text-xs font-bold">
                {userData?.role || 'Employee'}
              </Text>
            </View>
          </View>

          {/* Right content */}
          <View className="flex-1 justify-center">
            <InfoRow
              label="Email Address"
              value={userData?.email || 'Not provided'}
              icon="📧"
            />
            <View className="h-4" />
            <InfoRow
              label="Department"
              value={userData?.department || 'Not assigned'}
              icon="🏢"
            />
            <View className="h-4" />
            <InfoRow
              label="Employee ID"
              value={userData?.employeeCode || 'Not assigned'}
              icon="🆔"
            />
          </View>
        </View>

        <View className="h-2 bg-orange-400 opacity-80" />
      </View>

      {/* Modal with blurred background */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <BlurView
          intensity={120}
          tint="dark"
          className="flex-1 justify-center items-center px-4"
        >
          <View className="bg-orange-100 border-2 border-orange-400 rounded-2xl w-full max-w-sm p-3">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-black text-lg font-bold" numberOfLines={1}>
                  {fullName || 'No Name'}
                </Text>
                <Text className="text-orange-500 text-sm font-semibold" numberOfLines={1}>
                  {userData?.role || 'Employee'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setImageModalVisible(false)}
                className="bg-orange-100 rounded-full px-2 py-1 ml-2"
              >
                <Text className="text-red-600 text-2xl">✕</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{ uri: profileImage }}
              className="w-full h-72 rounded-xl"
              resizeMode="cover"
            />
          </View>
        </BlurView>
      </Modal>
    </>
  );
};

const InfoRow = ({ label, value, icon }) => (
  <View className="flex-row items-center">
    <View className="w-9 h-9 bg-orange-200 rounded-full items-center justify-center mr-4 flex-shrink-0 shadow-sm">
      <Text className="text-base">{icon}</Text>
    </View>
    <View className="flex-1 min-w-0">
      <Text className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wider">
        {label}
      </Text>
      <Text className="text-gray-800 text-sm font-bold" numberOfLines={2}>
        {value}
      </Text>
    </View>
  </View>
);

export default EmployeeDataCard;
