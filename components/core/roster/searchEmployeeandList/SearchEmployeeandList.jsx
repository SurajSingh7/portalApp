import { View, Text, Pressable } from "react-native"
import { useState, useCallback } from "react"
import { useFocusEffect } from "@react-navigation/native"
import SearchEmployeeComp from "./searchEmployeeComp/SearchEmployeeComp"
import EmployeeListComp from "./EmployeeListComp"

const SearchEmployeeandList = () => {
  const [activeTab, setActiveTab] = useState("search")

  useFocusEffect(
    useCallback(() => {
      setActiveTab("search")
    }, []),
  )

  const renderTab = () => {
    switch (activeTab) {
      case "search":
        return <SearchEmployeeComp />
      case "list":
        return <EmployeeListComp />
      default:
        return null
    }
  }

  const tabList = [
    { id: "search", label: "Search Employee" },
    { id: "list", label: "Employee List" },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Tab Header */}
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

      {/* Tab Content */}
      <View style={{ flex: 1 }}>{renderTab()}</View>
    </View>
  )
}

export default SearchEmployeeandList
