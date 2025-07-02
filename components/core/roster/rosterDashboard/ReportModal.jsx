"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Animated, Platform } from "react-native"
import { X, Download, Calendar, Clock, FileText, CheckCircle2, Sparkles } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { API_BASE_URL } from "../../../../config/api"
import { getToken } from "../../../../utils/storage"
import Toast from "react-native-toast-message"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"

export default function ReportModal({ isOpen, employeeCode, onClose }) {
  const [filterType, setFilterType] = useState("day")
  const [specificDate, setSpecificDate] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState("")
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [scaleAnim] = useState(new Animated.Value(0))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)

  useEffect(() => {
    if (isOpen) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start()
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [isOpen, scaleAnim])

  useEffect(() => {
    if (!isOpen) {
      setFilterType("day")
      setSpecificDate(new Date())
      setSelectedMonth("")
      setStartDate(new Date())
      setEndDate(new Date())
    }
  }, [isOpen])

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]
  }

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false)
      setShowStartDatePicker(false)
      setShowEndDatePicker(false)
    }

    if (selectedDate) {
      if (showDatePicker) {
        setSpecificDate(selectedDate)
      } else if (showStartDatePicker) {
        setStartDate(selectedDate)
      } else if (showEndDatePicker) {
        setEndDate(selectedDate)
      }
    }
  }

  const validateCustomRange = () => {
    if (!startDate || !endDate) {
      Toast.show({
        type: "error",
        text1: "Start and end dates are required",
      })
      return false
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMs = Math.abs(end - start)
    const maxMs = 1000 * 60 * 60 * 24 * 30

    if (diffMs > maxMs) {
      Toast.show({
        type: "error",
        text1: "Range cannot exceed one month",
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const url = new URL(`${API_BASE_URL}/api/dashboard/attendance-report`)
    url.searchParams.set("employeeCode", employeeCode)
    url.searchParams.set("filterType", filterType)

    switch (filterType) {
      case "date":
        if (!specificDate) {
          Toast.show({
            type: "error",
            text1: "Select a date",
          })
          setIsLoading(false)
          return
        }
        url.searchParams.set("startDate", specificDate.toISOString())
        break
      case "month":
        if (!selectedMonth) {
          Toast.show({
            type: "error",
            text1: "Select a month",
          })
          setIsLoading(false)
          return
        }
        url.searchParams.set("selectedMonth", selectedMonth)
        break
      case "custom":
        if (!validateCustomRange()) {
          setIsLoading(false)
          return
        }
        url.searchParams.set("startDate", startDate.toISOString())
        url.searchParams.set("endDate", endDate.toISOString())
        break
      default:
        break
    }

    try {
      const token = await getToken()
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
        },
      })

      if (!res.ok) {
        const result = await res.json()
        console.error("Error generating report:", result)
        Toast.show({
          type: "error",
          text1: result.message || "Failed to generate report",
        })
        return
      }

      const blob = await res.blob()
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = async () => {
        const base64data = reader.result.split(",")[1]
        const fileUri = FileSystem.documentDirectory + `attendance-report-${employeeCode}.pdf`
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        })

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri)
        } else {
          Toast.show({
            type: "success",
            text1: "Report downloaded successfully",
          })
        }
      }

      onClose()
    } catch (e) {
      console.error("Error generating report:", e)
      Toast.show({
        type: "error",
        text1: e.message || "Failed to generate report, please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const FilterTypeOption = ({ value, label, icon: Icon, isSelected, onPress }) => (
    <TouchableOpacity
      style={{
        position: "relative",
        padding: 16,
        borderWidth: 2,
        borderColor: isSelected ? "#3B82F6" : "#E5E7EB",
        borderRadius: 16,
        marginBottom: 12,
        backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
        shadowColor: isSelected ? "#3B82F6" : "#000",
        shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
        shadowOpacity: isSelected ? 0.15 : 0.08,
        shadowRadius: isSelected ? 8 : 4,
        elevation: isSelected ? 6 : 3,
      }}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: isSelected ? "#DBEAFE" : "#F3F4F6",
            marginRight: 16,
          }}
        >
          <Icon size={18} color={isSelected ? "#2563EB" : "#6B7280"} />
        </View>
        <Text
          style={{
            fontWeight: "600",
            fontSize: 16,
            flex: 1,
            color: isSelected ? "#1D4ED8" : "#374151",
          }}
        >
          {label}
        </Text>
      </View>
      {isSelected && (
        <View style={{ position: "absolute", top: 12, right: 12 }}>
          <CheckCircle2 size={20} color="#2563EB" />
        </View>
      )}
    </TouchableOpacity>
  )

  if (!isOpen) return null

  return (
    <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            backgroundColor: "white",
            borderRadius: 24,
            width: "100%",
            maxWidth: 400,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.3,
            shadowRadius: 40,
            elevation: 20,
          }}
        >
          {/* Header */}
          <View
            style={{
              position: "relative",
              paddingHorizontal: 24,
              paddingVertical: 20,
              backgroundColor: "#2563EB",
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                padding: 10,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 20,
                zIndex: 10,
              }}
              onPress={onClose}
            >
              <X size={18} color="white" />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  padding: 12,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 16,
                  marginRight: 16,
                }}
              >
                <FileText size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>Generate Report</Text>
                <Text style={{ color: "#BFDBFE", fontSize: 14, marginTop: 4 }}>Employee: {employeeCode}</Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={{ maxHeight: 400, paddingHorizontal: 24, paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 16 }}>
                Select Report Period
              </Text>

              <FilterTypeOption
                value="day"
                label="Today"
                icon={Clock}
                isSelected={filterType === "day"}
                onPress={() => setFilterType("day")}
              />

              <FilterTypeOption
                value="date"
                label="Specific Date"
                icon={Calendar}
                isSelected={filterType === "date"}
                onPress={() => setFilterType("date")}
              />

              <FilterTypeOption
                value="week"
                label="This Week"
                icon={Calendar}
                isSelected={filterType === "week"}
                onPress={() => setFilterType("week")}
              />

              <FilterTypeOption
                value="month"
                label="This Month"
                icon={Calendar}
                isSelected={filterType === "month"}
                onPress={() => setFilterType("month")}
              />

              <FilterTypeOption
                value="custom"
                label="Custom Range"
                icon={Calendar}
                isSelected={filterType === "custom"}
                onPress={() => setFilterType("custom")}
              />

              {filterType === "date" && (
                <View
                  style={{
                    backgroundColor: "#EFF6FF",
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#BFDBFE",
                    marginTop: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: "#1F2937", marginBottom: 12 }}>
                    Select Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={{
                      width: "100%",
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      borderWidth: 2,
                      borderColor: "#BFDBFE",
                      borderRadius: 12,
                      backgroundColor: "white",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ color: "#111827", fontWeight: "500", fontSize: 16 }}>
                      {formatDate(specificDate)}
                    </Text>
                    <Calendar size={20} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              )}

              {filterType === "month" && (
                <View
                  style={{
                    backgroundColor: "#EFF6FF",
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#BFDBFE",
                    marginTop: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: "#1F2937", marginBottom: 12 }}>
                    Select Month
                  </Text>
                  <TextInput
                    placeholder="YYYY-MM"
                    style={{
                      width: "100%",
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      borderWidth: 2,
                      borderColor: "#BFDBFE",
                      borderRadius: 12,
                      backgroundColor: "white",
                      color: "#111827",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                    value={selectedMonth}
                    onChangeText={setSelectedMonth}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}

              {filterType === "custom" && (
                <View
                  style={{
                    backgroundColor: "#EFF6FF",
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#BFDBFE",
                    marginTop: 12,
                  }}
                >
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#1F2937", marginBottom: 12 }}>
                      Start Date
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(true)}
                      style={{
                        width: "100%",
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        borderWidth: 2,
                        borderColor: "#BFDBFE",
                        borderRadius: 12,
                        backgroundColor: "white",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ color: "#111827", fontWeight: "500", fontSize: 16 }}>{formatDate(startDate)}</Text>
                      <Calendar size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>

                  <View>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: "#1F2937", marginBottom: 12 }}>
                      End Date
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowEndDatePicker(true)}
                      style={{
                        width: "100%",
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        borderWidth: 2,
                        borderColor: "#BFDBFE",
                        borderRadius: 12,
                        backgroundColor: "white",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ color: "#111827", fontWeight: "500", fontSize: 16 }}>{formatDate(endDate)}</Text>
                      <Calendar size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingVertical: 20,
              borderTopWidth: 1,
              borderTopColor: "#F3F4F6",
              backgroundColor: "#F9FAFB",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderWidth: 2,
                  borderColor: "#D1D5DB",
                  borderRadius: 12,
                  backgroundColor: "white",
                  marginRight: 16,
                }}
              >
                <Text style={{ color: "#374151", fontWeight: "600", fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: isLoading ? "#9CA3AF" : "#2563EB",
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#3B82F6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <View style={{ marginRight: 8 }}>
                  {isLoading ? <Sparkles size={16} color="white" /> : <Download size={16} color="white" />}
                </View>
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                  {isLoading ? "Generating..." : "Generate"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Date Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={specificDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
          />
        )}

        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
          />
        )}
      </View>
    </Modal>
  )
}
