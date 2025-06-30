"use client"

import { View, Text, Pressable } from "react-native"
import { useState, useCallback } from "react"
import EmployeeDetails from "./EmployeeDetails"
import CircularNews from "./CircularNews"
import QuickLinks from "./QuickLinks"
import { useFocusEffect } from "@react-navigation/native"

const HomeComp = () => {
  const [activeTab, setActiveTab] = useState("employee")

  // Reset activeTab every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setActiveTab("employee")
    }, []),
  )

  const renderTab = () => {
    switch (activeTab) {
      case "employee":
        return <EmployeeDetails />
      case "circular":
        return <CircularNews />
      case "links":
        return <QuickLinks />
      default:
        return null
    }
  }

  const tabList = [
    { id: "employee", label: "Employee Details" },
    { id: "circular", label: "Circular/News" },
    { id: "links", label: "Quick Links" },
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

export default HomeComp
