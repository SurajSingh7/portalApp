import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Feather,
  MaterialIcons,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePermissions } from "../../../../context/PermissionContext";

const portalModules = {
  home: {
    name: "Home",
    icon: <Feather name="home" size={22} color="#fff" />, // smaller icon
    route: "/portal/home",
  },
  "circular/news": {
    name: "Circular/News",
    icon: (
      <MaterialCommunityIcons
        name="newspaper-variant-outline"
        size={22}
        color="#fff"
      />
    ),
    route: "/portal/circularNews",
  },
  "team report": {
    name: "Team Report",
    icon: (
      <MaterialIcons name="people-outline" size={22} color="#fff" />
    ),
    route: "/portal/teamReport",
  },
};

const rosterModules = {
  "search employee": {
    name: "Search",
    icon: <Feather name="search" size={22} color="#fff" />,
    route: "/roster/searchEmployeeandList",
  },
  "shift activity log": {
    name: "Activity Log",
    icon: <MaterialIcons name="assignment" size={22} color="#fff" />,
    route: "/roster/shiftActivityLog",
  },
  "create shift": {
    name: "Create Shift",
    icon: <Entypo name="clock" size={22} color="#fff" />,
    route: "/roster/createShift",
  },
};

const MainMenuModal = ({ visible, onClose }) => {
  const router = useRouter();
  const { userData, permissions } = usePermissions();

  const flattenModules = (modules = []) => {
    let flat = [];
    for (const mod of modules) {
      flat.push(mod);
      if (mod.children && mod.children.length > 0) {
        flat = flat.concat(flattenModules(mod.children));
      }
    }
    return flat;
  };

  const { portalFeatures, rosterFeatures } = useMemo(() => {
    const flattened = flattenModules(permissions || []);
    const allowedNames = flattened.map((mod) => mod.name?.trim().toLowerCase());

    const alwaysVisible = [
      portalModules.home,
      portalModules["circular/news"],
    ];

    const permissionBasedPortal = Object.entries(portalModules)
      .filter(([key]) => allowedNames.includes(key))
      .map(([, value]) => value);

    const uniquePortalFeatures = [
      ...alwaysVisible,
      ...permissionBasedPortal.filter(
        (feature) =>
          feature.route !== portalModules.home.route &&
          feature.route !== portalModules["circular/news"].route
      ),
    ];

    const rosterFeatures = Object.entries(rosterModules)
      .filter(([key]) => allowedNames.includes(key))
      .map(([, value]) => value);

    return { portalFeatures: uniquePortalFeatures, rosterFeatures };
  }, [permissions]);

  const handleNavigate = (route) => {
    onClose();
    router.push(route);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/60 items-center">
          {/* Spacer */}
          <View className="h-14" />

          <View className="w-[96%] bg-white rounded-2xl p-4 shadow-md">
            {/* Close button */}
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-3 top-3 z-10"
            >
              <Feather name="x" size={20} color="#000" />
            </TouchableOpacity>

            {/* Welcome Header */}
            <View className="pt-3 pb-3">
              <Text className="text-xl font-bold text-orange-600">
                Welcome 👋
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {userData?.name || "User"}, select an option below
              </Text>
            </View>

            {/* Portal Features */}
            {portalFeatures.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-800 mb-2">
                  Portal
                </Text>
                <View className="flex-row flex-wrap ">
                  {portalFeatures.map((feature, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleNavigate(feature.route)}
                      className="w-[22%] mb-3 items-center"
                    >
                      <View className="w-10 h-10 rounded-xl bg-orange-400 justify-center items-center shadow-sm">
                        {feature.icon}
                      </View>
                      <Text
                        className="text-[10px] text-gray-700 text-center mt-1"
                        numberOfLines={1}
                      >
                        {feature.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Roster Features */}
            {rosterFeatures.length > 0 && (
              <View>
                <Text className="text-sm font-semibold text-gray-800 mb-2">
                  Roster
                </Text>
                <View className="flex-row flex-wrap ">
                  {rosterFeatures.map((feature, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleNavigate(feature.route)}
                      className="w-[22%] mb-3 items-center"
                    >
                      <View className="w-10 h-10 rounded-xl bg-orange-400 justify-center items-center shadow-sm">
                        {feature.icon}
                      </View>
                      <Text
                        className="text-[10px] text-gray-700 text-center mt-1"
                        numberOfLines={1}
                      >
                        {feature.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MainMenuModal;
