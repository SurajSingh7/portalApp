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
import { API_BASE_URL } from "../../../../config/api"
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
  // const [editModalOpen, setEditModalOpen] = useState(false)
  // const [currentShift, setCurrentShift] = useState(null)

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

  // EDIT FUNCTIONALITY COMMENTED OUT
  // const handleEdit = async (id, updatedShift) => {
  //   const { startHour, startMinute, endHour, endMinute } = updatedShift
  //   const shiftStartTime = `${startHour}:${startMinute}`
  //   const shiftEndTime = `${endHour}:${endMinute}`
  //   const shiftTime = `${shiftStartTime}-${shiftEndTime}`

  //   try {
  //     const token = await getToken()
  //     const res = await fetch(`${API_BASE_URL}/api/shiftTime/${id}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //         "User-Agent": "reactnative",
  //       },
  //       body: JSON.stringify({ shiftTime, shiftStartTime, shiftEndTime }),
  //     })

  //     if (res.ok) {
  //       fetchShifts()
  //       showToast("Shift updated successfully")
  //       setEditModalOpen(false)
  //     } else {
  //       showToast(res.status === 409 ? "Shift Time already exists" : "Error updating shift", "error")
  //     }
  //   } catch {
  //     showToast("Error updating shift", "error")
  //   }
  // }

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 pt-6">
          {/* Create New Shift Card - Fixed Layout */}
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-slate-100">
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-emerald-100 rounded-2xl items-center justify-center mr-4">
                <Text className="text-2xl">✨</Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-slate-800">Create New Shift</Text>
                <Text className="text-slate-500 text-sm mt-1">Set your working hours</Text>
              </View>
            </View>

            {/* Time Selection Container - Fixed */}
            <View className="bg-slate-50 rounded-2xl p-2 mb-4">
              {/* Start Time */}
              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-orange-100 rounded-xl items-center justify-center mr-3">
                    <Text className="text-lg">🌅</Text>
                  </View>
                  <Text className="text-lg font-bold text-slate-800">Start Time</Text>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-600 mb-2">Hour</Text>
                    <View className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                    <Text className="text-sm font-semibold text-slate-600 mb-2">Minute</Text>
                    <View className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-purple-100 rounded-xl items-center justify-center mr-3">
                    <Text className="text-lg">🌆</Text>
                  </View>
                  <Text className="text-lg font-bold text-slate-800">End Time</Text>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-600 mb-2">Hour</Text>
                    <View className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                    <Text className="text-sm font-semibold text-slate-600 mb-2">Minute</Text>
                    <View className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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

            {/* Preview - Fixed */}
            <View className="bg-blue-50 rounded-2xl p-2 mb-4 border border-blue-100">
              <Text className="text-sm font-semibold text-slate-600 mb-2">Preview</Text>
              <Text className="text-xl font-bold text-slate-800">
                {formatTo12Hour(`${startHour}:${startMinute}`)} - {formatTo12Hour(`${endHour}:${endMinute}`)}
              </Text>
            </View>

            {/* Save Button - Fixed */}
            <TouchableOpacity
              onPress={saveShift}
              disabled={isLoading}
              className={`py-4 px-8 rounded-2xl ${
                isLoading 
                  ? "bg-slate-300" 
                  : "bg-green-500 active:bg-green-700"
              }`}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-bold ml-3 text-lg">Creating Shift...</Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-center text-lg">Create Shift Time</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Shift List - Fixed Layout */}
          {shifts.length > 0 && (
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <View className="flex-row items-center mb-6">
                <View className="w-10 h-10 bg-violet-100 rounded-2xl items-center justify-center mr-4">
                  <Text className="text-2xl">📋</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-slate-800">Active Shifts</Text>
                  <Text className="text-slate-500 text-sm mt-1">{shifts.length} shift{shifts.length !== 1 ? 's' : ''} configured</Text>
                </View>
              </View>

              <View className="space-y-2">
                {shifts.map((shift, index) => {
                  const [startTime, endTime] = shift.shiftTime.split("-")
                  return (
                    <View 
                      key={shift._id} 
                      className="bg-slate-50 p-5 rounded-2xl border border-slate-200 my-1 "
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-3">
                            <View className="w-6 h-6 bg-emerald-500 rounded-lg items-center justify-center mr-2">
                              <Text className="text-white text-xs font-bold">{index + 1}</Text>
                            </View>
                            <Text className="text-slate-500 text-sm font-bold tracking-wider">
                              SHIFT {index + 1}
                            </Text>
                          </View>
                          
                          <Text className="font-bold text-slate-800 text-xl mb-2">
                            {shift.shiftTime}
                          </Text>
                          
                          <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></View>
                            <Text className="text-slate-600 text-base font-medium">
                              {formatTo12Hour(startTime)} - {formatTo12Hour(endTime)}
                            </Text>
                          </View>
                        </View>

                        {/* EDIT BUTTON COMMENTED OUT */}
                        {/* <TouchableOpacity
                          onPress={() => {
                            const [startTime, endTime] = shift.shiftTime.split("-")
                            const [startHour, startMinute] = startTime.split(":")
                            const [endHour, endMinute] = endTime.split(":")
                            setCurrentShift({
                              id: shift._id,
                              startHour,
                              startMinute,
                              endHour,
                              endMinute,
                            })
                            setEditModalOpen(true)
                          }}
                          className="bg-orange-500 px-4 py-2 rounded-xl active:bg-orange-600"
                        >
                          <Text className="text-white font-bold text-sm">Edit</Text>
                        </TouchableOpacity> */}
                      </View>
                    </View>
                     
                  )
                
                })}
              </View>
            </View>
          )}
        </View>

        {/* EDIT MODAL COMMENTED OUT */}
        {/* {editModalOpen && currentShift && (
          <Modal
            visible={editModalOpen}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setEditModalOpen(false)}
          >
            <View className="flex-1 bg-black/60 justify-center items-center px-6">
              <View className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                <View className="items-center mb-8">
                  <View className="w-16 h-16 bg-blue-500 rounded-3xl items-center justify-center mb-4">
                    <Text className="text-white text-2xl">✏️</Text>
                  </View>
                  <Text className="text-2xl font-bold text-slate-800 text-center">Edit Shift</Text>
                  <Text className="text-slate-500 text-sm mt-1">Modify your working hours</Text>
                </View>

                <View className="mb-8 gap-6">
                  <View>
                    <View className="flex-row items-center mb-4">
                      <View className="w-6 h-6 bg-orange-500 rounded-lg items-center justify-center mr-2">
                        <Text className="text-white text-xs">🌅</Text>
                      </View>
                      <Text className="font-bold text-slate-800 text-lg">Start Time</Text>
                    </View>
                    <View className="flex-row gap-3">
                      <View className="flex-1 bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                        <Picker
                          selectedValue={currentShift.startHour}
                          onValueChange={(itemValue) => setCurrentShift((prev) => ({ ...prev, startHour: itemValue }))}
                          style={{ height: 50, color: "#1e293b" }}
                        >
                          {hours.map((hour) => (
                            <Picker.Item key={hour} label={hour} value={hour} />
                          ))}
                        </Picker>
                      </View>
                      <View className="flex-1 bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                        <Picker
                          selectedValue={currentShift.startMinute}
                          onValueChange={(itemValue) =>
                            setCurrentShift((prev) => ({ ...prev, startMinute: itemValue }))
                          }
                          style={{ height: 50, color: "#1e293b" }}
                        >
                          {minutes.map((minute) => (
                            <Picker.Item key={minute} label={minute} value={minute} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>

                  <View>
                    <View className="flex-row items-center mb-4">
                      <View className="w-6 h-6 bg-purple-500 rounded-lg items-center justify-center mr-2">
                        <Text className="text-white text-xs">🌆</Text>
                      </View>
                      <Text className="font-bold text-slate-800 text-lg">End Time</Text>
                    </View>
                    <View className="flex-row gap-3">
                      <View className="flex-1 bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                        <Picker
                          selectedValue={currentShift.endHour}
                          onValueChange={(itemValue) => setCurrentShift((prev) => ({ ...prev, endHour: itemValue }))}
                          style={{ height: 50, color: "#1e293b" }}
                        >
                          {hours.map((hour) => (
                            <Picker.Item key={hour} label={hour} value={hour} />
                          ))}
                        </Picker>
                      </View>
                      <View className="flex-1 bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                        <Picker
                          selectedValue={currentShift.endMinute}
                          onValueChange={(itemValue) => setCurrentShift((prev) => ({ ...prev, endMinute: itemValue }))}
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

                <View className="flex-row gap-4">
                  <TouchableOpacity
                    onPress={() => setEditModalOpen(false)}
                    className="flex-1 py-4 px-4 rounded-2xl border-2 border-slate-200 bg-slate-50 active:bg-slate-100"
                  >
                    <Text className="text-slate-700 font-bold text-center text-base">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleEdit(currentShift.id, currentShift)}
                    className="flex-1 py-4 px-4 rounded-2xl bg-blue-600 active:bg-blue-700"
                  >
                    <Text className="text-white font-bold text-center text-base">Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )} */}
      </ScrollView>
    </View>
  )
}

export default CreateShift