"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native"
import { User, Trash2, Edit3, ChevronDown, ChevronUp, Info, HelpCircle } from "lucide-react-native"
import { API_BASE_URL } from "../../../../config/api"
import { getToken, clearToken } from "../../../../utils/storage"
import { useRouter } from "expo-router"

const AccordionItem = ({ title, children, icon: Icon, isOpen, onToggle }) => {
  return (
    <View className="border border-orange-200 rounded-xl overflow-hidden mb-3">
      <TouchableOpacity
        onPress={onToggle}
        className="flex flex-row items-center justify-between bg-orange-50 px-3 py-2.5"
      >
        <View className="flex flex-row items-center space-x-2">
          <View className="bg-orange-100 rounded-full p-1">
            <Icon size={14} color="#EA580C" />
          </View>
          <Text className="text-sm font-semibold text-gray-800">{title}</Text>
        </View>
        {isOpen ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
      </TouchableOpacity>
      {isOpen && (
        <View className="bg-white px-3 py-2.5">
          <Text className="text-xs text-gray-600 leading-relaxed">{children}</Text>
        </View>
      )}
    </View>
  )
}

const UserNameAlias = () => {
  const [alias, setAlias] = useState("")
  const [currentAlias, setCurrentAlias] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [whyAccordionOpen, setWhyAccordionOpen] = useState(false)
  const [howAccordionOpen, setHowAccordionOpen] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const router = useRouter()

  const fetchCurrentAlias = async () => {
    try {
      const token = await getToken()
      if (!token) {
        router.replace("/")
        return
      }
      const res = await fetch(`${API_BASE_URL}/hrms/username-alias`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "reactnative",
        },
      })
      if (res.status === 401) {
        await clearToken()
        router.replace("/")
        return
      }
      const data = await res.json()
      if (res.ok) {
        setCurrentAlias(data.data.usernameAlias || "")
      } else {
        console.log("Fetch failed:", data.message)
      }
    } catch (err) {
      console.error("Error fetching alias:", err)
    }
  }

  const handleAliasChange = (value) => {
    const trimmed = value.slice(0, 30)
    setAlias(trimmed)
    setCharacterCount(trimmed.length)
  }

  const handleSubmit = async () => {
    if (!alias.trim()) return
    setIsLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE_URL}/hrms/username-alias`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "reactnative",
        },
        body: JSON.stringify({ usernameAlias: alias }),
      })
      const data = await res.json()
      if (res.ok) {
        setCurrentAlias(alias)
        setAlias("")
        setCharacterCount(0)
      } else {
        console.error("Failed to update alias:", data.message)
      }
    } catch (err) {
      console.error("Error updating alias:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE_URL}/hrms/username-alias`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
        },
      })
      if (res.ok) {
        setCurrentAlias("")
      } else {
        const data = await res.json()
        console.error("Failed to delete alias:", data.message)
      }
    } catch (err) {
      console.error("Error deleting alias:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentAlias()
  }, [])

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Clean White Header */}
      <View className="bg-white px-4 pt-4 pb-6 rounded-b-3xl shadow-sm">
        <View className="items-center">
          {/* Orange Icon Container */}
          <View className="bg-orange-100 rounded-full p-4 mb-3 shadow-sm">
            <User size={28} color="#EA580C" />
          </View>

          {/* Title Section */}
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-800 mb-1">Username Alias</Text>
            <View className="w-12 h-0.5 bg-orange-400 rounded-full mb-2" />
            <Text className="text-gray-600 text-center text-sm px-4">Create an easy-to-remember alias</Text>
          </View>
        </View>
      </View>

      <View className="px-4 py-4">
        {/* Current Alias Display */}
        {currentAlias ? (
          <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center space-x-2">
                <View className="bg-green-100 rounded-full p-1.5">
                  <User size={14} color="#16a34a" />
                </View>
                <View>
                  <Text className="text-xs font-medium text-green-600 uppercase">Current Alias</Text>
                  <Text className="text-sm font-bold text-green-800">{currentAlias}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isLoading}
                className="flex-row items-center bg-red-500 px-3 py-1.5 rounded-lg"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Trash2 size={12} color="#fff" />
                    <Text className="ml-1 text-white font-medium text-xs">Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Alias Form */}
        <View className="bg-white border border-orange-200 rounded-xl p-3 mb-4 shadow-sm">
          <View className="flex-row items-center space-x-2 mb-3">
            <View className="bg-orange-100 rounded-full p-1.5">
              <Edit3 size={14} color="#EA580C" />
            </View>
            <Text className="text-sm font-bold text-gray-800">{currentAlias ? "Update Alias" : "Create Alias"}</Text>
          </View>

          <View className="bg-gray-50 border border-orange-200 rounded-lg px-3 py-2 mb-2">
            <TextInput
              value={alias}
              onChangeText={handleAliasChange}
              placeholder="Enter your alias"
              placeholderTextColor="#9CA3AF"
              maxLength={30}
              editable={!isLoading}
              className="text-gray-800 text-sm"
            />
          </View>

          <Text className="text-right text-gray-500 text-xs mb-3">{characterCount}/30</Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !alias.trim()}
            className={`flex-row justify-center items-center bg-orange-500 px-3 py-2.5 rounded-lg ${
              isLoading || !alias.trim() ? "opacity-100" : "active:bg-orange-600"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Edit3 size={14} color="#fff" />
                <Text className="ml-2 text-white font-semibold text-sm">
                  {currentAlias ? "Update Alias" : "Create Alias"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Compact Accordions */}
        <AccordionItem
          title="Why set a username alias?"
          icon={Info}
          isOpen={whyAccordionOpen}
          onToggle={() => setWhyAccordionOpen(!whyAccordionOpen)}
        >
          You can use your alias to log in instead of your username. It makes logging in easier and more memorable.
        </AccordionItem>

        <AccordionItem
          title="How to use your username alias?"
          icon={HelpCircle}
          isOpen={howAccordionOpen}
          onToggle={() => setHowAccordionOpen(!howAccordionOpen)}
        >
          At login, simply enter your alias instead of your username. Both will work to access your account.
        </AccordionItem>
      </View>
    </ScrollView>
  )
}

export default UserNameAlias
