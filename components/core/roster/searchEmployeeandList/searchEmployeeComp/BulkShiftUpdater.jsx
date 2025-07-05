import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native"
import { Picker } from "@react-native-picker/picker"
import DateTimePicker from "@react-native-community/datetimepicker"
import { API_BASE_URL } from "../../../../../config/api"
import { getToken } from "../../../../../utils/storage"
import Toast from "react-native-toast-message"
import Icon from "react-native-vector-icons/Feather"

export default function BulkShiftUpdater({ isOpen, onClose, selectedEmployee, onUpdateSuccess }) {
  const [shiftNames, setShiftNames] = useState([])
  const [shiftLoading, setShiftLoading] = useState(false)
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

  // Helper function to get today's date
  const getTodayDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today
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

  useEffect(() => {
    if (isOpen) {
      fetchShiftNames()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedEmployee) {
      setShiftInitializerForm((prev) => ({
        ...prev,
        employeeCode: selectedEmployee.code || "",
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
        onUpdateSuccess()
        onClose()
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

  const weeklyOffOptions = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <>
      <Modal
        visible={isOpen && selectedEmployee !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-white">
          <View className="bg-purple-600 pt-3 pb-2 px-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white text-lg font-bold">Bulk Update</Text>
                <Text className="text-white/80 text-sm">Set shifts for date range</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-9 h-9 bg-white/20 rounded-full items-center justify-center"
              >
                <Icon name="x" size={26} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-purple-500 rounded-full items-center justify-center mr-3">
                  <Icon name="user" size={16} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base">
                    {selectedEmployee ? `${selectedEmployee.code}` : ""}
                  </Text>
                  <Text className="text-gray-600  text-sm">{selectedEmployee?.name || "N/A"}</Text>
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
              <View className="bg-gray-50 border  flex gap-3 flex-row flex-wrap border-gray-200 rounded-lg p-2">
                {weeklyOffOptions.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setShiftInitializerForm((prev) => ({ ...prev, weeklyOff: day }))}
                    className="flex-row items-center py-2"
                  >
                    <View
                      className={`w-5 h-5 border-2 rounded-full flex mr-1 items-center justify-center ${
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
                onPress={onClose}
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
    </>
  )
}
