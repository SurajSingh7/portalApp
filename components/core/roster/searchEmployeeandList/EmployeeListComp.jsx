import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Dimensions,
} from 'react-native';
import { API_BASE_URL, APP_BACKGROUND_COLOR } from '../../../../config/api';
import { getToken } from '../../../../utils/storage';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function EmployeeListComp() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchEmployees = async (pageToFetch = 1, append = false, isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
      setError(null);
    } else if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');

      const res = await fetch(
        `${API_BASE_URL}/api/employee-shift-details?page=${pageToFetch}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'reactnative',
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await res.json();
      const newEmployees = data?.data || [];

      const employeesWithUniqueIds = newEmployees.map((emp, index) => ({
        ...emp,
        uniqueId: `${emp._id || emp.id || index}_${pageToFetch}_${Date.now()}`,
      }));

      if (employeesWithUniqueIds.length === 0 && pageToFetch === 1) {
        setEmployees([]);
        setHasMore(false);
      } else {
        setEmployees((prev) => {
          if (append) {
            const existingIds = new Set(prev.map((emp) => emp._id || emp.id));
            const filteredNew = employeesWithUniqueIds.filter(
              (emp) => !existingIds.has(emp._id || emp.id)
            );
            return [...prev, ...filteredNew];
          } else {
            return employeesWithUniqueIds;
          }
        });
        setHasMore(employeesWithUniqueIds.length >= 10);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError(err.message || 'Failed to load employees');
      if (!append) {
        setEmployees([]);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEmployees(page, page > 1);
  }, [page]);

  const onRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchEmployees(1, false, true);
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !error) {
      setPage((prev) => prev + 1);
    }
  }, [isLoadingMore, hasMore, error]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

 const getShiftStatusText = (shiftTime) => {
  if (!shiftTime || typeof shiftTime !== 'string') {
    return { text: 'Unknown', color: 'text-gray-600' };
  }

  // Clean and parse shiftTime
  const parts = shiftTime.replace(/\s+/g, '').split('-'); // remove spaces and split
  if (parts.length !== 2) {
    return { text: 'Unknown', color: 'text-gray-600' };
  }

  const [start, end] = parts;
  const now = new Date();

  const startTime = new Date(now);
  const endTime = new Date(now);

  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);

  if (
    isNaN(startHour) || isNaN(startMinute) ||
    isNaN(endHour) || isNaN(endMinute)
  ) {
    return { text: 'Unknown', color: 'text-gray-600' };
  }

  startTime.setHours(startHour, startMinute, 0, 0);
  endTime.setHours(endHour, endMinute, 0, 0);

  // Handle overnight shifts (endTime is earlier than startTime)
  if (endTime <= startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  if (now >= startTime && now < endTime) {
    return { text: 'Active', color: 'text-green-600' };
  } else if (now < startTime) {
    return { text: 'Upcoming', color: 'text-blue-600' };
  } else {
    return { text: 'Completed', color: 'text-red-600' };
  }
};


  const getShiftStatusColor = (shiftTime) => {
    const status = getShiftStatusText(shiftTime);
    if (status.text === 'Active') return 'bg-green-100 border-green-200';
    if (status.text === 'Upcoming') return 'bg-blue-100 border-blue-200';
    if (status.text === 'Completed') return 'bg-red-100 border-red-200';
    return 'bg-gray-100 border-gray-200';
  };

  const renderEmployeeCard = ({ item, index }) => {
    const shiftDetails = item.shiftDetails || {};
    const shiftStatus = getShiftStatusText(shiftDetails.shiftTime);
    const cardBg = getShiftStatusColor(shiftDetails.shiftTime);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className={`bg-white rounded-2xl shadow-lg m-2 overflow-hidden border ${cardBg}`}
        style={{
          width: (width - 32) / 2 - 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <View className="p-3 pb-2">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 pr-2">
              <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
                {shiftDetails.name || 'Unknown Employee'}
              </Text>
              <Text className="text-xs text-gray-500">
                ID: {shiftDetails.employeeCode || 'N/A'}
              </Text>
            </View>
            <View
              className={`px-2 py-1 rounded-full ${
                shiftStatus.color.includes('green')
                  ? 'bg-green-100'
                  : shiftStatus.color.includes('blue')
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
              }`}
            >
              <Text className={`text-xs font-semibold ${shiftStatus.color}`}>
                {shiftStatus.text}
              </Text>
            </View>
          </View>

          <View className="space-y-2">
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-indigo-100 rounded-full items-center justify-center mr-2">
                <Text className="text-indigo-600 text-xs">🕒</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-gray-800" numberOfLines={1}>
                  {shiftDetails.shiftTime || 'Not specified'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center mr-2">
                <Text className="text-purple-600 text-xs">🏢</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-gray-800" numberOfLines={1}>
                  {item.departmentDetails?.[0]?.name || 'No Department'}
                </Text>
              </View>
            </View>

            {/* <View className="flex-row items-center">
              <View className="w-6 h-6 bg-orange-100 rounded-full items-center justify-center mr-2">
                <Text className="text-orange-600 text-xs">📅</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-gray-800" numberOfLines={1}>
                  {shiftDetails.weeklyOff || 'Not specified'}
                </Text>
              </View>
            </View> */}

            {item.mobile && (
              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-2">
                  <Text className="text-green-600 text-xs">📱</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-800" numberOfLines={1}>
                    {item.mobile}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View
          className={`h-1 ${
            shiftStatus.color.includes('green')
              ? 'bg-green-400'
              : shiftStatus.color.includes('blue')
              ? 'bg-blue-400'
              : 'bg-red-400'
          }`}
        />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View className=" mx-auto  pt-3">
      <View className="mb-4">
        <Text className="text-3xl font-black text-gray-900 mb-2">Employee Shifts</Text>
        <Text className="text-base text-gray-600 leading-relaxed">
          Today's schedule overview for{' '}
          <Text className="text-indigo-600 font-bold ">{today}</Text>
        </Text>
      </View>

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <Text className="text-red-800 font-semibold mb-1">Error Loading Data</Text>
          <Text className="text-red-600 text-sm">{error}</Text>
          <TouchableOpacity
            onPress={() => {
              setPage(1);
              setError(null);
              fetchEmployees(1, false, false);
            }}
            className="bg-red-600 rounded-lg py-2 px-4 mt-3 self-start"
          >
            <Text className="text-white font-semibold text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8 py-16">
      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
        <Text className="text-4xl">👥</Text>
      </View>
      <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
        {error ? 'Unable to load employees' : 'No employees found'}
      </Text>
      <Text className="text-gray-500 text-center leading-relaxed mb-6">
        {error
          ? 'Please check your connection and try again.'
          : 'There are no employees scheduled for today. Pull down to refresh.'}
      </Text>
      {error && (
        <TouchableOpacity
          onPress={onRefresh}
          className="bg-indigo-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (error && employees.length === 0) return null;

    if (!hasMore) {
      return (
        <View className="py-8 items-center">
          <Text className="text-gray-400 text-sm">You've reached the end</Text>
        </View>
      );
    }

    return (
      <View className="px-4 mb-8">
        <TouchableOpacity
          onPress={loadMore}
          disabled={isLoadingMore}
          className="bg-indigo-600 rounded-2xl py-4 items-center shadow-lg"
          style={{
            shadowColor: '#4F46E5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {isLoadingMore ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-semibold ml-2">Loading...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-base">Load More Employees</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && page === 1 && employees.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-2xl p-8 shadow-lg items-center">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="text-gray-600 mt-4 font-medium">Loading employees...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={`flex-1 bg-${APP_BACKGROUND_COLOR}-50`}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <FlatList
        data={employees}
        keyExtractor={(item) =>
          item.uniqueId || item._id || item.id || Math.random().toString()
        }
        renderItem={renderEmployeeCard}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}
      />
    </View>
  );
}
