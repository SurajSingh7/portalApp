"use client"
import { useState, useEffect } from "react"    
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native"
import { getToken } from "../../../../utils/storage"

const { width } = Dimensions.get("window")

// Import your API config
import { API_BASE_URL } from "../../../../config/api"

// Toast replacement for React Native
const showToast = (message, type = "info") => {
  Alert.alert(type === "error" ? "Error" : "Success", message)
}

// Single Calendar Component with Tab Selection
const DateRangeCalendar = ({ fromDate, toDate, onFromDateSelect, onToDateSelect, activeTab, setActiveTab }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const isDateDisabled = (date) => {
    if (!date) return true

    if (activeTab === "from") {
      // For FROM date, can't select future dates
      return date > new Date()
    } else {
      // For TO date, must have FROM date selected first
      if (!fromDate) return true
      const fromDateObj = new Date(fromDate)
      // Can't select before FROM date or more than 31 days after FROM date
      const maxDate = new Date(fromDateObj)
      maxDate.setDate(maxDate.getDate() + 31)
      return date < fromDateObj || date > maxDate
    }
  }

  const isSelectedDate = (date) => {
    if (!date) return false
    const dateStr = date.toISOString().split("T")[0]

    if (activeTab === "from" && fromDate) {
      return dateStr === fromDate
    } else if (activeTab === "to" && toDate) {
      return dateStr === toDate
    }
    return false
  }

  const isInRange = (date) => {
    if (!date || !fromDate || !toDate) return false
    const dateStr = date.toISOString().split("T")[0]
    return dateStr > fromDate && dateStr < toDate
  }

  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return

    const dateStr = date.toISOString().split("T")[0]

    if (activeTab === "from") {
      onFromDateSelect(dateStr)
      // Auto switch to TO date selection after FROM is selected
      setActiveTab("to")
    } else {
      onToDateSelect(dateStr)
    }
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <View className="bg-white">
      {/* Tab Selection */}
      <View className="flex-row border-b border-gray-300">
        <TouchableOpacity
          onPress={() => setActiveTab("from")}
          className={`flex-1 py-3 ${activeTab === "from" ? "border-b-2 border-blue-500" : ""}`}
        >
          <Text className={`text-center font-medium ${activeTab === "from" ? "text-blue-600" : "text-gray-600"}`}>
            Selected From Date
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("to")}
          className={`flex-1 py-3 ${activeTab === "to" ? "border-b-2 border-blue-500" : ""}`}
          disabled={!fromDate}
        >
          <Text
            className={`text-center font-medium ${activeTab === "to" && fromDate ? "text-blue-600" : "text-gray-400"}`}
          >
            Selected To Date
          </Text>
        </TouchableOpacity>
      </View>

      {/* Month Navigation */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2"
        >
          <Text className="text-blue-600 text-lg">‹</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold">{formatMonthYear(currentMonth)}</Text>
        <TouchableOpacity
          onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2"
        >
          <Text className="text-blue-600 text-lg">›</Text>
        </TouchableOpacity>
      </View>

      {/* Week Days Header */}
      <View className="flex-row">
        {weekDays.map((day) => (
          <View key={day} className="flex-1 p-2">
            <Text className="text-center text-sm font-medium text-gray-600">{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Days */}
      <View className="flex-row flex-wrap">
        {days.map((date, index) => {
          const disabled = isDateDisabled(date)
          const selected = isSelectedDate(date)
          const inRange = isInRange(date)

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleDateSelect(date)}
              disabled={!date || disabled}
              className={`w-1/7 aspect-square flex items-center justify-center ${
                selected ? "bg-blue-500" : inRange ? "bg-blue-100" : ""
              } ${disabled ? "opacity-30" : ""}`}
              style={{ width: `${100 / 7}%` }}
            >
              {date && (
                <Text
                  className={`text-center ${
                    selected
                      ? "text-white font-bold"
                      : inRange
                        ? "text-blue-600"
                        : disabled
                          ? "text-gray-400"
                          : "text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </Text>
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

// Pagination Component
const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, hasPrev, hasNext, onPageChange }) => {
  return (
    <View className="flex-row justify-between items-center mt-6 px-4">
      <Text className="text-sm text-gray-600">
        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
        {totalItems}
      </Text>
      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className={`px-3 py-2 rounded ${hasPrev ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <Text className={`text-sm ${hasPrev ? "text-white" : "text-gray-500"}`}>Prev</Text>
        </TouchableOpacity>
        <View className="px-3 py-2 bg-blue-100 rounded">
          <Text className="text-sm text-blue-800">{currentPage}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`px-3 py-2 rounded ${hasNext ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <Text className={`text-sm ${hasNext ? "text-white" : "text-gray-500"}`}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Card Component for mobile-friendly layout
const Card = ({ children, className = "" }) => (
  <View className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>{children}</View>
)

// Employee Card Component for Attendance
const EmployeeAttendanceCard = ({ employee, calendarDays, getAttendanceStatus }) => (
  <Card className="mb-4 p-4">
    <View className="mb-4">
      <Text className="text-lg font-semibold text-blue-700 mb-1">
        {employee?.attendance[0]?.employeeName || "Unknown Employee"}
      </Text>
      <Text className="text-base font-medium text-gray-900 mb-1">{employee.username}</Text>
      <Text className="text-sm text-gray-600 mb-2">
        {employee.department} - {employee.role}
      </Text>
      <Text className="text-sm text-gray-500">
        Present days: {employee.attendance.filter((att) => att.hasPunchedIn).length} days
      </Text>
    </View>

    {/* Calendar Grid */}
    <View className="flex-row flex-wrap">
      {calendarDays.map((day, index) => {
        const attendance = getAttendanceStatus(employee, day)
        const isPresent = attendance && attendance.hasPunchedIn
        const isTodayOff = attendance && attendance.isTodayOff

        return (
          <View
            key={index}
            className={`w-8 h-8 m-0.5 rounded flex items-center justify-center ${
              isPresent
                ? "bg-green-100 border border-green-200"
                : isTodayOff
                  ? "bg-gray-400 border border-gray-300"
                  : "bg-red-100 border border-red-200"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isPresent ? "text-green-800" : isTodayOff ? "text-white" : "text-red-800"
              }`}
            >
              {day.getDate()}
            </Text>
          </View>
        )
      })}
    </View>
  </Card>
)

// In/Out Record Card Component
const InOutRecordCard = ({ record }) => (
  <Card className="mb-3 p-4">
    <View className="mb-3">
      <Text className="text-base font-semibold text-gray-900">{record.employeeName}</Text>
      <Text className="text-sm text-gray-600">{record.employeeCode}</Text>
    </View>

    <View className="space-y-2">
      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">Punch-In Time:</Text>
        <Text className="text-sm font-medium">
          {record?.actualPunchInTime
            ? new Date(record.actualPunchInTime).toISOString().replace("T", " ").slice(0, 19)
            : "-"}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">Punched In:</Text>
        <Text className="text-sm">
          {record.userpunchInTime
            ? new Date(record.userpunchInTime).toISOString().replace("T", " ").slice(0, 19)
            : "Not punched in"}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">Punch-Out Time:</Text>
        <Text className="text-sm font-medium">
          {record?.actualPunchOutTime
            ? new Date(record.actualPunchOutTime).toISOString().replace("T", " ").slice(0, 19)
            : "-"}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">Punched Out:</Text>
        <Text className="text-sm">
          {record.userPunchOutTime && record.hasPunchedOut
            ? new Date(record.userPunchOutTime).toISOString().replace("T", " ").slice(0, 19)
            : "Not punched out"}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">Total Hours:</Text>
        <Text className="text-sm font-medium">{record.totalHours}</Text>
      </View>
    </View>

    <View className="flex-row flex-wrap mt-3 space-x-2">
      <View className={`px-2 py-1 rounded-full ${record.isOnTime ? "bg-green-100" : "bg-red-100"}`}>
        <Text className={`text-xs font-semibold ${record.isOnTime ? "text-green-800" : "text-red-800"}`}>
          {record.isOnTime ? "On Time" : "Late"}
        </Text>
      </View>

      {record.hasPunchedIn && !record.hasPunchedOut && (
        <View
          className={`px-2 py-1 rounded-full ${
            new Date(record.createdAt).toDateString() !== new Date().toDateString() ? "bg-red-100" : "bg-yellow-100"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              new Date(record.createdAt).toDateString() !== new Date().toDateString()
                ? "text-red-800"
                : "text-yellow-800"
            }`}
          >
            {new Date(record.createdAt).toDateString() !== new Date().toDateString()
              ? "Punch Out missed"
              : "Still Working"}
          </Text>
        </View>
      )}

      <View className={`px-2 py-1 rounded-full ${record.isDayShift ? "bg-blue-100" : "bg-purple-100"}`}>
        <Text className={`text-xs font-semibold ${record.isDayShift ? "text-blue-800" : "text-purple-800"}`}>
          {record.isDayShift ? "Day Shift" : "Night Shift"}
        </Text>
      </View>
    </View>
  </Card>
)

// Search Record Card Component
const SearchRecordCard = ({ record }) => (
  <Card className="mb-3 p-4">
    <View className="mb-3">
      <Text className="text-sm font-medium text-gray-900">
        Date: {new Date(record.createdAt).toISOString().slice(0, 10)}
      </Text>
    </View>

    <View className="space-y-2">
      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">Punch-In Time:</Text>
        <Text className="text-sm font-medium">
          {new Date(record.actualPunchInTime).toISOString().replace("T", " ").slice(0, 19)}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">Punched In:</Text>
        <Text className="text-sm">
          {record.userpunchInTime
            ? new Date(record?.userpunchInTime)?.toISOString().replace("T", " ").slice(0, 19)
            : "Not punched in"}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">Punch-Out Time:</Text>
        <Text className="text-sm font-medium">
          {record?.actualPunchOutTime
            ? new Date(record.actualPunchOutTime).toISOString().replace("T", " ").slice(0, 19)
            : "-"}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">Punched Out:</Text>
        <Text className="text-sm">
          {record.userPunchOutTime && record.hasPunchedOut
            ? new Date(record.userPunchOutTime)?.toISOString().replace("T", " ").slice(0, 19)
            : "Not punched out"}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">Total Hours:</Text>
        <Text className="text-sm font-medium">{record.totalHours || "0h 0m"}</Text>
      </View>
    </View>

    <View className="flex-row flex-wrap mt-3 space-x-2">
      {record.hasPunchedIn ? (
        <View className={`px-2 py-1 rounded-full ${record.isOnTime ? "bg-green-100" : "bg-red-100"}`}>
          <Text className={`text-xs font-semibold ${record.isOnTime ? "text-green-800" : "text-red-800"}`}>
            {record.isOnTime ? "On Time" : "Late"}
          </Text>
        </View>
      ) : record.isTodayOff ? (
        <View className="px-2 py-1 rounded-full bg-gray-100">
          <Text className="text-xs font-semibold text-gray-800">Off Day</Text>
        </View>
      ) : (
        <View className="px-2 py-1 rounded-full bg-red-100">
          <Text className="text-xs font-semibold text-red-800">Absent</Text>
        </View>
      )}

      {record.hasPunchedIn && !record.hasPunchedOut && (
        <View
          className={`px-2 py-1 rounded-full ${
            new Date(record.createdAt).toDateString() !== new Date().toDateString() ? "bg-red-100" : "bg-yellow-100"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              new Date(record.createdAt).toDateString() !== new Date().toDateString()
                ? "text-red-800"
                : "text-yellow-800"
            }`}
          >
            {new Date(record.createdAt).toDateString() !== new Date().toDateString()
              ? "Punch Out missed"
              : "Still Working"}
          </Text>
        </View>
      )}

      <View className={`px-2 py-1 rounded-full ${record.isDayShift ? "bg-blue-100" : "bg-purple-100"}`}>
        <Text className={`text-xs font-semibold ${record.isDayShift ? "text-blue-800" : "text-purple-800"}`}>
          {record.isDayShift ? "Day Shift" : "Night Shift"}
        </Text>
      </View>
    </View>
  </Card>
)

// Main Component
const TeamReportCop = () => {
  const [activeTab, setActiveTab] = useState("attendance")
  const [attendanceData, setAttendanceData] = useState(null)
  const [inOutData, setInOutData] = useState([])
  const [searchData, setSearchData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [employeeCode, setEmployeeCode] = useState("")
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
  })
  const [showDateModal, setShowDateModal] = useState(false)
  const [tempDateRange, setTempDateRange] = useState({
    fromDate: "",
    toDate: "",
  })
  const [calendarActiveTab, setCalendarActiveTab] = useState("from")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  })
  const [searchPagination, setSearchPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  })

  // Helper function to get authenticated headers
  const getAuthHeaders = async () => {
    const token = await getToken()
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "reactnative",
    }
  }

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams({
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
      })

      const response = await fetch(`${API_BASE_URL}/api/employees/my-team-data?${params}`, {
        method: "GET",
        headers,
      })

      const result = await response.json()

      if (result.success) {
        setAttendanceData(result.data)
      } else {
        showToast("Failed to fetch attendance data", "error")
      }
    } catch (error) {
      showToast("Error fetching attendance data", "error")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInOutData = async (page = 1) => {
    setLoading(true)
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams({
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        page: page,
        limit: pagination.limit,
      })

      const response = await fetch(`${API_BASE_URL}/api/employees/in-out-report/?${params}`, {
        method: "GET",
        headers,
      })

      const result = await response.json()

      if (result.success) {
        setInOutData(result.data)
        setPagination(result.pagination)
      } else {
        showToast("Failed to fetch in/out report", "error")
      }
    } catch (error) {
      showToast("Error fetching in/out report", "error")
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasPrev: false,
        hasNext: false,
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeSearch = async (page = 1) => {
    if (!employeeCode.trim()) {
      showToast("Please enter an employee code", "error")
      return
    }

    setSearchLoading(true)
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams({
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        page: page,
        limit: searchPagination.limit,
      })

      const response = await fetch(`${API_BASE_URL}/api/employees/in-out-report/${employeeCode}?${params}`, {
        method: "GET",
        headers,
      })

      const result = await response.json()

      if (result.success) {
        setSearchData(result.data)
        setSearchPagination(result.pagination)
        showToast("Employee data found successfully")
      } else {
        showToast(result.message || "Employee not found or no data available", "error")
        setSearchData(null)
        setSearchPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
          hasPrev: false,
          hasNext: false,
        })
      }
    } catch (error) {
      showToast("Error searching employee data", "error")
      console.error(error)
      setSearchData(null)
    } finally {
      setSearchLoading(false)
    }
  }

  const openDateModal = () => {
    setTempDateRange({ fromDate: "", toDate: "" })
    setCalendarActiveTab("from")
    setShowDateModal(true)
  }

  const closeDateModal = () => {
    setShowDateModal(false)
  }

  const handleFromDateSelect = (dateString) => {
    setTempDateRange((prev) => ({ ...prev, fromDate: dateString, toDate: "" }))
  }

  const handleToDateSelect = (dateString) => {
    setTempDateRange((prev) => ({ ...prev, toDate: dateString }))
  }

  const submitDateRange = () => {
    if (!tempDateRange.fromDate || !tempDateRange.toDate) {
      showToast("Please select both from and to dates", "error")
      return
    }

    const fromDate = new Date(tempDateRange.fromDate)
    const toDate = new Date(tempDateRange.toDate)
    const diffTime = Math.abs(toDate - fromDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 31) {
      showToast("Date range cannot exceed 31 days", "error")
      return
    }

    if (fromDate > toDate) {
      showToast("From date cannot be greater than to date", "error")
      return
    }

    setDateRange(tempDateRange)
    setPagination((prev) => ({ ...prev, page: 1 }))
    setSearchPagination((prev) => ({ ...prev, page: 1 }))
    setSearchData(null)
    setShowDateModal(false)
  }

  const generateCalendarDays = () => {
    const start = new Date(dateRange.fromDate)
    const end = new Date(dateRange.toDate)
    const days = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d))
    }

    return days
  }

  const getAttendanceStatus = (employee, date) => {
    const dateStr = date.toISOString().split("T")[0]
    const attendance = employee.attendance.find(
      (att) => new Date(att.createdAt).toISOString().split("T")[0] === dateStr,
    )
    return attendance
  }

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendanceData()
    } else if (activeTab === "inout") {
      fetchInOutData(currentPage)
    }
  }, [activeTab, dateRange, currentPage])

  useEffect(() => {
    if (activeTab === "search") {
      handleEmployeeSearch(currentPage)
    }
  }, [currentPage])

  const calendarDays = generateCalendarDays()

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Combined Header and Date Range Card */}
        <Card className="mb-4 p-4">
          <Text className="text-2xl font-bold text-gray-900 mb-4">Team Report Dashboard</Text>

          <View className="flex-row justify-between items-start">
            {/* Left side - Reporting Manager Info */}
            <View className="flex-1">
              {attendanceData && (
                <View>
                  <Text className="text-lg font-semibold text-gray-900 mb-1">Reporting Manager</Text>
                  <Text className="text-base text-gray-800 mb-1">
                    {attendanceData.reportingPerson.reportingPersonName} - {attendanceData.reportingPerson.role}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    Department: {attendanceData.reportingPerson.department}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Date Range: {new Date(dateRange.fromDate).toLocaleDateString()} -{" "} {new Date(dateRange.toDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {!attendanceData && (
                <View>
                  <Text className="text-lg font-semibold text-gray-900 mb-1">Team Report</Text>
                  <Text className="text-sm text-gray-700">
                    Date Range: {new Date(dateRange.fromDate).toLocaleDateString()} -{" "} {new Date(dateRange.toDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Right side - Select Date Range Button */}
            <TouchableOpacity
              onPress={openDateModal}
              className="bg-green-100 border-2 border-green-400 rounded-lg px-4 py-2 ml-4"
            >
              <Text className="text-green-800 font-semibold text-center"> Date Range</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Date Selection Modal with Single Calendar */}
        <Modal visible={showDateModal} transparent={true} animationType="slide" onRequestClose={closeDateModal}>
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white rounded-lg mx-4 w-full max-w-sm max-h-5/6">
              <View className="p-4 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900 mb-2">Select Date Range</Text>
                <Text className="text-sm text-gray-500 mb-4">Maximum 31 days range allowed</Text>

                {/* Selected dates display */}
                <View className="mb-4">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    From Date:{" "}
                    {tempDateRange.fromDate ? new Date(tempDateRange.fromDate).toLocaleDateString() : "Not selected"}
                  </Text>
                  <Text className="text-base font-semibold text-gray-900">
                    To Date:{" "}
                    {tempDateRange.toDate ? new Date(tempDateRange.toDate).toLocaleDateString() : "Not selected"}
                  </Text>
                </View>
              </View>

              <ScrollView className="max-h-96">
                <DateRangeCalendar
                  fromDate={tempDateRange.fromDate}
                  toDate={tempDateRange.toDate}
                  onFromDateSelect={handleFromDateSelect}
                  onToDateSelect={handleToDateSelect}
                  activeTab={calendarActiveTab}
                  setActiveTab={setCalendarActiveTab}
                />
              </ScrollView>

              <View className="p-4 border-t border-gray-200">
                <View className="flex-row space-x-3">
                  <TouchableOpacity onPress={closeDateModal} className="flex-1 px-4 py-3 bg-gray-300 rounded-lg">
                    <Text className="text-gray-800 font-medium text-center">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={submitDateRange}
                    className={`flex-1 px-4 py-3 rounded-lg ${
                      tempDateRange.fromDate && tempDateRange.toDate ? "bg-gray-600" : "bg-gray-300"
                    }`}
                    disabled={!tempDateRange.fromDate || !tempDateRange.toDate}
                  >
                    <Text
                      className={`font-medium text-center ${
                        tempDateRange.fromDate && tempDateRange.toDate ? "text-white" : "text-gray-500"
                      }`}
                    >
                      Apply
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Tabs */}
        <Card className="mb-4">
          <View className="flex-row border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setActiveTab("attendance")}
              className={`flex-1 py-4 px-4 border-b-2 ${
                activeTab === "attendance" ? "border-blue-500" : "border-transparent"
              }`}
            >
              <Text
                className={`text-sm font-medium text-center ${
                  activeTab === "attendance" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                Attendance Calendar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("inout")}
              className={`flex-1 py-4 px-4 border-b-2 ${
                activeTab === "inout" ? "border-blue-500" : "border-transparent"
              }`}
            >
              <Text
                className={`text-sm font-medium text-center ${
                  activeTab === "inout" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                In/Out Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("search")}
              className={`flex-1 py-4 px-4 border-b-2 ${
                activeTab === "search" ? "border-blue-500" : "border-transparent"
              }`}
            >
              <Text
                className={`text-sm font-medium text-center ${
                  activeTab === "search" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                Search Employee
              </Text>
            </TouchableOpacity>
          </View>

          <View className="p-4">
            {loading ? (
              <View className="flex items-center justify-center py-12">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="ml-3 text-gray-600 mt-2">Loading...</Text>
              </View>
            ) : (
              <>
                {/* Attendance Calendar Tab */}
                {activeTab === "attendance" && attendanceData && (
                  <View>
                    <View className="mb-4">
                      <Text className="text-lg font-semibold text-gray-900 mb-4">Team Attendance Calendar</Text>

                      {/* Legend */}
                      <View className="flex-row flex-wrap mb-4 space-x-4">
                        <View className="flex-row items-center mb-2">
                          <View className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2" />
                          <Text className="text-sm">Present</Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                          <View className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2" />
                          <Text className="text-sm">Absent</Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                          <View className="w-4 h-4 bg-gray-400 border border-gray-200 rounded mr-2" />
                          <Text className="text-sm">Off Day</Text>
                        </View>
                      </View>
                    </View>

                    {attendanceData.employees.map((employee) => (
                      <EmployeeAttendanceCard
                        key={employee.employeeId}
                        employee={employee}
                        calendarDays={calendarDays}
                        getAttendanceStatus={getAttendanceStatus}
                      />
                    ))}
                  </View>
                )}

                {/* In/Out Report Tab */}
                {activeTab === "inout" && (
                  <View>
                    <Text className="text-lg font-semibold text-gray-900 mb-4">In/Out Report</Text>

                    {inOutData.length > 0 ? (
                      <>
                        {inOutData.map((record, index) => (
                          <InOutRecordCard key={record._id || index} record={record} />
                        ))}

                        {pagination.total > pagination.limit && (
                          <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            hasPrev={pagination.hasPrev}
                            hasNext={pagination.hasNext}
                            onPageChange={handlePageChange}
                          />
                        )}
                      </>
                    ) : (
                      <View className="text-center py-12">
                        <Text className="text-base font-medium text-gray-900 mb-2">No data found</Text>
                        <Text className="text-sm text-gray-500">
                          No in/out records found for the selected date range.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Search Employee Tab */}
                {activeTab === "search" && (
                  <View>
                    <View className="mb-6">
                      <Text className="text-lg font-semibold text-gray-900 mb-2">Search Employee</Text>
                      <Text className="text-gray-600 mb-4">
                        Enter employee code to view detailed attendance and working hours data
                      </Text>

                      {/* Search Form */}
                      <View className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Employee Code</Text>
                        <TextInput
                          value={employeeCode}
                          onChangeText={setEmployeeCode}
                          placeholder="Enter employee code (e.g., EMP001)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white mb-4"
                        />
                        <TouchableOpacity
                          onPress={() => handleEmployeeSearch()}
                          disabled={searchLoading || !employeeCode.trim()}
                          className={`px-6 py-3 rounded-lg ${
                            searchLoading || !employeeCode.trim() ? "bg-gray-300" : "bg-blue-600"
                          }`}
                        >
                          {searchLoading ? (
                            <View className="flex-row items-center justify-center">
                              <ActivityIndicator size="small" color="white" />
                              <Text className="text-white font-medium ml-2">Searching...</Text>
                            </View>
                          ) : (
                            <Text className="text-white font-medium text-center">Search</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Search Results */}
                    {searchData && searchData.length > 0 && (
                      <View>
                        <View className="mb-4">
                          <Text className="text-lg font-semibold text-gray-900 mb-2">Attendance Records</Text>
                          <Text className="text-sm text-gray-600">
                            Showing data from {new Date(dateRange.fromDate).toLocaleDateString()} to{" "}
                            {new Date(dateRange.toDate).toLocaleDateString()}
                          </Text>
                        </View>

                        {searchData.map((record, index) => (
                          <SearchRecordCard key={index} record={record} />
                        ))}

                        {searchPagination.total > searchPagination.limit && (
                          <Pagination
                            currentPage={searchPagination.page}
                            totalPages={searchPagination.totalPages}
                            totalItems={searchPagination.total}
                            itemsPerPage={searchPagination.limit}
                            hasPrev={searchPagination.hasPrev}
                            hasNext={searchPagination.hasNext}
                            onPageChange={handlePageChange}
                          />
                        )}
                      </View>
                    )}

                    {/* Empty State */}
                    {!searchData && !searchLoading && (
                      <View className="text-center py-12">
                        <View className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Text className="text-4xl">🔍</Text>
                        </View>
                        <Text className="text-lg font-medium text-gray-900 mb-2">Search for Employee Data</Text>
                        <Text className="text-gray-500 mb-4">
                          Enter an employee code above to view their detailed attendance records and working hours.
                        </Text>
                        <Text className="text-sm text-gray-400">
                          💡 Tip: Use the date range selector above to filter results for specific periods
                        </Text>
                      </View>
                    )}

                    {searchData && searchData.length === 0 && (
                      <View className="text-center py-12">
                        <Text className="text-base font-medium text-gray-900 mb-2">No attendance records</Text>
                        <Text className="text-sm text-gray-500">
                          No attendance data found for this employee in the selected date range.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </Card>
      </View>
    </ScrollView>
  )
}

export default TeamReportCop
