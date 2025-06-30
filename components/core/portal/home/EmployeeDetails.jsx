import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { usePermissions } from '../../../../context/PermissionContext';
import EmployeeDataCard from './employeeDetails/EmployeeDataCard';
// import AttendanceGraph from './AttendanceGraph';
import MonthlyAttendanceCalendars from './employeeDetails/MonthlyAttendanceCalendars';
// import MessagingCard from './MessagingCard';
// import QuickLinksCard from './QuickLinksCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const EmployeeDetails = () => {
  const { userData, loading } = usePermissions();
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (userData?.employeeCode) {
      setSelectedEmployee(userData.employeeCode);
    }
  }, [userData]);

  if (loading || !userData) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-gray-700 mt-4 font-medium">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedEmployee) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 bg-orange-50 justify-center items-center px-4">
          <Text className="text-red-500 text-base font-semibold">Error: Employee code not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff7ed' }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 16, gap: 16 }}>
          <EmployeeDataCard userData={userData} />
          {/* <MessagingCard /> */}
          {/* <QuickLinksCard employeeName={userData} /> */}
          {/* <AttendanceGraph
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
          /> */}
          <MonthlyAttendanceCalendars
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmployeeDetails;
