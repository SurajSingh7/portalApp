import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { usePermissions } from '../../../../context/PermissionContext';
import PortalProfileMenu from './PortalProfileMenu';
import MainMenuButton from './MainMenuButton';

const PortalHeaderComp = () => {
  const { userData, loading } = usePermissions();

  if (loading || !userData) {
    return (
      <View className="bg-[#0f172a] h-12 w-full flex-row justify-end items-center px-4">
        <ActivityIndicator color="#fff" size="small" />
      </View>
    );
  }

  return (
    <View className="bg-[#0f172a] h-14 w-full flex-row justify-between items-center px-[1%]">
      <Text className="text-white font-black text-base px-1">NETRA</Text>
       <MainMenuButton userData={userData} />
       <PortalProfileMenu userData={userData} />
    </View>
  );
};

export default PortalHeaderComp;
