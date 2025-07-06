import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, RefreshControl, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Search, ChevronLeft, ChevronRight, RefreshCw, Activity } from "lucide-react-native"
import { API_BASE_URL, APP_BACKGROUND_COLOR } from "../../../../config/api"
import { getToken } from "../../../../utils/storage"

const ActivityLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  })

  

  // Fetch activity logs
  const fetchActivityLogs = async (page = 1, search = "", showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { employeeCode: search }),
      })

      const response = await fetch(`${API_BASE_URL}/api/Shifts/shift-activity-logs?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch activity logs")
      }

      const data = await response.json()
      if (data.success) {
        setLogs(data.data)
        setPagination(data.pagination)
      } else {
        throw new Error(data.message || "Failed to fetch data")
      }
    } catch (err) {
      setError(err.message)
      setLogs([])
      Alert.alert("Error", err.message)
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchActivityLogs()
  }, [])

  // Handle search
  const handleSearch = () => {
    fetchActivityLogs(1, searchTerm)
  }

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true)
    fetchActivityLogs(pagination.page, searchTerm, false)
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchActivityLogs(newPage, searchTerm)
  }

  // Reset search
  const handleReset = () => {
    setSearchTerm("")
    fetchActivityLogs(1, "")
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format date range
  const formatDateRange = (fromDate, toDate) => {
    const from = new Date(fromDate).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    })
    const to = new Date(toDate).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    return `${from} - ${to}`
  }

  // Get action badge styling
  const getActionBadgeStyle = (action) => {
    const styles = {
      SELECTED_DAY_UPDATE: "bg-green-600",
      RANGE_UPDATE: "bg-emerald-600",
      CUSTOM_SHIFT_UPDATE: "bg-purple-600",
      default: "bg-slate-600",
    }
    return styles[action] || styles.default
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <View className="px-1">
      {[...Array(5)].map((_, i) => (
        <View key={i} className="bg-white rounded-2xl shadow-lg p-4 mb-3 border border-gray-200">
          <View className="flex-row justify-between items-start mb-3">
            <View className="bg-gray-300 h-7 w-24 rounded-full" />
            <View className="bg-gray-300 h-4 w-20 rounded-lg" />
          </View>
          <View className="space-y-3">
            <View className="bg-gray-300 h-4 w-32 rounded-lg" />
            <View className="bg-gray-300 h-4 w-28 rounded-lg" />
            <View className="bg-gray-300 h-4 w-36 rounded-lg" />
          </View>
        </View>
      ))}
    </View>
  )

  // Log item component
  const LogItem = ({ log }) => (
    <View className="bg-white rounded-2xl shadow-lg p-4 mb-3 border border-gray-200 mx-1">
      {/* Action Badge & Date */}
      <View className="flex-row justify-between items-start mb-4">
        <View className={`px-3 py-1.5 rounded-full ${getActionBadgeStyle(log.action)}`}>
          <Text className="text-xs font-bold text-white tracking-wide">{log.action.replace("_", " ")}</Text>
        </View>
        <View className="bg-gray-100 px-2 py-1 rounded-xl">
          <Text className="text-xs font-medium text-gray-700">{formatDate(log.createdAt)}</Text>
        </View>
      </View>

      {/* Content Grid */}
      <View className="space-y-3">
        {/* Performed By */}
        <View className="bg-green-50 rounded-xl p-3 border-l-4 border-green-600">
          <Text className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1.5">Performed By</Text>
          <Text className="text-sm font-bold text-gray-900 mb-1">
            {log.performedBy.basicEmployee.firstName} {log.performedBy.basicEmployee.lastName}
          </Text>
          <Text className="text-sm text-green-700 font-medium">{log.performedBy.email}</Text>
        </View>

        {/* Details Row */}
        <View className="flex-row space-x-3">
          {/* Target Employee */}
          <View className="flex-1 bg-emerald-50 rounded-xl p-3 border-l-4 border-emerald-600">
            <Text className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">Target Employee</Text>
            <Text className="text-sm font-bold text-gray-900">{log.targetEmployee}</Text>
          </View>

          {/* New Shift */}
          <View className="flex-1 bg-purple-50 rounded-xl p-3 border-l-4 border-purple-600">
            <Text className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1.5">New Shift</Text>
            <Text className="text-sm font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded-lg">
              {log.changes.newShift}
            </Text>
          </View>
        </View>

        {/* Date Range & Weekly Off */}
        <View className="flex-row space-x-3">
          {/* Date Range */}
          <View className="flex-1 bg-amber-50 rounded-xl p-3 border-l-4 border-amber-600">
            <Text className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">Date Range</Text>
            <Text className="text-sm font-bold text-gray-900 mb-1">
              {formatDateRange(log.changes.fromDate, log.changes.toDate)}
            </Text>
            <View className="bg-amber-200 px-1.5 py-0.5 rounded-lg self-start">
              <Text className="text-xs font-bold text-amber-900">
                {log.changes.affectedDays} day{log.changes.affectedDays !== 1 ? "s" : ""} affected
              </Text>
            </View>
          </View>

          {/* Weekly Off */}
          <View className="flex-1 bg-rose-50 rounded-xl p-3 border-l-4 border-rose-600">
            <Text className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1.5">Weekly Off</Text>
            <Text className="text-sm font-bold text-gray-900">
              {log.changes.weeklyOff && log.changes.weeklyOff !== "None" ? log.changes.weeklyOff : "-"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )

  return (
    // <SafeAreaView className={`flex-1 bg-${APP_BACKGROUND_COLOR}-50`}>
      <ScrollView
        // className="flex-1 px-4"
        className={`flex-1 bg-${APP_BACKGROUND_COLOR}-50 px-4`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6 mt-4 ">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-500 p-2 rounded-2xl shadow-lg">
              <Activity size={24} color="white" />
            </View>
            <View className="ml-4">
              <Text className="text-2xl font-black text-gray-900 tracking-tight">Activity Logs</Text>
              <Text className="text-gray-600 font-medium mt-1">Track all shift-related activities and changes</Text>
            </View>
          </View>
        </View>

        {/* Search Section */}
        <View className="bg-white rounded-2xl shadow-xl p-4 mb-4 border border-gray-200">
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-900 mb-2">Search & Filter</Text>
            <View className="relative">
              <View className="absolute left-4 top-4 z-10">
                <Search size={20} color="#6b7280" />
              </View>
              <TextInput
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl text-gray-900 font-medium bg-gray-50"
                placeholder="Search by employee code..."
                placeholderTextColor="#9ca3af"
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={handleSearch}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-6 space-x-3">
            <TouchableOpacity
              onPress={handleSearch}
              className="flex-1 flex-row items-center justify-center space-x-2 px-4 py-3 bg-green-600 rounded-xl shadow-lg"
              activeOpacity={0.8}
            >
              <Search size={16} color="white" />
              <Text className="text-white font-bold text-base">Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 flex-row items-center justify-center space-x-2 px-4 py-3 bg-gray-200 rounded-xl shadow-lg"
              activeOpacity={0.8}
            >
              <RefreshCw size={16} color="#374151" />
              <Text className="text-gray-700 font-bold text-base">Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Summary */}
        {!loading && (
          <View className="bg-white rounded-xl shadow-lg p-3 mb-4 border border-gray-200">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center space-x-2">
                <View className="w-2 h-2 mx-2 bg-green-500 rounded-full" />
                <Text className="text-sm font-bold text-gray-700">
                  Showing {logs.length } of {pagination.total} results
                  {searchTerm && ` for "${searchTerm}"`}
                </Text>
              </View>
              <View className="bg-green-100 px-3 py-1 rounded-lg">
                <Text className="text-sm font-bold text-green-800">
                  Page {pagination.page} of {pagination.totalPages}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 mb-4 shadow-lg">
            <View className="flex-row items-center space-x-3 mb-2">
              <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center shadow-lg">
                <Text className="text-white text-sm font-black">!</Text>
              </View>
              <Text className="text-red-800 font-black text-base">Error loading activity logs</Text>
            </View>
            <Text className="text-red-700 font-medium ml-11">{error}</Text>
          </View>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Activity Logs List */}
        {!loading && !error && (
          <>
            {logs.length === 0 ? (
              <View className="bg-white rounded-2xl shadow-xl p-8 items-center border border-gray-200">
                <View className="bg-gray-200 p-4 rounded-full mb-6 shadow-lg">
                  <Activity size={40} color="#9ca3af" />
                </View>
                <Text className="text-lg font-black text-gray-900 mb-2">No activity logs found</Text>
                <Text className="text-gray-600 text-center font-medium leading-relaxed">
                  {searchTerm
                    ? `No logs found for employee code "${searchTerm}"`
                    : "There are no activity logs to display at the moment"}
                </Text>
              </View>
            ) : (
              <View className="mb-4">
                {logs.map((log) => (
                  <LogItem key={log._id} log={log} />
                ))}
              </View>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <View className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-gray-200">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-base font-bold text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </Text>
                  <View className="bg-green-100 px-3 py-1 rounded-lg">
                    <Text className="text-sm font-bold text-green-800">{pagination.total} total</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <TouchableOpacity
                    onPress={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className={`flex-row items-center space-x-2 px-4 py-2 border-2 border-gray-400 rounded-xl shadow-lg ${
                      !pagination.hasPrev ? "opacity-40 bg-gray-100" : "bg-white"
                    }`}
                    activeOpacity={0.8}
                  >
                    <ChevronLeft size={16} color="#374151" />
                    <Text className="text-gray-700 font-bold">Previous</Text>
                  </TouchableOpacity>

                  {/* Page Numbers */}
                  <View className="flex-row space-x-2">
                    {[...Array(Math.min(3, pagination.totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, pagination.page - 1) + i
                      if (pageNum > pagination.totalPages) return null
                      const isActive = pageNum === pagination.page

                      return (
                        <TouchableOpacity
                          key={pageNum}
                          onPress={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-xl items-center justify-center shadow-lg ${
                            isActive ? "bg-green-600" : "bg-white border-2 border-gray-400"
                          }`}
                          activeOpacity={0.8}
                        >
                          <Text className={`font-black ${isActive ? "text-white" : "text-gray-700"}`}>{pageNum}</Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>

                  <TouchableOpacity
                    onPress={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className={`flex-row items-center space-x-2 px-4 py-2 border-2 border-gray-400 rounded-xl shadow-lg ${
                      !pagination.hasNext ? "opacity-40 bg-gray-100" : "bg-white"
                    }`}
                    activeOpacity={0.8}
                  >
                    <Text className="text-gray-700 font-bold">Next</Text>
                    <ChevronRight size={16} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    // {/* </SafeAreaView> */}
  )
}

export default ActivityLogs
