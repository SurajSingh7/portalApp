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
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAttendanceDetails, setShowAttendanceDetails] = useState(false)
  const [attendanceDetails, setAttendanceDetails] = useState(null)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"]

  useEffect(() => {
    fetchData()
  }, [currentMonth, selectedEmployee])

  useEffect(() => {
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

  // Extract only time from the formatted date string
  const extractTimeOnly = (formattedDateTime) => {
    if (!formattedDateTime || formattedDateTime === "N/A") return "N/A"

    // Split by comma and get the time part (last part)
    const parts = formattedDateTime.split(", ")
    if (parts.length >= 2) {
      return parts[parts.length - 1] // Get the time part
    }
    return formattedDateTime
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    const attendanceData = apiData.find((data) => isSameDay(data.date, date))

    // Using the same options as your working code
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
      const fullFormattedInTime = attendanceData.inTime
        ? new Intl.DateTimeFormat("en-GB", options).format(attendanceData.inTime)
        : "N/A"

      // Extract only time part for display
      const formattedInTime = extractTimeOnly(fullFormattedInTime)

      // Check if punch in and punch out times are the same (using your original logic)
      let formattedOutTime = "N/A"
      if (attendanceData.outTime && attendanceData.inTime) {
        const inTimeStr = attendanceData.inTime.toTimeString()
        const outTimeStr = attendanceData.outTime.toTimeString()

        if (inTimeStr === outTimeStr) {
          formattedOutTime = "Pending"
        } else {
          const fullFormattedOutTime = new Intl.DateTimeFormat("en-GB", options).format(attendanceData.outTime)
          formattedOutTime = extractTimeOnly(fullFormattedOutTime)
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

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1)
      days.push(prevDate)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

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
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const isCurrentMonth = (date) => date.getMonth() === currentMonth.getMonth()
  const isToday = (date) => isSameDay(date, new Date())
  const isSelected = (date) => isSameDay(date, selectedDate)

  const CalendarShimmer = () => (
    <View className="bg-white rounded-lg p-2">
      <View className="flex-row justify-between items-center mb-2">
        <View className="w-12 h-4 bg-slate-100 rounded" />
        <View className="w-20 h-4 bg-slate-100 rounded" />
        <View className="w-12 h-4 bg-slate-100 rounded" />
      </View>
      <View className="flex-row justify-around mb-1.5">
        {weekdays.map((_, index) => (
          <View key={`shimmer-${index}`} className="w-5 h-3 bg-slate-50 rounded" />
        ))}
      </View>
      {[...Array(6)].map((_, rowIndex) => (
        <View key={`shimmer-row-${rowIndex}`} className="flex-row justify-around mb-1">
          {[...Array(7)].map((_, colIndex) => (
            <View key={`shimmer-cell-${rowIndex}-${colIndex}`} className="w-6 h-6 bg-slate-50 rounded-md" />
          ))}
        </View>
      ))}
    </View>
  )

  const days = getDaysInMonth(currentMonth)

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="p-2 space-y-3">
        {/* Compact Attendance Details Section */}
        {showAttendanceDetails && attendanceDetails && (
          <View className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {/* Compact Header - Orange Theme */}
            <View className="bg-orange-400 px-3 py-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-white text-sm font-bold">Attendance Details</Text>
                <TouchableOpacity
                  className="bg-white/20 p-1 rounded-full"
                  onPress={handleCloseAttendanceDetails}
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-bold text-xs">✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="p-3">
              {/* Date and Status Row - Compact */}
              <View className="flex-row items-center justify-between mb-3 bg-slate-50 rounded-md p-2">
                <View className="flex-row items-center flex-1">
                  <Text className="text-sm mr-1.5">📅</Text>
                  <Text className="text-slate-800 text-xs font-extrabold flex-1">
                    {formatAttendanceDate(attendanceDetails.date)}
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${attendanceDetails.isAbsent ? "bg-red-50" : "bg-green-50"}`}>
                  <Text
                    className={`text-xs font-bold ${attendanceDetails.isAbsent ? "text-red-600" : "text-green-600"}`}
                  >
                    {attendanceDetails.isAbsent ? "Absent" : "Present"}
                  </Text>
                </View>
              </View>

              {/* Time Details in One Row - Compact */}
              <View className="bg-green-50 rounded-md p-2 mb-2">
                <View className="flex-row items-center justify-between">
                  {/* Punch In - Compact */}
                  <View className="flex-1 items-center">
                    <Text className="text-green-700 text-xs font-bold uppercase">Punch In</Text>
                    <Text className="text-slate-800 text-sm font-bold mt-0.5">{attendanceDetails.formattedInTime}</Text>
                  </View>

                  {/* Divider */}
                  <View className="w-px h-8 bg-slate-200 mx-2" />

                  {/* Punch Out - Compact */}
                  <View className="flex-1 items-center">
                    <Text className="text-red-600 text-xs font-bold uppercase">Punch Out</Text>
                    <View className="items-center mt-0.5">
                      <Text
                        className={`text-sm font-bold ${
                          attendanceDetails.formattedOutTime === "Pending" ? "text-amber-600" : "text-slate-800"
                        }`}
                      >
                        {attendanceDetails.formattedOutTime}
                      </Text>
                      {attendanceDetails.formattedOutTime === "Pending" && (
                        <View className="bg-amber-100 px-1 py-0.5 rounded-full mt-0.5">
                          {/* <Text className="text-amber-700 text-xs font-medium">Progress</Text> */}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Total Hours - Compact */}
              <View className="bg-purple-50 rounded-md p-2">
                <View className="flex-row items-center justify-center">
                  <Text className="text-xs mr-1">⏱️</Text>
                  <Text className="text-purple-700 text-xs font-bold mr-1.5">TOTAL:</Text>
                  <Text className="text-slate-800 text-sm font-bold">{attendanceDetails.totalHours}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Compact Calendar Section */}
        <View className="bg-white rounded-lg  shadow-sm border border-slate-200 overflow-hidden">
          {/* Compact Header Navigation - Orange Theme */}
          <View className="bg-slate-800 px-3 py-2">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity
                className="bg-white/10 px-2 py-1 rounded-md"
                onPress={handlePrevMonth}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold text-xs">← Prev</Text>
              </TouchableOpacity>

              <Text className="text-white text-base font-bold">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>

              <TouchableOpacity
                className="bg-orange-400 px-2 py-1 rounded-md"
                onPress={handleNextMonth}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold text-xs">Next →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Compact Legend */}
          <View className="bg-slate-50 px-3 py-1.5">
            <View className="flex-row justify-center gap-5 space-x-3 ">
              <View className="flex-row items-center">
                <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                <Text className="text-slate-600 text-xs font-medium">Present</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1" />
                <Text className="text-slate-600 text-xs font-medium">Absent</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-1" />
                <Text className="text-slate-600 text-xs font-medium">Selected</Text>
              </View>
            </View>
          </View>

          {/* Compact Calendar Grid */}
          <View className="p-3 ">
            {loading ? (
              <CalendarShimmer />
            ) : (
              <>
                {/* Weekday Headers - Compact */}
                <View className="flex-row justify-around mb-2">
                  {weekdays.map((day, index) => (
                    <View key={`weekday-${index}-${day}`} className="w-7 items-center">
                      <Text className="text-slate-500 font-bold text-xs">{day}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar Grid - Compact */}
                <View className="space-y-1 ">
                  {[...Array(6)].map((_, weekIndex) => (
                    <View key={`week-${weekIndex}`} className="flex-row justify-around ">
                      {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
                        const status = getDateStatus(date)
                        const isCurrentMonthDate = isCurrentMonth(date)
                        const isTodayDate = isToday(date)
                        const isSelectedDate = isSelected(date)

                        let buttonClasses = "w-8 h-8 rounded-md items-center justify-center relative m-1"

                        if (isSelectedDate) {
                          buttonClasses += " bg-orange-400"
                        } else if (isTodayDate) {
                          buttonClasses += " bg-orange-100 border border-orange-400"
                        } else if (status === "present") {
                          buttonClasses += " bg-green-50 border border-green-200"
                        } else if (status === "absent") {
                          buttonClasses += " bg-red-50 border border-red-200"
                        } else {
                          buttonClasses += " bg-transparent"
                        }

                        let textClasses = "text-xs font-bold"

                        if (isSelectedDate) {
                          textClasses += " text-white"
                        } else if (isTodayDate) {
                          textClasses += " text-orange-700"
                        } else if (isCurrentMonthDate) {
                          if (status === "present") {
                            textClasses += " text-green-700"
                          } else if (status === "absent") {
                            textClasses += " text-red-600"
                          } else {
                            textClasses += " text-slate-700"
                          }
                        } else {
                          textClasses += " text-slate-300"
                        }

                        return (
                          <TouchableOpacity
                            key={`day-${weekIndex}-${dayIndex}-${date.getTime()}`}
                            className={buttonClasses}
                            onPress={() => handleDateClick(date)}
                            activeOpacity={0.7}
                          >
                            <Text className={textClasses}>{date.getDate()}</Text>
                            {status && !isSelectedDate && (
                              <View
                                className={`absolute bottom-0.5 w-0.5 h-0.5 rounded-full ${
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

          {/* Error Message - Compact */}
          {error && (
            <View className="bg-red-50 p-2">
              <Text className="text-red-600 text-xs text-center font-medium">{error}</Text>
            </View>
          )}
        </View>

      </View>
    </ScrollView>
  )
}

export default MonthlyAttendanceCalendar
