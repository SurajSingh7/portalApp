"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Keyboard,
  RefreshControl,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { API_BASE_URL, APP_BACKGROUND_COLOR } from "../../../../../config/api"
import { getToken } from "../../../../../utils/storage"
import Toast from "react-native-toast-message"
import ShiftUpdater from "./CustomShiftUpdater"
import BulkShiftUpdater from "./BulkShiftUpdater"
import Icon from "react-native-vector-icons/Feather"

const { width, height } = Dimensions.get("window")

export default function EmployeeShiftManager() {
  const [employeeCode, setEmployeeCode] = useState("")
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [isUpdateRangeModalOpen, setIsUpdateRangeModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isEmployeeCodeEmpty, setIsEmployeeCodeEmpty] = useState(false)
  const [shiftNames, setShiftNames] = useState([])
  const [shiftLoading, setShiftLoading] = useState(false)
  const [isCustomShiftModalOpen, setIsCustomShiftModalOpen] = useState(false)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef(null)
  const abortControllerRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  const getNext30DaysDate = () => {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + 30)
    return futureDate.toISOString()
  }

  const fetchData = async (codeToSearch = null) => {
    // Cancel any ongoing search requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setLoading(true)
    setError("")
    setShowSuggestions(false)
    setSuggestions([])
    setSuggestionLoading(false)

    const startDate = new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()
    const endDate = getNext30DaysDate()
    const normalizedEmployeeCode = (codeToSearch || employeeCode).trim().toUpperCase()

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const token = await getToken()
      if (!token) {
        throw new Error("No authentication token")
      }

      const response = await fetch(
        `${API_BASE_URL}/api/employees?employeeCode=${normalizedEmployeeCode}&startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "reactnative",
            "Content-Type": "application/json",
          },
          signal: abortControllerRef.current.signal,
        },
      )

      if (response.ok) {
        const result = await response.json()
        setData(result.slice(0, 30))
        setShowSuggestions(false)
        setError("")
        Keyboard.dismiss()
      } else {
        const errorResponse = await response.json()
        const errorMsg = errorResponse.error || "Failed to fetch data"
        setError(errorMsg)
        setData([])
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMsg,
        })
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        const errorMsg = "An unexpected error occurred"
        setError(errorMsg)
        setData([])
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMsg,
        })
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const fetchSuggestions = async (query) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Validate query
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      setSuggestions([])
      setSuggestionLoading(false)
      setShowSuggestions(false)
      return
    }

    const trimmedQuery = query.trim()

    // Cancel previous suggestion request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setSuggestionLoading(true)

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      const token = await getToken()
      if (!token) {
        setSuggestionLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/employees/search?query=${encodeURIComponent(trimmedQuery)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
          "Content-Type": "application/json",
        },
        signal: abortControllerRef.current.signal,
      })

      if (response.ok) {
        const result = await response.json()

        // Robust data validation
        let validResults = []
        if (Array.isArray(result)) {
          validResults = result.filter((item) => {
            return item && typeof item === "object" && item._id && (item.name || item.employeeCode) && item.employeeCode
          })
        }

        // Remove duplicates based on employeeCode
        const uniqueResults = validResults.filter(
          (item, index, self) => index === self.findIndex((t) => t.employeeCode === item.employeeCode),
        )

        const limitedResults = uniqueResults.slice(0, 8)
        setSuggestions(limitedResults)

        // Show suggestions only if input is still focused and has valid query
        if (inputFocused && trimmedQuery.length >= 2) {
          setShowSuggestions(true)
        }
      } else {
        setSuggestions([])
        if (inputFocused && trimmedQuery.length >= 2) {
          setShowSuggestions(true)
        }
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setSuggestions([])
        if (inputFocused && trimmedQuery.length >= 2) {
          setShowSuggestions(true)
        }
      }
    } finally {
      setSuggestionLoading(false)
      abortControllerRef.current = null
    }
  }

  const fetchShiftNames = async () => {
    setShiftLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication Error",
          text2: "Please login again",
        })
        return
      }

      const res = await fetch(`${API_BASE_URL}/api/ShiftTime`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
          "Content-Type": "application/json",
        },
      })

      const json = await res.json()
      if (res.ok) {
        setShiftNames(Array.isArray(json.data) ? json.data : [])
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load shift times.",
        })
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error fetching shift times.",
      })
    } finally {
      setShiftLoading(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Only search if input is focused and has minimum length
    if (inputFocused && employeeCode && employeeCode.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(employeeCode)
      }, 300) // Increased debounce time for better performance
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setSuggestionLoading(false)
    }

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [employeeCode, inputFocused])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const onRefresh = async () => {
    if (!employeeCode.trim()) {
      Toast.show({
        type: "info",
        text1: "Info",
        text2: "Enter employee code to refresh data",
      })
      return
    }

    setRefreshing(true)
    try {
      await fetchData()
    } finally {
      setRefreshing(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    if (!suggestion || !suggestion.employeeCode) {
      return
    }

    // Clear all search states immediately
    setShowSuggestions(false)
    setSuggestions([])
    setSuggestionLoading(false)
    setInputFocused(false)

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set the employee code and fetch data
    setEmployeeCode(suggestion.employeeCode)
    inputRef.current?.blur()

    // Fetch data with the selected suggestion
    fetchData(suggestion.employeeCode)
  }

  const handleSearchClick = () => {
    const trimmedCode = employeeCode.trim()

    if (!trimmedCode) {
      setIsEmployeeCodeEmpty(true)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Employee code is required",
      })
      return
    }

    setIsEmployeeCodeEmpty(false)
    setShowSuggestions(false)
    setSuggestions([])
    fetchData()
  }

  const handleInputFocus = () => {
    setInputFocused(true)
    setIsEmployeeCodeEmpty(false)

    // Show suggestions if there's already text
    if (employeeCode && employeeCode.trim().length >= 2) {
      fetchSuggestions(employeeCode)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for suggestion clicks
    setTimeout(() => {
      setInputFocused(false)
      setShowSuggestions(false)
    }, 200)
  }

  const handleInputChange = (text) => {
    setEmployeeCode(text)
    setIsEmployeeCodeEmpty(false)
    setError("")

    // If text is cleared, clear data and suggestions
    if (!text.trim()) {
      setData([])
      setSuggestions([])
      setShowSuggestions(false)
      setSuggestionLoading(false)
    }
  }

  const clearSearch = () => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Clear all states
    setEmployeeCode("")
    setData([])
    setSuggestions([])
    setShowSuggestions(false)
    setIsEmployeeCodeEmpty(false)
    setInputFocused(false)
    setSuggestionLoading(false)
    setError("")

    // Focus input
    inputRef.current?.focus()
  }

  const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const dd = d.getUTCDate().toString().padStart(2, "0")
    const mm = (d.getUTCMonth() + 1).toString().padStart(2, "0")
    const yy = d.getUTCFullYear()
    return `${dd}/${mm}/${yy}`
  }

  const handleCustomShiftUpdater = (employee) => {
    setSelectedEmployee({
      code: employee.employeeCode,
      name: employee.name,
      login_id: employee.login_id || "",
    })
    setIsCustomShiftModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditData(item)
    setIsModalOpen(true)
    fetchShiftNames() // Add this line to fetch shifts when modal opens
  }

  const handleUpdateShiftRange = (item) => {
    setSelectedEmployee({
      code: item.employeeCode,
      name: item.name,
      login_id: item.login_id || "",
    })
    setIsUpdateRangeModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditData(null)
  }

  // const handleEditSubmit = () => {
  //   setIsModalOpen(false)
  //   setEditData(null)
  // }
  const handleEditSubmit = async () => {
      if (!editData.shiftTime) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please select a shift time",
        })
        return
      }
  
      const payload = {
        ...editData,
        shiftTime: editData.shiftTime,
        shiftTimeId: editData.shiftTimeId,
        offday: editData.offday,
        isManualUpdate: true,
      }
  
      try {
        const token = await getToken()
        if (!token) {
          Toast.show({
            type: "error",
            text1: "Authentication Error",
            text2: "Please login again",
          })
          return
        }
  
        const res = await fetch(`${API_BASE_URL}/api/Shifts/single`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "reactnative",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
  
        const responseData = await res.json()
        if (res.ok) {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: responseData.message || "Employee data updated successfully",
          })
          handleModalClose()
          fetchData()
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: responseData.message || "Failed to update data",
          })
        }
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Network error occurred",
        })
      }
    }

  const handleUpdateRangeModalClose = () => {
    setIsUpdateRangeModalOpen(false)
    setSelectedEmployee(null)
  }

  const renderDataItem = (item, index) => (
    <View key={item._id} className="mx-2 mb-2">
      <View
        className="bg-white rounded-xl overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        {/* Header with Weekly Off and Edit Button */}
        <View className="flex-row justify-between items-center px-3 py-2">
          <View
            className="px-2 py-1 rounded-full"
            style={{
              backgroundColor: item.offday ? "#EF4444" : "#10B981",
            }}
          >
            <Text className="text-white text-xs font-bold">
              {item.offday ? "Weekly Off" : "Working Day"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            className="bg-gray-900 px-2 py-1 rounded-lg flex-row items-center"
          >
            <Icon name="edit-3" size={10} color="white" />
            <Text className="text-white font-bold text-xs ml-1">Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Employee Info with Status */}
        <View
          className="mx-3 mb-2 p-2 rounded-lg"
          style={{
            backgroundColor: "#F8FAFC",
            borderLeftWidth: 3,
            borderLeftColor: "#10B981",
          }}
        >
          <Text className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">EMPLOYEE</Text>
          <Text className="text-black text-sm font-bold mb-0.5">{item.employeeCode}</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-xs">{item.name || "Employee Name"}</Text>
            <View className="flex-row items-center">
              <View
                className="w-1.5 h-1.5 rounded-full mr-1"
                style={{
                  backgroundColor: item.offday ? "#EF4444" : "#10B981",
                }}
              />
              <Text className={`font-semibold text-xs ${item.offday ? "text-red-700" : "text-green-700"}`}>
                {item.offday ? "Off" : "Active"}
              </Text>
            </View>
          </View>
        </View>

        {/* Two Column Layout */}
        <View className="flex-row mx-3 mb-2 gap-2">
          {/* Shift Time Section */}
          <View
            className="flex-1 p-2 rounded-lg"
            style={{
              backgroundColor: "#F8FAFC",
              borderLeftWidth: 3,
              borderLeftColor: "#8B5CF6",
            }}
          >
            <Text className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">SHIFT TIME</Text>
            <Text className="text-black text-xs font-bold">{item.shiftTime || "Not Assigned"}</Text>
          </View>

          {/* Date Section */}
          <View
            className="flex-1 p-2 rounded-lg"
            style={{
              backgroundColor: "#F8FAFC",
              borderLeftWidth: 3,
              borderLeftColor: "#F59E0B",
            }}
          >
            <Text className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">DATE</Text>
            <Text className="text-black text-xs font-bold mb-0.5">{formatDate(item.date)}</Text>
            <Text className="text-gray-600 text-xs">{item.day}</Text>
          </View>
        </View>
      </View>
    </View>
  )

  const renderSuggestionItem = (item, index) => {
    // Safety check for each item
    if (!item || typeof item !== "object") {
      return null
    }

    return (
      <TouchableOpacity
        key={item._id || item.employeeCode || `suggestion-${index}`}
        onPress={() => handleSuggestionClick(item)}
        className="p-2.5 border-b border-gray-100 flex-row items-center bg-white"
      >
        <View className="w-7 h-7 bg-purple-600 rounded-full items-center justify-center mr-2.5">
          <Icon name="user" size={10} color="white" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-gray-900 text-sm" numberOfLines={1}>
            {item.name || "Unknown Employee"}
          </Text>
          <Text className="text-xs text-purple-600 font-semibold">{item.employeeCode || "No Code"}</Text>
        </View>
        <Icon name="arrow-up-left" size={12} color="#8B5CF6" />
      </TouchableOpacity>
    )
  }

  return (
    <View className={`flex-1 bg-${APP_BACKGROUND_COLOR}-50`}>
      {/* <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" /> */}

      {/* <View className="bg-purple-600 pt-10 pb-4 px-3">
        <View className="flex-row items-center">
          <View className="w-9 h-9 bg-white/20 rounded-xl items-center justify-center mr-3">
            <Icon name="users" size={16} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">Shift Manager</Text>
            <Text className="text-white/90 text-xs font-medium">Manage employee schedules efficiently</Text>
          </View>
        </View>
      </View> */}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8B5CF6"]}
            tintColor="#8B5CF6"
            title="Pull to refresh"
            titleColor="#8B5CF6"
          />
        }
      >
        <View style={{ zIndex: 1000 }}>
          <View className="bg-white rounded-xl mx-3 mb-3 mt-3 p-3.5 shadow-lg shadow-purple-600/10">
            <View className="flex-row items-center mb-3">
              {/* <View className="w-6 h-6 bg-gray-100 rounded-xl items-center justify-center mr-2">
                <Icon name="search" size={12} color="#8B5CF6" />
              </View> */}
              <Text className="text-base font-bold text-gray-900">Search Employee</Text>
            </View>

            <View className="relative">
              <View
                className={`flex-row items-center border-2 rounded-2xl px-3 py-2.5 ${
                  isEmployeeCodeEmpty
                    ? "border-red-300 bg-red-50"
                    : showSuggestions && suggestions.length > 0
                      ? "border-purple-600 bg-gray-50"
                      : "border-gray-200 bg-gray-50"
                }`}
              >
                <Icon name="search" size={14} color="#8B5CF6" />
                <TextInput
                  ref={inputRef}
                  placeholder="Type employee code or name..."
                  placeholderTextColor="#9CA3AF"
                  value={employeeCode}
                  onChangeText={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="flex-1 ml-2.5 text-sm text-gray-900 font-medium"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={handleSearchClick}
                />
                {employeeCode.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} className="p-1">
                    <Icon name="x" size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
                {suggestionLoading && <ActivityIndicator size="small" color="#8B5CF6" className="ml-2" />}
              </View>

              {isEmployeeCodeEmpty && (
                <View className="flex-row items-center mt-1.5">
                  <Icon name="alert-circle" size={12} color="#EF4444" />
                  <Text className="text-red-500 text-xs ml-1.5 font-medium">Employee code is required</Text>
                </View>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <View className="mt-3">
                  <View className="bg-slate-50 px-3 py-1.5 rounded-t-lg border border-gray-200">
                    <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      {suggestions.length} Suggestions Found
                    </Text>
                  </View>
                  <View
                    className="border-l border-r border-b border-gray-200 rounded-b-lg overflow-hidden"
                    style={{ maxHeight: 240 }}
                  >
                    <ScrollView
                      style={{ maxHeight: 240 }}
                      showsVerticalScrollIndicator={true}
                      keyboardShouldPersistTaps="handled"
                      bounces={false}
                      scrollEventThrottle={16}
                      nestedScrollEnabled={true}
                    >
                      {suggestions.map((item, index) => renderSuggestionItem(item, index))}
                    </ScrollView>
                  </View>
                </View>
              )}

              {showSuggestions && employeeCode.length >= 2 && suggestions.length === 0 && !suggestionLoading && (
                <View className="mt-3 bg-white border border-gray-200 rounded-lg p-4">
                  <View className="items-center">
                    <Icon name="search" size={20} color="#9CA3AF" />
                    <Text className="text-gray-500 text-xs font-medium mt-1 text-center">No employees found</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {data.length > 0 && (
          <View className="flex-row gap-2 mx-3 mb-3">
            <TouchableOpacity
              onPress={() => handleUpdateShiftRange(data[0])}
              className="flex-1 py-2.5 rounded-2xl flex-row items-center justify-center"
              style={{
                backgroundColor: "#7C3AED",
                borderWidth: 2,
                borderColor: "#6D28D9",
                shadowColor: "#8B5CF6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <View
                className="w-5 h-5 bg-white/20 rounded-full items-center justify-center mr-2"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Icon name="calendar" size={10} color="white" />
              </View>
              <Text className="text-white font-bold text-xs">Bulk Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCustomShiftUpdater(data[0])}
              className="flex-1 py-2.5 rounded-2xl flex-row items-center justify-center"
              style={{
                backgroundColor: "#059669",
                borderWidth: 2,
                borderColor: "#047857",
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <View
                className="w-5 h-5 bg-white/20 rounded-full items-center justify-center mr-2"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Icon name="settings" size={10} color="white" />
              </View>
              <Text className="text-white font-bold text-xs">Custom</Text>
            </TouchableOpacity>
          </View>
        )}

        {data.length > 0 ? (
          <View className="pb-4">{data.map((item, index) => renderDataItem(item, index))}</View>
        ) : (
          !loading && (
            <View className="items-center py-8 mx-3">
              <View className="w-15 h-15 bg-gray-100 rounded-full items-center justify-center mb-3 shadow-lg shadow-purple-600/10">
                <Icon name="users" size={20} color="#8B5CF6" />
              </View>
              <Text className="text-gray-600 text-sm font-bold text-center mb-1">No employees found</Text>
              <Text className="text-gray-500 text-xs text-center">Enter an employee code to get started</Text>
            </View>
          )
        )}

        {loading && (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text className="text-gray-600 text-sm font-bold mt-2">Loading employees...</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isModalOpen && editData !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}
      >
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View
            style={{
              backgroundColor: "#8B5CF6",
              paddingTop: 10,
              paddingBottom: 10,
              paddingHorizontal: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  Edit Employee
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  Update shift details
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleModalClose}
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="x" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View
              style={{
                backgroundColor: "#F8FAFC",
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                shadowColor: "#8B5CF6",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: "#8B5CF6",
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Icon name="user" size={14} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#111827",
                      fontWeight: "bold",
                      fontSize: 15,
                    }}
                  >
                    {editData ? `${editData.employeeCode}` : ""}
                  </Text>
                  <Text
                    style={{
                      color: "#4B5563",
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    {editData?.name || "N/A"}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="calendar" size={12} color="#8B5CF6" />
                <Text
                  style={{
                    color: "#374151",
                    fontWeight: "bold",
                    marginLeft: 8,
                    fontSize: 12,
                  }}
                >
                  {editData ? formatDate(editData.date) : ""}
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: "#111827",
                  fontWeight: "bold",
                  fontSize: 15,
                  marginBottom: 8,
                }}
              >
                Select Shift
              </Text>
              <View
                style={{
                  borderWidth: 1.5,
                  borderColor: "#E5E7EB",
                  borderRadius: 8,
                  overflow: "hidden",
                  backgroundColor: "#F9FAFB",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Picker
                  selectedValue={editData?.shiftTime || ""}
                  onValueChange={(itemValue) => {
                    const selectedShift = shiftNames.find((s) => s.shiftTime === itemValue)
                    setEditData({
                      ...editData,
                      shiftTime: itemValue,
                      shiftTimeId: selectedShift ? selectedShift._id : "",
                    })
                  }}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Select a Shift" value="" />
                  {shiftLoading ? (
                    <Picker.Item label="Loading shifts..." value="" enabled={false} />
                  ) : (
                    shiftNames.map((shift) => (
                      <Picker.Item key={shift._id} label={shift.shiftTime} value={shift.shiftTime} />
                    ))
                  )}
                </Picker>
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: "#111827",
                  fontWeight: "bold",
                  fontSize: 15,
                  marginBottom: 8,
                }}
              >
                Week Off Status
              </Text>
              <TouchableOpacity
                onPress={() => setEditData({ ...editData, offday: !editData.offday })}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 14,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: editData?.offday ? "#FCA5A5" : "#E5E7EB",
                  backgroundColor: editData?.offday ? "#FEF2F2" : "#F9FAFB",
                  shadowColor: editData?.offday ? "#EF4444" : "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderWidth: 1.5,
                    borderRadius: 6,
                    marginRight: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: editData?.offday ? "#EF4444" : "#9CA3AF",
                    backgroundColor: editData?.offday ? "#EF4444" : "transparent",
                  }}
                >
                  {editData?.offday && <Icon name="check" size={10} color="white" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#111827",
                      fontWeight: "bold",
                      fontSize: 13,
                    }}
                  >
                    Mark as Week Off
                  </Text>
                  <Text
                    style={{
                      color: "#4B5563",
                      fontSize: 11,
                      fontWeight: "500",
                    }}
                  >
                    Employee will be off on this day
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={handleModalClose}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: "#9CA3AF",
                  borderRadius: 2,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text
                  style={{
                    color: "#374151",
                    fontWeight: "bold",
                    fontSize: 13,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEditSubmit}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: "#10B981",
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Icon name="check" size={12} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 13,
                    marginLeft: 6,
                  }}
                >
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <BulkShiftUpdater
        isOpen={isUpdateRangeModalOpen}
        onClose={handleUpdateRangeModalClose}
        selectedEmployee={selectedEmployee}
        onUpdateSuccess={fetchData}
      />

      <ShiftUpdater
        isOpen={isCustomShiftModalOpen}
        onClose={() => setIsCustomShiftModalOpen(false)}
        employeeCode={selectedEmployee?.code || ""}
        employeeName={selectedEmployee?.name || ""}
        login_id={selectedEmployee?.login_id || ""}
        onUpdateSuccess={fetchData}
      />
    </View>
  )
}
