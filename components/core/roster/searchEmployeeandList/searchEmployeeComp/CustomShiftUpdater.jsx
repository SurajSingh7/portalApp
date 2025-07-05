"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Animated, StatusBar } from "react-native"
import { Picker } from "@react-native-picker/picker"
import DateTimePicker from "@react-native-community/datetimepicker"
import { API_BASE_URL } from "../../../../../config/api"
import { getToken } from "../../../../../utils/storage"
import Toast from "react-native-toast-message"
import Icon from "react-native-vector-icons/Feather"

const CustomShiftUpdater = ({ isOpen, onClose, employeeCode, employeeName, login_id, onUpdateSuccess }) => {
  const [shiftNames, setShiftNames] = useState([])
  const [shiftLoading, setShiftLoading] = useState(false)
  const [shifts, setShifts] = useState([])
  const [currentShift, setCurrentShift] = useState({
    shiftTime: "",
    selectedDays: [],
    scheduleType: "always",
    startDate: new Date(),
    endDate: new Date(),
    weekOff: [],
  })
  const [showAddMore, setShowAddMore] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)

  // Animation
  const fadeAnim = new Animated.Value(0)

  useEffect(() => {
    if (isOpen) {
      fetchShiftNames()
      setShifts([])
      setCurrentShift({
        shiftTime: "",
        selectedDays: [],
        scheduleType: "always",
        startDate: new Date(),
        endDate: new Date(),
        weekOff: [],
      })

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [isOpen])

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

  const daysOfWeek = [
    { id: "sunday", label: "Sunday", short: "Sun" },
    { id: "monday", label: "Monday", short: "Mon" },
    { id: "tuesday", label: "Tuesday", short: "Tue" },
    { id: "wednesday", label: "Wednesday", short: "Wed" },
    { id: "thursday", label: "Thursday", short: "Thu" },
    { id: "friday", label: "Friday", short: "Fri" },
    { id: "saturday", label: "Saturday", short: "Sat" },
  ]

  const getUsedDays = () => shifts.flatMap((s) => s.selectedDays)

  const getRemainingDays = () => {
    const used = getUsedDays()
    return daysOfWeek.filter((d) => !used.includes(d.id))
  }

  const handleShiftSelect = (shiftTime) => {
    setCurrentShift({ ...currentShift, shiftTime, selectedDays: [] })
  }

  const handleDayToggle = (dayId) => {
    setCurrentShift((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayId)
        ? prev.selectedDays.filter((d) => d !== dayId)
        : [...prev.selectedDays, dayId],
    }))
  }

  const handleWeekOffToggle = (dayId) => {
    setCurrentShift((prev) => ({
      ...prev,
      weekOff: prev.weekOff.includes(dayId) ? prev.weekOff.filter((d) => d !== dayId) : [...prev.weekOff, dayId],
    }))
  }

  const addShift = () => {
    if (currentShift.shiftTime && currentShift.selectedDays.length > 0) {
      setShifts((prev) => [...prev, { ...currentShift, id: Date.now() }])
      setCurrentShift({
        shiftTime: "",
        selectedDays: [],
        scheduleType: "always",
        startDate: new Date(),
        endDate: new Date(),
        weekOff: [],
      })
      setShowAddMore(false)
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select shift time and working days",
      })
    }
  }

  const removeShift = (id) => {
    setShifts((prev) => prev.filter((s) => s.id !== id))
  }

  const formatDays = (dayIds) => dayIds.map((id) => daysOfWeek.find((d) => d.id === id)?.short).join(", ")

  const formatDateForDisplay = (date) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString()
  }

  const getTodayDate = () => new Date()

  useEffect(() => {
    const rem = getRemainingDays()
    setShowAddMore(currentShift.selectedDays.length > 0 && rem.length > 0)
  }, [currentShift.selectedDays, shifts])

  const handleSave = async () => {
    if (shifts.length === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please add at least one shift schedule",
      })
      return
    }

    setIsSaving(true)
    const payload = {
      employeeCode,
      schedules: shifts.map((shift) => ({
        shiftTime: shift.shiftTime,
        days: shift.selectedDays,
        scheduleType: shift.scheduleType,
        startDate: shift.scheduleType === "dateRange" ? shift.startDate.toISOString() : null,
        endDate: shift.scheduleType === "dateRange" ? shift.endDate.toISOString() : null,
        weekOff: shift.weekOff,
      })),
      login_id: login_id,
      name: employeeName,
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

      const res = await fetch(`${API_BASE_URL}/api/Shifts/custom-shift-update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Shift schedules saved successfully!",
        })
        onUpdateSuccess()
        onClose()
      } else {
        const error = await res.json()
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Failed to save shifts",
        })
      }
    } catch (err) {
      console.error("Error saving shifts:", err)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Network error. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderShiftItem = (item) => (
    <Animated.View key={item.id} className="mb-3">
      <View className="bg-white rounded-lg shadow-sm border border-gray-200">
        <View className="bg-blue-500 px-3 py-2 rounded-t-lg">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                {item.shiftTime}
              </Text>
              <Text className="text-white/80 text-xs">{formatDays(item.selectedDays)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => removeShift(item.id)}
              className="w-6 h-6 bg-white/20 rounded-full items-center justify-center"
            >
              <Icon name="x" size={12} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-3">
          <View className="flex-row items-center mb-1">
            <Icon name="calendar" size={12} color="#6366f1" />
            <Text className="text-gray-600 ml-1 font-medium text-xs">
              {item.scheduleType === "always"
                ? "Always Active"
                : `${formatDateForDisplay(item.startDate)} to ${formatDateForDisplay(item.endDate)}`}
            </Text>
          </View>
          {item.weekOff.length > 0 && (
            <View className="flex-row items-center">
              <Icon name="moon" size={12} color="#ef4444" />
              <Text className="text-red-600 font-medium ml-1 text-xs">Week Off: {formatDays(item.weekOff)}</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  )

  const renderDayItem = (day) => {
    const used = getUsedDays().includes(day.id)
    const sel = currentShift.selectedDays.includes(day.id)
    const disabled = used && !sel

    return (
      <TouchableOpacity
        key={day.id}
        onPress={() => !disabled && handleDayToggle(day.id)}
        disabled={disabled}
        className={`flex-1 items-center p-2 rounded-lg border m-1 ${
          disabled
            ? "bg-gray-100 border-gray-200 opacity-50"
            : sel
              ? "bg-blue-100 border-blue-500"
              : "bg-white border-gray-200"
        }`}
      >
        <Text className={`font-semibold text-xs ${sel ? "text-blue-900" : "text-gray-900"}`}>{day.short}</Text>
        {disabled && <Text className="text-xs text-red-500 font-medium">Used</Text>}
      </TouchableOpacity>
    )
  }

  const renderWeekOffDayItem = (dayId) => {
    const day = daysOfWeek.find((d) => d.id === dayId)
    const isOff = currentShift.weekOff.includes(dayId)

    return (
      <TouchableOpacity
        key={dayId}
        onPress={() => handleWeekOffToggle(dayId)}
        className={`flex-1 items-center p-2 rounded-lg border m-1 ${
          isOff ? "bg-red-100 border-red-300" : "bg-white border-gray-200"
        }`}
      >
        <Text className={`font-semibold text-xs ${isOff ? "text-red-900" : "text-gray-900"}`}>{day.short}</Text>
        <Text className={`text-xs ${isOff ? "text-red-700" : "text-gray-600"}`}>{isOff ? "Off" : "Work"}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View className="flex-1 bg-gray-50">
        <StatusBar barStyle="light-content" backgroundColor="#059669" />

        {/* Compact Header */}
        <View className="bg-emerald-600 pt-3 pb-2 px-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <View className="w-6 h-6 bg-white/20 rounded-full items-center justify-center mr-2">
                  <Icon name="settings" size={12} color="white" />
                </View>
                <Text className="text-white text-base font-bold">Custom Shifts</Text>
              </View>
              <Text className="text-white/90 text-sm font-semibold" numberOfLines={1}>
                {employeeName}
              </Text>
              <Text className="text-white/70 text-xs">Code: {employeeCode}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 bg-white/20 rounded-full items-center justify-center"
            >
              <Icon name="x" size={26} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 p-3" showsVerticalScrollIndicator={false}>
          {/* Active Shifts */}
          {shifts.length > 0 && (
            <View className="mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-2">
                  <Icon name="check" size={12} color="white" />
                </View>
                <Text className="text-base font-bold text-gray-900">Active Schedules</Text>
              </View>
              <View>{shifts.map((item) => renderShiftItem(item))}</View>
            </View>
          )}

          {/* Shift Setup */}
          <View className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <Text className="text-base font-bold text-gray-900 mb-3">
              {shifts.length === 0 ? "Create New Schedule" : "Add Another Schedule"}
            </Text>

            {/* 1. Shift Time */}
            <View className="mb-3">
              <Text className="text-gray-900 font-semibold text-sm mb-2">1. Select Shift Time</Text>
              <View className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <Picker
                  selectedValue={currentShift.shiftTime}
                  onValueChange={(itemValue) => handleShiftSelect(itemValue)}
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

            {/* 2. Working Days */}
            {currentShift.shiftTime && (
              <View className="mb-3">
                <Text className="text-gray-900 font-semibold text-sm mb-2">2. Select Working Days</Text>
                <View className="flex-row flex-wrap">{daysOfWeek.map((day) => renderDayItem(day))}</View>
              </View>
            )}

            {/* 3. Schedule Type */}
            {currentShift.selectedDays.length > 0 && (
              <View className="mb-3">
                <Text className="text-gray-900 font-semibold text-sm mb-2">3. Schedule Duration</Text>
                <View className="flex-row gap-4 mb-3">
                  <TouchableOpacity
                    onPress={() => setCurrentShift((prev) => ({ ...prev, scheduleType: "always" }))}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 border-2 rounded-full mr-2 items-center justify-center ${
                        currentShift.scheduleType === "always" ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {currentShift.scheduleType === "always" && <View className="w-2 h-2 bg-white rounded-full" />}
                    </View>
                    <Text className="text-gray-700 font-medium text-sm">Always Active</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setCurrentShift((prev) => ({ ...prev, scheduleType: "dateRange" }))}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 border-2 rounded-full mr-2 items-center justify-center ${
                        currentShift.scheduleType === "dateRange" ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {currentShift.scheduleType === "dateRange" && <View className="w-2 h-2 bg-white rounded-full" />}
                    </View>
                    <Text className="text-gray-700 font-medium text-sm">Date Range</Text>
                  </TouchableOpacity>
                </View>

                {currentShift.scheduleType === "dateRange" && (
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Text className="text-gray-600 font-medium mb-1 text-xs">Start Date</Text>
                      <TouchableOpacity
                        onPress={() => setShowStartDatePicker(true)}
                        className="bg-gray-50 border border-gray-300 rounded-lg p-2"
                      >
                        <Text className="text-gray-900 font-medium text-xs">
                          {formatDateForDisplay(currentShift.startDate)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-600 font-medium mb-1 text-xs">End Date</Text>
                      <TouchableOpacity
                        onPress={() => setShowEndDatePicker(true)}
                        className="bg-gray-50 border border-gray-300 rounded-lg p-2"
                      >
                        <Text className="text-gray-900 font-medium text-xs">
                          {formatDateForDisplay(currentShift.endDate)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* 4. Week Off */}
            {currentShift.selectedDays.length > 0 && (
              <View className="mb-3">
                <View className="flex-row items-center mb-2">
                  <Text className="text-gray-900 font-semibold text-sm">4. Week Off Days</Text>
                  <View className="ml-1 w-4 h-4 bg-blue-100 rounded-full items-center justify-center">
                    <Icon name="info" size={8} color="#3b82f6" />
                  </View>
                </View>
                <Text className="text-gray-600 text-xs mb-2">
                  Select days to treat as weekly holidays within your working days.
                </Text>
                <View className="flex-row flex-wrap">
                  {currentShift.selectedDays.map((dayId) => renderWeekOffDayItem(dayId))}
                </View>
              </View>
            )}

            {/* Add Shift Button */}
            {currentShift.selectedDays.length > 0 && (
              <TouchableOpacity
                onPress={addShift}
                className="bg-blue-600 py-2 rounded-lg flex-row items-center justify-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <Icon name="plus" size={14} color="white" />
                <Text className="text-white font-semibold text-sm ml-1">Add Shift Schedule</Text>
              </TouchableOpacity>
            )}

            {/* Add More Notice */}
            {showAddMore && shifts.length > 0 && (
              <View className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <View className="flex-row items-center mb-1">
                  <Icon name="alert-triangle" size={12} color="#f59e0b" />
                  <Text className="text-yellow-800 font-semibold text-xs ml-1">Remaining Days Available</Text>
                </View>
                <Text className="text-yellow-700 text-xs mb-1">
                  <Text className="font-bold">Days left:</Text> {formatDays(getRemainingDays().map((d) => d.id))}
                </Text>
                <Text className="text-yellow-600 text-xs">
                  You can create another shift schedule for the remaining days.
                </Text>
              </View>
            )}
          </View>

          {/* Summary Card */}
          {shifts.length > 0 && (
            <View className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <View className="flex-row items-center mb-2">
                <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-2">
                  <Icon name="check-circle" size={12} color="white" />
                </View>
                <Text className="text-green-900 font-bold text-sm">Schedule Summary</Text>
              </View>
              <Text className="text-green-800 text-xs">
                You have <Text className="font-bold">{shifts.length}</Text> shift schedule{shifts.length > 1 ? "s" : ""}{" "}
                covering <Text className="font-bold">{getUsedDays().length}</Text> day
                {getUsedDays().length > 1 ? "s" : ""}.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Compact Footer */}
        <View className="bg-white border-t border-gray-200 p-3">
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg items-center">
              <Text className="text-gray-700 font-semibold text-sm">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving || shifts.length === 0}
              className={`flex-1 py-2 rounded-lg flex-row items-center justify-center ${
                isSaving || shifts.length === 0 ? "bg-gray-400" : "bg-emerald-600"
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold text-sm ml-1">Saving...</Text>
                </>
              ) : (
                <>
                  <Icon name="save" size={14} color="white" />
                  <Text className="text-white font-semibold text-sm ml-1">Save Schedule</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={currentShift.startDate}
            mode="date"
            display="default"
            minimumDate={getTodayDate()}
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false)
              if (selectedDate) {
                setCurrentShift((prev) => ({ ...prev, startDate: selectedDate }))
              }
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={currentShift.endDate}
            mode="date"
            display="default"
            minimumDate={currentShift.startDate}
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false)
              if (selectedDate) {
                setCurrentShift((prev) => ({ ...prev, endDate: selectedDate }))
              }
            }}
          />
        )}
      </View>
    </Modal>
  )
}

export default CustomShiftUpdater
