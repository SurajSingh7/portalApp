"use client"

import { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  ActivityIndicator, 
  Dimensions,
  StatusBar,
  Platform
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { API_BASE_URL, APP_BACKGROUND_COLOR } from "../../../../config/api"
import { getToken } from "../../../../utils/storage"

const { width } = Dimensions.get("window")
const isTablet = width >= 768

const CreateShift = () => {
  const [startHour, setStartHour] = useState("10")
  const [startMinute, setStartMinute] = useState("00")
  const [endHour, setEndHour] = useState("19")
  const [endMinute, setEndMinute] = useState("00")
  const [shifts, setShifts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"))
  const minutes = ["00", "15", "30", "45"]

  useEffect(() => {
    fetchShifts()
  }, [])

  const showToast = (message, type = "info") => {
    Alert.alert(type === "error" ? "Error" : "Success", message)
  }

  const formatTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const saveShift = async () => {
    const shiftStartTime = `${startHour}:${startMinute}`
    const shiftEndTime = `${endHour}:${endMinute}`
    const shiftTime = `${shiftStartTime}-${shiftEndTime}`

    setIsLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE_URL}/api/shiftTime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
        },
        body: JSON.stringify({ shiftTime, shiftStartTime, shiftEndTime }),
      })

      if (res.ok) {
        resetForm()
        showToast("Shift saved successfully")
        fetchShifts()
      } else {
        const error = await res.json()
        if (res.status === 400) {
          showToast(error.message || "Invalid shift time", "error")
        } else if (res.status === 409) {
          showToast("Shift Time already exists", "error")
        } else {
          showToast("Error saving shift", "error")
        }
      }
    } catch {
      showToast("Error saving shift", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStartHour("08")
    setStartMinute("00")
    setEndHour("17")
    setEndMinute("00")
  }

  const fetchShifts = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE_URL}/api/shiftTime`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
        },
      })

      if (res.ok) {
        const data = await res.json()
        setShifts(data.data)
      } else {
        showToast("Error fetching shift data", "error")
      }
    } catch {
      showToast("Error fetching shift data", "error")
    }
  }

  return (
    <View className={`flex-1 bg-${APP_BACKGROUND_COLOR}-100 `}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View className="px-3 pt-3">
          {/* Create New Shift Card */}
          <View className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-slate-100">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 bg-emerald-100 rounded-xl items-center justify-center mr-2">
                <Text className="text-lg">✨</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-800">Create New Shift</Text>
                <Text className="text-slate-500 text-xs mt-0.5">Set your working hours</Text>
              </View>
            </View>

            {/* Time Selection Container */}
            <View className="bg-slate-50 rounded-xl p-2 mb-3">
              {/* Start Time */}
              <View className="mb-3">
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 bg-orange-100 rounded-lg items-center justify-center mr-2">
                    <Text className="text-base">🌅</Text>
                  </View>
                  <Text className="text-base font-bold text-slate-800">Start Time</Text>
                </View>
                <View className="flex-row gap-1.5">
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-slate-600 mb-1">Hour</Text>
                    <View className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                      <Picker
                        selectedValue={startHour}
                        onValueChange={(itemValue) => setStartHour(itemValue)}
                        style={{ height: 50, color: "#1e293b" }}
                      >
                        {hours.map((hour) => (
                          <Picker.Item key={hour} label={hour} value={hour} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-slate-600 mb-1">Minute</Text>
                    <View className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                      <Picker
                        selectedValue={startMinute}
                        onValueChange={(itemValue) => setStartMinute(itemValue)}
                        style={{ height: 50, color: "#1e293b" }}
                      >
                        {minutes.map((minute) => (
                          <Picker.Item key={minute} label={minute} value={minute} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>
              </View>

              {/* End Time */}
              <View>
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 bg-purple-100 rounded-lg items-center justify-center mr-2">
                    <Text className="text-base">🌆</Text>
                  </View>
                  <Text className="text-base font-bold text-slate-800">End Time</Text>
                </View>
                <View className="flex-row gap-1.5">
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-slate-600 mb-1">Hour</Text>
                    <View className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                      <Picker
                        selectedValue={endHour}
                        onValueChange={(itemValue) => setEndHour(itemValue)}
                        style={{ height: 50, color: "#1e293b" }}
                      >
                        {hours.map((hour) => (
                          <Picker.Item key={hour} label={hour} value={hour} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-slate-600 mb-1">Minute</Text>
                    <View className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                      <Picker
                        selectedValue={endMinute}
                        onValueChange={(itemValue) => setEndMinute(itemValue)}
                        style={{ height: 50, color: "#1e293b" }}
                      >
                        {minutes.map((minute) => (
                          <Picker.Item key={minute} label={minute} value={minute} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Preview */}
            <View className="bg-blue-50 rounded-xl p-2 mb-3 border border-blue-100">
              <Text className="text-xs font-semibold text-slate-600 mb-1">Preview</Text>
              <Text className="text-lg font-bold text-slate-800">
                {formatTo12Hour(`${startHour}:${startMinute}`)} - {formatTo12Hour(`${endHour}:${endMinute}`)}
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={saveShift}
              disabled={isLoading}
              className={`py-2 px-4 rounded-xl ${
                isLoading 
                  ? "bg-slate-300" 
                  : "bg-green-500 active:bg-green-700"
              }`}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-bold ml-2 text-base">Creating...</Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-center text-base">Create Shift</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Shift List */}
          {shifts.length > 0 && (
            <View className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-violet-100 rounded-xl items-center justify-center mr-2">
                  <Text className="text-lg">📋</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-slate-800">Active Shifts</Text>
                  <Text className="text-slate-500 text-xs mt-0.5">{shifts.length} shift{shifts.length !== 1 ? 's' : ''} configured</Text>
                </View>
              </View>

              <View className="space-y-1">
                {shifts.map((shift, index) => {
                  const [startTime, endTime] = shift.shiftTime.split("-")
                  return (
                    <View 
                      key={shift._id} 
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 my-0.5"
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <View className="w-5 h-5 bg-emerald-500 rounded-md items-center justify-center mr-1.5">
                              <Text className="text-white text-xs font-bold">{index + 1}</Text>
                            </View>
                            <Text className="text-slate-500 text-xs font-bold tracking-wider">
                              SHIFT {index + 1}
                            </Text>
                          </View>
                          
                          <Text className="font-bold text-slate-800 text-base mb-1">
                            {shift.shiftTime}
                          </Text>
                          
                          <View className="flex-row items-center">
                            <View className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5"></View>
                            <Text className="text-slate-600 text-sm font-medium">
                              {formatTo12Hour(startTime)} - {formatTo12Hour(endTime)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default CreateShift
