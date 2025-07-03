"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DateTimePicker from "@react-native-community/datetimepicker"
import { API_BASE_URL } from "../../../../../config/api"
import { getToken } from "../../../../../utils/storage"
import Toast from "react-native-toast-message"
import ShiftUpdater from "./ShiftUpdater"
import Icon from "react-native-vector-icons/Feather"

const { width, height } = Dimensions.get("window")

export default function EmployeeShiftManager() {
  const [employeeCode, setEmployeeCode] = useState("")
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
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

  // Animation values
  const fadeAnim = new Animated.Value(0)
  const slideAnim = new Animated.Value(30)

  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false)
  const [showToDatePicker, setShowToDatePicker] = useState(false)

  const [shiftInitializerForm, setShiftInitializerForm] = useState({
    employeeCode: "",
    name: "",
    shiftTime: "",
    shiftTimeId: "",
    fromDate: new Date(),
    toDate: new Date(),
    weeklyOff: "Sunday",
    login_id: "",
    isManualUpdate: true,
  })

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Helper function to get today's date
  const getTodayDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today
  }

  const getNext30DaysDate = () => {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + 30)
    return futureDate.toISOString()
  }

  const fetchData = async () => {
    setLoading(true)
    setError("")
    const startDate = new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()
    const endDate = getNext30DaysDate()
    const normalizedEmployeeCode = employeeCode.trim().toUpperCase()

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
        },
      )

      if (response.ok) {
        const result = await response.json()
        setData(result.slice(0, 30))
        setShowSuggestions(false)
      } else {
        const errorResponse = await response.json()
        setError(errorResponse.error || "Failed to fetch data")
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorResponse.error || "Failed to fetch data",
        })
      }
    } catch (err) {
      setError("An unexpected error occurred")
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred",
      })
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    try {
      const token = await getToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/employees/search?query=${query.trim()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        const unique = result.filter((v, i, self) => i === self.findIndex((t) => t.employeeCode === v.employeeCode))
        setSuggestions(unique)
      } else {
        setSuggestions([])
      }
    } catch {
      setSuggestions([])
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(employeeCode)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [employeeCode])

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

  useEffect(() => {
    if (isModalOpen || isUpdateRangeModalOpen) {
      fetchShiftNames()
    }
  }, [isModalOpen, isUpdateRangeModalOpen])

  useEffect(() => {
    if (selectedEmployee) {
      setShiftInitializerForm((prev) => ({
        ...prev,
        employeeCode: selectedEmployee.employeeCode || "",
        name: selectedEmployee.name || "",
        login_id: selectedEmployee.login_id || "",
        isManualUpdate: true,
        fromDate: getTodayDate(),
        toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        shiftTime: "",
        shiftTimeId: "",
        weeklyOff: "Sunday",
      }))
    }
  }, [selectedEmployee])

  const handleEdit = (item) => {
    setEditData({
      ...item,
      shiftTime: item.shiftTime || "",
      shiftTimeId: item.shiftTimeId || "",
      offday: item.offday || false,
    })
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditData(null)
  }

  const handleUpdateRangeModalClose = () => {
    setIsUpdateRangeModalOpen(false)
    setSelectedEmployee(null)
  }

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

  const handleUpdateShiftRange = (emp) => {
    setSelectedEmployee(emp)
    setIsUpdateRangeModalOpen(true)
  }

  const handleSuggestionClick = (sug) => {
    setEmployeeCode(sug.employeeCode)
    setShowSuggestions(false)
    fetchData()
  }

  const handleSearchClick = () => {
    if (!employeeCode.trim()) {
      setIsEmployeeCodeEmpty(true)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Employee code is required",
      })
      return
    }
    setIsEmployeeCodeEmpty(false)
    fetchData()
  }

  const validateDates = () => {
    const { fromDate, toDate } = shiftInitializerForm
    if (!fromDate) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "From Date is required.",
      })
      return false
    }
    if (!toDate) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "To Date is required.",
      })
      return false
    }
    if (new Date(toDate) < new Date(fromDate)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "To Date cannot be earlier than From Date.",
      })
      return false
    }
    return true
  }

  const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const dd = d.getUTCDate().toString().padStart(2, "0")
    const mm = (d.getUTCMonth() + 1).toString().padStart(2, "0")
    const yy = d.getUTCFullYear()
    return `${dd}/${mm}/${yy}`
  }

  const formatDateForDisplay = (date) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toLocaleDateString()
  }

  const handleShiftInitializerSubmit = async () => {
    if (!validateDates()) return
    if (!shiftInitializerForm.shiftTime) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a shift time",
      })
      return
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

      const res = await fetch(`${API_BASE_URL}/api/Shifts/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...shiftInitializerForm,
          fromDate: formatDate(shiftInitializerForm.fromDate),
          toDate: formatDate(shiftInitializerForm.toDate),
        }),
      })

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Data saved successfully!",
        })
        fetchData()
        handleUpdateRangeModalClose()
      } else {
        const err = await res.json()
        Toast.show({
          type: "error",
          text1: "Error",
          text2: err.message || "Failed to save data. Please try again.",
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

  const handleCustomShiftUpdater = (employee) => {
    setSelectedEmployee({
      code: employee.employeeCode,
      name: employee.name,
      login_id: employee.login_id || "",
    })
    setIsCustomShiftModalOpen(true)
  }

  const renderDataItem = (item, index) => (
    <Animated.View
      key={item._id}
      // style={{
      //   opacity: fadeAnim,
      //   transform: [{ translateY: slideAnim }],
      // }}
      className="mx-3 mb-3"
    >
      <View className=" rounded-lg border border-gray-200">
        {/* Card Header */}
        <View className="bg-blue-600 px-3 py-2 rounded-t-lg">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              <View className="w-6 h-6 bg-white/20 rounded-full items-center justify-center mr-2">
                <Icon name="user" size={12} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                  {item.employeeCode}
                </Text>
                <Text className="text-white/80 text-xs" numberOfLines={1}>
                  {item.name || "N/A"}
                </Text>
              </View>
            </View>
            {item.offday && (
              <View className="bg-red-500 px-2 py-1 rounded">
                <Text className="text-white text-xs font-bold">OFF</Text>
              </View>
            )}
          </View>
        </View>

        {/* Card Body */}
        <View className="p-3">
          <View className="flex-row justify-between mb-3">
            <View className="flex-1 mr-2">
              <View className="flex-row items-center mb-1">
                <Icon name="clock" size={10} color="#6366f1" />
                <Text className="text-gray-500 text-xs ml-1 font-medium">SHIFT</Text>
              </View>
              <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                {item.shiftTime}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Icon name="calendar" size={10} color="#6366f1" />
                <Text className="text-gray-500 text-xs ml-1 font-medium">DATE</Text>
              </View>
              <Text className="text-gray-900 font-semibold text-sm">{formatDate(item.date)}</Text>
              <Text className="text-gray-500 text-xs">{item.day}</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            className="bg-emerald-600 py-2 rounded-md flex-row items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Icon name="edit-3" size={12} color="white" />
            <Text className="text-white font-semibold text-xs ml-1">Edit Shift</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )

  const renderSuggestionItem = (item) => (
    <TouchableOpacity
      key={item._id}
      onPress={() => handleSuggestionClick(item)}
      className="p-2 border-b border-gray-100 flex-row items-center bg-white"
    >
      <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-2">
        <Icon name="user" size={10} color="white" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-900 text-xs" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-xs text-gray-500">{item.employeeCode}</Text>
      </View>
      <Icon name="chevron-right" size={12} color="#9ca3af" />
    </TouchableOpacity>
  )

  const weeklyOffOptions = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      {/* Compact Header */}
      <View className="bg-blue-600 pt-10 pb-4 px-3">
        <Animated.View
          // style={{
          //   opacity: fadeAnim,
          //   transform: [{ translateY: slideAnim }],
          // }}
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-white/20 rounded-lg items-center justify-center mr-2">
              <Icon name="users" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">Shift Manager</Text>
              <Text className="text-white/90 text-xs">Manage employee schedules</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Compact Search Card */}
        <Animated.View
          // style={{
          //   opacity: fadeAnim,
          //   transform: [{ translateY: slideAnim }],
          // }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mx-3 mb-3 mt-2"
        >
          <Text className="text-base font-bold text-gray-800 mb-2">Search Employee</Text>

          <View className="relative">
            <View
              className={`flex-row items-center border rounded-md px-2 py-2 ${
                isEmployeeCodeEmpty ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
              }`}
            >
              <Icon name="search" size={14} color="#6B7280" />
              <TextInput
                placeholder="Enter Employee Code"
                value={employeeCode}
                onChangeText={(text) => {
                  setEmployeeCode(text)
                  setIsEmployeeCodeEmpty(false)
                }}
                onFocus={() => setShowSuggestions(true)}
                className="flex-1 ml-2 text-sm text-gray-800"
                style={{ outlineWidth: 0, fontSize: 14 }}
                autoCapitalize="characters"
              />
            </View>

            {isEmployeeCodeEmpty && (
              <View className="flex-row items-center mt-1">
                <Icon name="alert-circle" size={12} color="#EF4444" />
                <Text className="text-red-500 text-xs ml-1">Employee code required</Text>
              </View>
            )}
          </View>

          {/* Compact Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <View className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm max-h-32">
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {suggestions.map((item) => renderSuggestionItem(item))}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSearchClick}
            disabled={loading}
            className={`mt-3 py-2 rounded-md flex-row items-center justify-center ${
              loading ? "bg-gray-400" : "bg-blue-600"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            {loading ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-semibold text-sm ml-2">Searching...</Text>
              </>
            ) : (
              <>
                <Icon name="search" size={14} color="white" />
                <Text className="text-white font-semibold text-sm ml-2">Search Employee</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Compact Action Buttons */}
        {data.length > 0 && (
          <View className="flex-row gap-2 mx-3 mb-3">
            <TouchableOpacity
              onPress={() => handleUpdateShiftRange(data[0])}
              className="flex-1 bg-purple-600 py-2 rounded-md flex-row items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Icon name="calendar" size={14} color="white" />
              <Text className="text-white font-semibold text-sm ml-1">Bulk Update</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleCustomShiftUpdater(data[0])}
              className="flex-1 bg-emerald-600 py-2 rounded-md flex-row items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Icon name="settings" size={14} color="white" />
              <Text className="text-white font-semibold text-sm ml-1">Custom</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Data Display */}
        {data.length > 0 ? (
          <View className="pb-4">{data.map((item, index) => renderDataItem(item, index))}</View>
        ) : (
          !loading && (
            <View className="items-center py-8 mx-3">
              <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mb-3">
                <Icon name="users" size={20} color="#9ca3af" />
              </View>
              <Text className="text-gray-500 text-sm font-medium text-center">No employees found</Text>
              <Text className="text-gray-400 text-xs text-center mt-1">Enter an employee code to get started</Text>
            </View>
          )
        )}

        {loading && (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-600 text-sm font-medium mt-2">Loading employees...</Text>
          </View>
        )}
      </ScrollView>

      {/* Enhanced Edit Modal */}
      <Modal
        visible={isModalOpen && editData !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="bg-blue-600 pt-12 pb-4 px-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white text-lg font-bold">Edit Employee</Text>
                <Text className="text-white/80 text-sm">Update shift details</Text>
              </View>
              <TouchableOpacity
                onPress={handleModalClose}
                className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
              >
                <Icon name="x" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Employee Info Card */}
            <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                  <Icon name="user" size={16} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base">
                    {editData ? `${editData.employeeCode}` : ""}
                  </Text>
                  <Text className="text-gray-600 text-sm">{editData?.name || "N/A"}</Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Icon name="calendar" size={14} color="#2563eb" />
                <Text className="text-gray-600 font-medium ml-2 text-sm">
                  {editData ? formatDate(editData.date) : ""}
                </Text>
              </View>
            </View>

            {/* Shift Selection */}
            <View className="mb-4">
              <Text className="text-gray-900 font-bold text-base mb-2">Select Shift</Text>
              <View className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
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

            {/* Week Off Toggle */}
            <View className="mb-6">
              <Text className="text-gray-900 font-bold text-base mb-2">Week Off Status</Text>
              <TouchableOpacity
                onPress={() => setEditData({ ...editData, offday: !editData.offday })}
                className={`flex-row items-center p-4 rounded-lg border ${
                  editData?.offday ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <View
                  className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                    editData?.offday ? "bg-red-500 border-red-500" : "border-gray-300"
                  }`}
                >
                  {editData?.offday && <Icon name="check" size={12} color="white" />}
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-sm">Mark as Week Off</Text>
                  <Text className="text-gray-500 text-xs">Employee will be off on this day</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleModalClose}
                className="flex-1 py-3 border border-gray-300 rounded-lg items-center"
              >
                <Text className="text-gray-700 font-semibold text-sm">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEditSubmit}
                className="flex-1 py-3 bg-emerald-600 rounded-lg flex-row items-center justify-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <Icon name="check" size={14} color="white" />
                <Text className="text-white font-semibold text-sm ml-1">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Enhanced Shift Initializer Modal */}
      <Modal
        visible={isUpdateRangeModalOpen && selectedEmployee !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleUpdateRangeModalClose}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="bg-purple-600 pt-12 pb-4 px-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white text-lg font-bold">Bulk Update</Text>
                <Text className="text-white/80 text-sm">Set shifts for date range</Text>
              </View>
              <TouchableOpacity
                onPress={handleUpdateRangeModalClose}
                className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
              >
                <Icon name="x" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Employee Info */}
            <View className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-purple-500 rounded-full items-center justify-center mr-3">
                  <Icon name="user" size={16} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base">
                    {selectedEmployee ? `${selectedEmployee.employeeCode}` : ""}
                  </Text>
                  <Text className="text-gray-600 text-sm">{selectedEmployee?.name || "N/A"}</Text>
                </View>
              </View>
            </View>

            {/* Shift Selection */}
            <View className="mb-4">
              <Text className="text-gray-900 font-bold text-base mb-2">Select Shift</Text>
              <View className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <Picker
                  selectedValue={shiftInitializerForm.shiftTime}
                  onValueChange={(itemValue) => {
                    const selectedShift = shiftNames.find((s) => s.shiftTime === itemValue)
                    setShiftInitializerForm((prev) => ({
                      ...prev,
                      shiftTime: itemValue,
                      shiftTimeId: selectedShift ? selectedShift._id : "",
                    }))
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

            {/* Date Range */}
            <View className="mb-4">
              <Text className="text-gray-900 font-bold text-base mb-2">Date Range</Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-gray-600 font-medium mb-1 text-sm">From Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowFromDatePicker(true)}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-3"
                  >
                    <Text className="text-gray-900 font-medium text-sm">
                      {formatDateForDisplay(shiftInitializerForm.fromDate)}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                  <Text className="text-gray-600 font-medium mb-1 text-sm">To Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowToDatePicker(true)}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-3"
                  >
                    <Text className="text-gray-900 font-medium text-sm">
                      {formatDateForDisplay(shiftInitializerForm.toDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Weekly Off Selection */}
            <View className="mb-6">
              <Text className="text-gray-900 font-bold text-base mb-2">Weekly Off Day</Text>
              <View className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                {weeklyOffOptions.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setShiftInitializerForm((prev) => ({ ...prev, weeklyOff: day }))}
                    className="flex-row items-center py-2"
                  >
                    <View
                      className={`w-5 h-5 border-2 rounded-full mr-3 items-center justify-center ${
                        shiftInitializerForm.weeklyOff === day ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {shiftInitializerForm.weeklyOff === day && <View className="w-2 h-2 bg-white rounded-full" />}
                    </View>
                    <Text className="text-gray-900 font-medium text-sm">{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleUpdateRangeModalClose}
                className="flex-1 py-3 border border-gray-300 rounded-lg items-center"
              >
                <Text className="text-gray-700 font-semibold text-sm">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShiftInitializerSubmit}
                className="flex-1 py-3 bg-purple-600 rounded-lg flex-row items-center justify-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <Icon name="check" size={14} color="white" />
                <Text className="text-white font-semibold text-sm ml-1">Save Shifts</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={shiftInitializerForm.fromDate}
          mode="date"
          display="default"
          minimumDate={getTodayDate()}
          onChange={(event, selectedDate) => {
            setShowFromDatePicker(false)
            if (selectedDate) {
              setShiftInitializerForm((prev) => ({ ...prev, fromDate: selectedDate }))
            }
          }}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={shiftInitializerForm.toDate}
          mode="date"
          display="default"
          minimumDate={shiftInitializerForm.fromDate}
          maximumDate={new Date("2025-12-31")}
          onChange={(event, selectedDate) => {
            setShowToDatePicker(false)
            if (selectedDate) {
              setShiftInitializerForm((prev) => ({ ...prev, toDate: selectedDate }))
            }
          }}
        />
      )}

      {/* Custom Shift Modal */}
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
