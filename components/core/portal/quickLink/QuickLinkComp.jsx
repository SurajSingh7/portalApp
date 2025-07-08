
import { View, Text, Pressable } from "react-native"
import { useState, useCallback } from "react"
import { useFocusEffect } from "@react-navigation/native"
import UserNameAlias from "../../../common/header/portalHeader/UsernameAlias"
import ChangePasswordScreen from "../../../common/header/portalHeader/ChangePassword"
import ThemColorsComp from "../../../common/theme/ThemColorsComp"

const QuickLinkComp = () => {
  const [activeTab, setActiveTab] = useState("alias")

  // Reset activeTab every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setActiveTab("alias")
    }, []),
  )

  const renderTab = () => {
    switch (activeTab) {
      case "alias":
        return <UserNameAlias/>
      case "changePassword":
        return <ChangePasswordScreen/>
      case "theme":
        return <ThemColorsComp/>
      default:
        return null
    }
  }
  const tabList = [
    { id: "alias", label: "Username Alias" },
    { id: "changePassword", label: "Change Password" },
    { id: "theme", label: "Theme" },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Tab Header - Fixed */}
      <View className="flex-row justify-around bg-orange-50 border-b border-orange-200">
        {tabList.map((tab) => (
          <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} className="py-3 flex-1 items-center">
            <Text className={`text-sm ${activeTab === tab.id ? "text-orange-500 font-bold" : "text-gray-600"}`}>
              {tab.label}
            </Text>
            {activeTab === tab.id && <View className="h-1 w-5/6 bg-orange-500 mt-2 rounded-full" />}
          </Pressable>
        ))}
      </View>

      {/* Tab Content - Flexible */}
      <View style={{ flex: 1 }}>{renderTab()}</View>
    </View>
  )
}

export default QuickLinkComp
