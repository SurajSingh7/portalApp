"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import axios from "axios"
import { API_ATTENDANCE_URL } from "../../../../../config/api"

const MonthlyAttendanceCalendar = ({ selectedEmployee, onScrollToBottom }) => {
  const [apiData, setApiData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date()) // Default to current date
  const [showAttendanceDetails, setShowAttendanceDetails] = useState(false)
  const [attendanceDetails, setAttendanceDetails] = useState(null)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] // Fixed: Made all weekday abbreviations unique

  useEffect(() => {
    fetchData()
  }, [currentMonth, selectedEmployee])

  useEffect(() => {
    // Auto-show current date attendance on initial load
    if (apiData.length > 0) {
      handleDateClick(new Date())
    }
  }, [apiData])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_ATTENDANCE_URL}user/attendance/employee`, {
        params: {
          employeeCode: selectedEmployee,
          filterType: "month",
          selectedMonth: `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`,
          startDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString(),
        },
      })

      if (response.data?.data?.length === 0) {
        setApiData([])
        return
      }

      if (response.data && response.data.data) {
        const transformedData = response.data.data.map((item) => ({
          date: new Date(item.actualPunchInTime),
          isAbsent: item.isAbsent,
          inTime: item.userpunchInTime ? new Date(item.userpunchInTime) : null,
          outTime: item.userPunchOutTime ? new Date(item.userPunchOutTime) : null,
          totalHours: item.totalHours,
        }))
        setApiData(transformedData)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to fetch attendance data")
    } finally {
      setLoading(false)
    }
  }

  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()

  const handleDateClick = (date) => {
    setSelectedDate(date)
    const attendanceData = apiData.find((data) => isSameDay(data.date, date))

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      hour12: true,
      minute: "2-digit",
      timeZone: "UTC",
    }

    let details = null

    if (attendanceData) {
      const formattedInTime = attendanceData.inTime
        ? new Intl.DateTimeFormat("en-GB", options).format(attendanceData.inTime)
        : "N/A"

      // Check if punch in and punch out times are the same
      let formattedOutTime = "N/A"
      if (attendanceData.outTime && attendanceData.inTime) {
        const inTimeStr = attendanceData.inTime.toTimeString()
        const outTimeStr = attendanceData.outTime.toTimeString()

        if (inTimeStr === outTimeStr) {
          formattedOutTime = "Coming Soon*"
        } else {
          formattedOutTime = new Intl.DateTimeFormat("en-GB", options).format(attendanceData.outTime)
        }
      }

      const totalHours = attendanceData.totalHours || "N/A"

      details = {
        formattedInTime,
        formattedOutTime,
        totalHours,
        date: date,
        isAbsent: attendanceData.isAbsent,
      }
    } else {
      details = {
        formattedInTime: "N/A",
        formattedOutTime: "N/A",
        totalHours: "N/A",
        date: date,
        isAbsent: true,
      }
    }

    setAttendanceDetails(details)
    setShowAttendanceDetails(true)

    // TRIGGER PARENT SCROLL
    if (onScrollToBottom) {
      onScrollToBottom()
    }
  }

  const handleCloseAttendanceDetails = () => {
    setShowAttendanceDetails(false)
    setAttendanceDetails(null)
  }

  const handlePrevMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
  const handleNextMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    const days = []

    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1)
      days.push(prevDate)
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    // Next month days to fill the grid
    const remainingCells = 42 - days.length
    for (let i = 1; i <= remainingCells; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }

  const getDateStatus = (date) => {
    const status = apiData.find((data) => isSameDay(data.date, date))
    if (!status) return null
    return status.isAbsent ? "absent" : "present"
  }

  const formatAttendanceDate = (date) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const isCurrentMonth = (date) => date.getMonth() === currentMonth.getMonth()
  const isToday = (date) => isSameDay(date, new Date())
  const isSelected = (date) => isSameDay(date, selectedDate)

  const CalendarShimmer = () => (
    <View className="bg-white rounded-lg p-3">
      <View className="flex-row justify-between items-center mb-3">
        <View className="w-16 h-5 bg-orange-100 rounded" />
        <View className="w-24 h-5 bg-orange-100 rounded" />
        <View className="w-16 h-5 bg-orange-100 rounded" />
      </View>
      <View className="flex-row justify-around mb-2">
        {weekdays.map((_, index) => (
          <View key={`shimmer-${index}`} className="w-6 h-3 bg-orange-50 rounded" />
        ))}
      </View>
      {[...Array(6)].map((_, rowIndex) => (
        <View key={`shimmer-row-${rowIndex}`} className="flex-row justify-around mb-1">
          {[...Array(7)].map((_, colIndex) => (
            <View key={`shimmer-cell-${rowIndex}-${colIndex}`} className="w-6 h-6 bg-orange-50 rounded" />
          ))}
        </View>
      ))}
    </View>
  )

  const days = getDaysInMonth(currentMonth)

  return (
    <ScrollView className="flex-1">
      <View className="p-4 space-y-4">
        {/* Attendance Details Section - Shows above calendar when date is clicked */}
        {showAttendanceDetails && attendanceDetails && (
          <View className="bg-white rounded-lg shadow-sm border border-orange-100">
            {/* Header with close button */}
            <View className="flex-row items-center justify-between p-3 border-b border-orange-100">
              <Text className="text-lg font-bold text-gray-800">Attendance Details</Text>
              <TouchableOpacity className="bg-gray-100 p-2 rounded-full" onPress={handleCloseAttendanceDetails}>
                <Text className="text-gray-600 font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            <View className="p-4">
              {/* Date and Status */}
              <View className="items-center mb-4">
                <View className="flex-row items-center mb-2">
                  <Text className="text-orange-600 mr-2">📅</Text>
                  <Text className="text-base font-semibold text-gray-800">
                    {formatAttendanceDate(attendanceDetails.date)}
                  </Text>
                </View>

                <View
                  className={`px-3 py-1 rounded-full ${attendanceDetails.isAbsent ? "bg-red-100" : "bg-green-100"}`}
                >
                  <Text
                    className={`text-sm font-medium ${attendanceDetails.isAbsent ? "text-red-700" : "text-green-700"}`}
                  >
                    {attendanceDetails.isAbsent ? "Absent" : "Present"}
                  </Text>
                </View>
              </View>

              {/* Attendance Details Grid */}
              <View className="space-y-3">
                {/* Punch In Time */}
                <View className="bg-green-50 rounded-lg p-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="text-green-500 mr-2">🕐</Text>
                      <Text className="text-sm font-medium text-green-700">Punch In</Text>
                    </View>
                    <Text className="text-sm text-gray-700 font-medium">{attendanceDetails.formattedInTime}</Text>
                  </View>
                </View>

                {/* Punch Out Time */}
                <View className="bg-red-50 rounded-lg p-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="text-red-500 mr-2">🕐</Text>
                      <Text className="text-sm font-medium text-red-700">Punch Out</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-sm text-gray-700 font-medium">{attendanceDetails.formattedOutTime}</Text>
                      {attendanceDetails.formattedOutTime === "Coming Soon*" && (
                        <Text className="text-xs text-orange-600 ml-2">*Same as punch in</Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Total Hours */}
                <View className="bg-blue-50 rounded-lg p-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="text-blue-500 mr-2">⏳</Text>
                      <Text className="text-sm font-medium text-blue-700">Total Hours</Text>
                    </View>
                    <Text className="text-sm text-gray-700 font-medium">{attendanceDetails.totalHours}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Calendar Section */}
        <View className="bg-white rounded-lg shadow-sm border border-orange-100">
          {/* Compact Header Navigation */}
          <View className="flex-row justify-between items-center p-3 border-b border-orange-100">
            <TouchableOpacity
              className="flex-row items-center bg-orange-50 px-3 py-1 rounded-md"
              onPress={handlePrevMonth}
            >
              <Text className="text-orange-600 text-sm">← Prev</Text>
            </TouchableOpacity>

            <Text className="text-lg font-bold text-orange-800">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>

            <TouchableOpacity
              className="flex-row items-center bg-orange-500 px-3 py-1 rounded-md"
              onPress={handleNextMonth}
            >
              <Text className="text-white text-sm">Next →</Text>
            </TouchableOpacity>
          </View>

          {/* Compact Legend */}
          <View className="flex-row justify-center py-2 space-x-4 border-b border-orange-50">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              <Text className="text-xs text-gray-600">Present</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-1" />
              <Text className="text-xs text-gray-600">Absent</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-orange-500 rounded-full mr-1" />
              <Text className="text-xs text-gray-600">Selected</Text>
            </View>
          </View>

          {/* Compact Calendar */}
          <View className="p-3">
            {loading ? (
              <CalendarShimmer />
            ) : (
              <>
                {/* Weekday Headers */}
                <View className="flex-row justify-around mb-2">
                  {weekdays.map((day, index) => (
                    <Text
                      key={`weekday-${index}-${day}`}
                      className="text-xs font-semibold text-gray-500 w-8 text-center"
                    >
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Calendar Grid */}
                <View>
                  {[...Array(6)].map((_, weekIndex) => (
                    <View key={`week-${weekIndex}`} className="flex-row justify-around mb-1">
                      {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
                        const status = getDateStatus(date)
                        const isCurrentMonthDate = isCurrentMonth(date)
                        const isTodayDate = isToday(date)
                        const isSelectedDate = isSelected(date)

                        return (
                          <TouchableOpacity
                            key={`day-${weekIndex}-${dayIndex}-${date.getTime()}`}
                            className={`w-8 h-8 rounded-md items-center justify-center relative ${
                              isSelectedDate
                                ? "bg-orange-500"
                                : isTodayDate
                                  ? "bg-orange-100 border border-orange-300"
                                  : "bg-transparent"
                            }`}
                            onPress={() => handleDateClick(date)}
                          >
                            <Text
                              className={`text-xs ${
                                isSelectedDate
                                  ? "text-white font-bold"
                                  : isTodayDate
                                    ? "text-orange-700 font-bold"
                                    : isCurrentMonthDate
                                      ? "text-gray-800"
                                      : "text-gray-300"
                              }`}
                            >
                              {date.getDate()}
                            </Text>
                            {status && (
                              <View
                                className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                                  status === "present" ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                            )}
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-100 border-t border-red-200 p-2">
              <Text className="text-red-700 text-xs text-center">{error}</Text>
            </View>
          )}
        </View>

        {/* Helper Text */}
        {!showAttendanceDetails && (
          <View className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <Text className="text-center text-gray-500 text-sm">📅 Tap on any date to view attendance details</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default MonthlyAttendanceCalendar
