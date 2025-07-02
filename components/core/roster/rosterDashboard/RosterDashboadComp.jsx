"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native"
import {
  Search,
  Users,
  MapPin,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserCheck,
  Star,
} from "lucide-react-native"
import Toast from "react-native-toast-message"
import { API_BASE_URL } from "../../../../config/api"
import { getToken } from "../../../../utils/storage"
import ReportModal from "./ReportModal"

const { width } = Dimensions.get("window")

const Button = ({ children, variant = "primary", size = "sm", onPress, disabled, style, ...props }) => {
  const getButtonStyle = () => {
    const baseStyle = {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      opacity: disabled ? 0.5 : 1,
    }

    const variants = {
      primary: {
        backgroundColor: "#2563EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
      },
      outline: {
        borderWidth: 2,
        borderColor: "#D1D5DB",
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      ghost: { backgroundColor: "transparent" },
      success: {
        backgroundColor: "#10B981",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
      },
    }

    const sizes = {
      xs: { paddingHorizontal: 12, paddingVertical: 8 },
      sm: { paddingHorizontal: 16, paddingVertical: 10 },
      md: { paddingHorizontal: 20, paddingVertical: 12 },
      lg: { paddingHorizontal: 24, paddingVertical: 16 },
    }

    return {
      ...baseStyle,
      ...variants[variant],
      ...sizes[size],
      ...style,
    }
  }

  const getTextStyle = () => {
    const variants = {
      primary: { color: "white", fontWeight: "bold" },
      outline: { color: "#374151", fontWeight: "600" },
      ghost: { color: "#374151", fontWeight: "600" },
      success: { color: "white", fontWeight: "bold" },
    }
    return variants[variant]
  }

  return (
    <TouchableOpacity style={getButtonStyle()} onPress={onPress} disabled={disabled} {...props}>
      <Text style={getTextStyle()}>{children}</Text>
    </TouchableOpacity>
  )
}

const Card = ({ children, style }) => (
  <View
    style={{
      backgroundColor: "white",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      ...style,
    }}
  >
    {children}
  </View>
)

const CardHeader = ({ children, style }) => (
  <View
    style={{
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
      ...style,
    }}
  >
    {children}
  </View>
)

const CardContent = ({ children, style }) => (
  <View style={{ paddingHorizontal: 20, paddingVertical: 16, ...style }}>{children}</View>
)

const CardTitle = ({ children, style }) => (
  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827", ...style }}>{children}</Text>
)

const Badge = ({ children, variant = "default", style }) => {
  const variants = {
    default: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
    outline: { borderWidth: 2, borderColor: "#D1D5DB", backgroundColor: "white" },
    success: { backgroundColor: "#ECFDF5", borderColor: "#BBF7D0" },
    danger: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
    warning: { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" },
    info: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  }

  const textVariants = {
    default: { color: "#1F2937" },
    outline: { color: "#374151" },
    success: { color: "#065F46" },
    danger: { color: "#991B1B" },
    warning: { color: "#92400E" },
    info: { color: "#1E40AF" },
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        ...variants[variant],
        ...style,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "bold", ...textVariants[variant] }}>{children}</Text>
    </View>
  )
}

const Select = ({ value, onValueChange, children, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)
  const options = React.Children.toArray(children)

  return (
    <View style={{ position: "relative" }}>
      <TouchableOpacity
        style={{
          width: "100%",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "white",
          borderWidth: 2,
          borderColor: "#D1D5DB",
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text
          style={{
            color: "#111827",
            fontWeight: "600",
            fontSize: 16,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <ChevronDown size={18} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
          }}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              maxWidth: 300,
              width: "100%",
              marginHorizontal: 16,
              maxHeight: 250,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
              elevation: 24,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map(
                (child, index) =>
                  child && (
                    <TouchableOpacity
                      key={`select-option-${index}`}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                        borderBottomWidth: index < options.length - 1 ? 1 : 0,
                        borderBottomColor: "#F3F4F6",
                      }}
                      onPress={() => {
                        onValueChange(child.props.value)
                        setIsOpen(false)
                      }}
                    >
                      <Text style={{ color: "#111827", fontWeight: "600", fontSize: 16 }}>{child.props.children}</Text>
                    </TouchableOpacity>
                  ),
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const SelectItem = ({ value, children }) => {
  return <View value={value}>{children}</View>
}

export default function RosterDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [activeTab, setActiveTab] = useState("departments")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedDepartments, setExpandedDepartments] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken()
        if (!token) {
          Toast.show({
            type: "error",
            text1: "No authentication token found",
            text2: "Please login again",
          })
          Alert.alert("Authentication Error", "No authentication token found. Please login again.")
          return
        }

        const fullUrl = `${API_BASE_URL}/api/dashboard`
        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "reactnative",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            Toast.show({
              type: "error",
              text1: "Authentication Failed",
              text2: "You are not allowed to visit this page",
            })
            Alert.alert("Authentication Failed", "You are not allowed to visit this page")
            return
          } else if (response.status === 403) {
            Toast.show({
              type: "error",
              text1: "Access Denied",
              text2: "You don't have permission to access this resource",
            })
            Alert.alert("Access Denied", "You don't have permission to access this resource")
            return
          } else if (response.status === 404) {
            throw new Error("API endpoint not found. Please check the URL.")
          } else {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`)
          }
        }

        const result = await response.json()
        if (result.success) {
          setData(result.data)
          Toast.show({
            type: "success",
            text1: "Data loaded successfully",
          })
        } else {
          throw new Error(result.message || "Failed to fetch data")
        }
      } catch (err) {
        console.error("Error details:", err)
        setError(err.message)
        Toast.show({
          type: "error",
          text1: "Error loading data",
          text2: err.message,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const transformedData = useMemo(() => {
    if (!data) return { departments: [] }

    return {
      departments: data.groups.map((group, groupIndex) => ({
        id: group?.manager?.id || `group-${groupIndex}`,
        name: group.manager?.department,
        location: group.manager?.location,
        manager: {
          id: group.manager?.id,
          name: group.manager?.name,
          email: group.manager?.email,
          role: group.manager?.role,
          employeeCode: group.manager?.employeeCode,
        },
        employees: group.employees.map((employee, empIndex) => ({
          id: employee.id || `emp-${groupIndex}-${empIndex}`,
          name: employee.name,
          email: employee.email,
          position: employee.position,
          employeeCode: employee.employeeCode,
        })),
      })),
    }
  }, [data])

  const allEmployees = useMemo(() => {
    return transformedData.departments.flatMap((dept, deptIndex) =>
      dept.employees.map((emp, empIndex) => ({
        ...emp,
        id: emp.id || `all-emp-${deptIndex}-${empIndex}`,
        department: dept.name,
        location: dept.location,
        manager: dept.manager.name,
      })),
    )
  }, [transformedData])

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDepartment = selectedDepartment === "All Departments" || employee.department === selectedDepartment
      const matchesLocation = selectedLocation === "All Locations" || employee.location === selectedLocation

      return matchesSearch && matchesDepartment && matchesLocation
    })
  }, [allEmployees, searchTerm, selectedDepartment, selectedLocation])

  const isDepartmentHighlighted = (department) => {
    if (!searchTerm) return false

    if (department?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())) return true

    if (department?.employees) {
      return department.employees.some(
        (employee) =>
          employee?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
          employee?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
          employee?.position?.toLowerCase()?.includes(searchTerm.toLowerCase()),
      )
    }

    return false
  }

  const filteredDepartments = useMemo(() => {
    return transformedData.departments.filter((department) => {
      const matchesDepartment = selectedDepartment === "All Departments" || department?.name === selectedDepartment
      const matchesLocation = selectedLocation === "All Locations" || department?.location === selectedLocation
      const matchesSearch = !searchTerm || isDepartmentHighlighted(department)

      return matchesDepartment && matchesLocation && matchesSearch
    })
  }, [transformedData.departments, selectedDepartment, selectedLocation, searchTerm])

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredEmployees, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedDepartment, selectedLocation])

  const toggleDepartmentExpansion = (departmentId) => {
    setExpandedDepartments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(departmentId)) {
        newSet.delete(departmentId)
      } else {
        newSet.add(departmentId)
      }
      return newSet
    })
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    // Re-trigger the useEffect by calling fetchData directly
    const fetchData = async () => {
      try {
        const token = await getToken()
        if (!token) {
          Alert.alert("Authentication Error", "No authentication token found. Please login again.")
          return
        }

        const fullUrl = `${API_BASE_URL}/api/dashboard`
        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "reactnative",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`)
        }

        const result = await response.json()
        if (result.success) {
          setData(result.data)
          Toast.show({
            type: "success",
            text1: "Data loaded successfully",
          })
        } else {
          throw new Error(result.message || "Failed to fetch data")
        }
      } catch (err) {
        console.error("Error details:", err)
        setError(err.message)
        Toast.show({
          type: "error",
          text1: "Error loading data",
          text2: err.message,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }

  const HighlightText = ({ text, searchTerm }) => {
    if (!searchTerm) return <Text>{text}</Text>

    const regex = new RegExp(`(${searchTerm})`, "gi")
    const parts = text?.split(regex)

    return (
      <Text>
        {parts?.map((part, index) =>
          regex.test(part) ? (
            <Text
              key={`highlight-${index}`}
              style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 4, borderRadius: 4, fontWeight: "bold" }}
            >
              {part}
            </Text>
          ) : (
            <Text key={`normal-${index}`}>{part}</Text>
          ),
        )}
      </Text>
    )
  }

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = []
    const maxVisiblePages = 3

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: "#F9FAFB",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}>
          {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of{" "}
          {filteredEmployees.length}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Button
            variant="outline"
            size="xs"
            onPress={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ marginRight: 8 }}
          >
            <ChevronLeft size={16} />
          </Button>

          {pages.map((page) => (
            <Button
              key={`page-${page}`}
              variant={page === currentPage ? "primary" : "outline"}
              size="xs"
              onPress={() => onPageChange(page)}
              style={{ minWidth: 32, marginRight: 8 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: page === currentPage ? "white" : "#374151",
                }}
              >
                {page}
              </Text>
            </Button>
          ))}

          <Button
            variant="outline"
            size="xs"
            onPress={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#EFF6FF",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <View style={{ position: "relative", marginBottom: 24 }}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
          <Text style={{ color: "#6B7280", fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
            Loading dashboard...
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center" }}>
            Please wait while we fetch your data
          </Text>
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FEF2F2",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Card style={{ maxWidth: 400, width: "100%", borderColor: "#FECACA" }}>
          <CardContent style={{ padding: 32, alignItems: "center" }}>
            <View
              style={{
                width: 64,
                height: 64,
                backgroundColor: "#FEE2E2",
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <AlertCircle size={32} color="#DC2626" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827", marginBottom: 12, textAlign: "center" }}>
              Error Loading Data
            </Text>
            <Text style={{ color: "#6B7280", marginBottom: 24, textAlign: "center", fontSize: 16 }}>{error}</Text>
            <Button onPress={handleRetry}>Try Again</Button>
          </CardContent>
        </Card>
      </View>
    )
  }

  const openReportModal = (employeeCode) => {
    setSelectedEmployeeCode(employeeCode)
    setIsModalOpen(true)
  }

  const stats = [
    {
      name: "Departments",
      value: transformedData.departments.length,
      icon: Building2,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      name: "Employees",
      value: allEmployees.length,
      icon: Users,
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      name: "Locations",
      value: [...new Set(transformedData.departments.map((dept) => dept.location))].length,
      icon: MapPin,
      color: "#8B5CF6",
      bgColor: "#F3E8FF",
    },
    {
      name: "Managers",
      value: transformedData.departments.length,
      icon: UserCheck,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
  ]

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#EFF6FF" }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#111827", marginBottom: 8 }}>Roster Management</Text>
          <Text style={{ color: "#6B7280", fontSize: 16 }}>Manage departments and employees efficiently</Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 24 }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <View key={`stat-${stat.name}-${index}`} style={{ width: "48%", marginBottom: 16 }}>
                <Card>
                  <CardContent style={{ padding: 16 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: "#6B7280", marginBottom: 4 }}>
                          {stat.name}
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>{stat.value}</Text>
                      </View>
                      <View
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          backgroundColor: stat.bgColor,
                        }}
                      >
                        <Icon size={20} color={stat.color} />
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </View>
            )
          })}
        </View>

        {/* Search and Filters */}
        <Card style={{ marginBottom: 24 }}>
          <CardContent style={{ padding: 20 }}>
            <View>
              <View style={{ position: "relative", marginBottom: 16 }}>
                <View
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: [{ translateY: -9 }],
                    zIndex: 10,
                  }}
                >
                  <Search size={18} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Search employees, departments, positions..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  style={{
                    width: "100%",
                    paddingLeft: 48,
                    paddingRight: 16,
                    paddingVertical: 16,
                    borderWidth: 2,
                    borderColor: "#D1D5DB",
                    borderRadius: 12,
                    backgroundColor: "#F9FAFB",
                    color: "#111827",
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment} placeholder="Department">
                    <SelectItem value="All Departments">All Departments</SelectItem>
                    {transformedData.departments.map((dept, index) => (
                      <SelectItem key={`dept-select-${dept.id || index}`} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </Select>
                </View>

                <View style={{ flex: 1 }}>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation} placeholder="Location">
                    <SelectItem value="All Locations">All Locations</SelectItem>
                    {[...new Set(transformedData.departments.map((dept) => dept.location))].map((location, index) => (
                      <SelectItem key={`location-select-${location}-${index}`} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </Select>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Tabs */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}
          >
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#F3F4F6",
                padding: 6,
                borderRadius: 12,
              }}
            >
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: activeTab === "departments" ? "white" : "transparent",
                  shadowColor: activeTab === "departments" ? "#000" : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: activeTab === "departments" ? 0.15 : 0,
                  shadowRadius: 4,
                  elevation: activeTab === "departments" ? 4 : 0,
                }}
                onPress={() => setActiveTab("departments")}
              >
                <Building2 size={16} color={activeTab === "departments" ? "#1F2937" : "#6B7280"} />
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: activeTab === "departments" ? "#111827" : "#6B7280",
                    marginLeft: 12,
                  }}
                >
                  Departments ({filteredDepartments.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: activeTab === "employees" ? "white" : "transparent",
                  shadowColor: activeTab === "employees" ? "#000" : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: activeTab === "employees" ? 0.15 : 0,
                  shadowRadius: 4,
                  elevation: activeTab === "employees" ? 4 : 0,
                }}
                onPress={() => setActiveTab("employees")}
              >
                <Users size={16} color={activeTab === "employees" ? "#1F2937" : "#6B7280"} />
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: activeTab === "employees" ? "#111827" : "#6B7280",
                    marginLeft: 12,
                  }}
                >
                  Employees ({filteredEmployees.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Departments Tab */}
          {activeTab === "departments" && (
            <View>
              {filteredDepartments.map((department, deptIndex) => {
                const isExpanded = expandedDepartments.has(department.id)
                const displayEmployees = isExpanded ? department.employees : department.employees.slice(0, 2)

                return (
                  <Card key={`dept-card-${department.id || deptIndex}`} style={{ marginBottom: 20 }}>
                    <CardHeader style={{ paddingBottom: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <CardTitle style={{ fontSize: 18, flex: 1 }}>
                          <HighlightText text={department.name} searchTerm={searchTerm} />
                        </CardTitle>
                        <Badge variant="info" style={{ flexDirection: "row", alignItems: "center" }}>
                          <Users size={12} />
                          <Text style={{ fontSize: 14, fontWeight: "bold", marginLeft: 4 }}>
                            {department.employees.length}
                          </Text>
                        </Badge>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                        <MapPin size={14} color="#6B7280" />
                        <Text style={{ color: "#6B7280", marginLeft: 8, fontSize: 14, fontWeight: "600" }}>
                          <HighlightText text={department.location} searchTerm={searchTerm} />
                        </Text>
                      </View>
                    </CardHeader>

                    <CardContent>
                      {/* Manager Section */}
                      <View
                        style={{
                          backgroundColor: "#EFF6FF",
                          padding: 16,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: "#BFDBFE",
                          marginBottom: 16,
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                              <Star size={14} color="#F59E0B" />
                              <Text style={{ fontWeight: "bold", color: "#111827", fontSize: 16, marginLeft: 8 }}>
                                <HighlightText text={department.manager.name} searchTerm={searchTerm} />
                              </Text>
                            </View>
                            <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}>
                              {department.manager.role}
                            </Text>
                          </View>
                          <Badge variant="info">{department.manager?.employeeCode}</Badge>
                        </View>
                      </View>

                      {/* Employee List */}
                      <View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                          <Users size={14} color="#1F2937" />
                          <Text style={{ fontWeight: "bold", color: "#111827", marginLeft: 8, fontSize: 16 }}>
                            Team Members
                          </Text>
                        </View>

                        {displayEmployees.map((employee, empIndex) => (
                          <View
                            key={`emp-${employee.id || empIndex}`}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: 16,
                              backgroundColor: "#F9FAFB",
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: "#E5E7EB",
                              marginBottom: 12,
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontWeight: "bold", color: "#111827", fontSize: 16, marginBottom: 4 }}>
                                <HighlightText text={employee.name} searchTerm={searchTerm} />
                                <Text style={{ fontSize: 14, color: "#6B7280", marginLeft: 8 }}>
                                  ({employee.employeeCode})
                                </Text>
                              </Text>
                              <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}>
                                <HighlightText text={employee.position} searchTerm={searchTerm} />
                              </Text>
                            </View>
                          </View>
                        ))}

                        {/* Expand/Collapse Button */}
                        {department.employees.length > 2 && (
                          <TouchableOpacity
                            onPress={() => toggleDepartmentExpansion(department.id)}
                            style={{
                              width: "100%",
                              paddingVertical: 12,
                              backgroundColor: "#EFF6FF",
                              borderRadius: 12,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              borderWidth: 1,
                              borderColor: "#BFDBFE",
                            }}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp size={16} color="#2563EB" />
                                <Text style={{ color: "#2563EB", fontWeight: "bold", fontSize: 14, marginLeft: 8 }}>
                                  Show less
                                </Text>
                              </>
                            ) : (
                              <>
                                <ChevronDown size={16} color="#2563EB" />
                                <Text style={{ color: "#2563EB", fontWeight: "bold", fontSize: 14, marginLeft: 8 }}>
                                  +{department.employees.length - 2} more employees
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </CardContent>
                  </Card>
                )
              })}
            </View>
          )}

          {/* Employees Tab */}
          {activeTab === "employees" && (
            <Card>
              <CardHeader>
                <CardTitle style={{ flexDirection: "row", alignItems: "center" }}>
                  <Users size={20} />
                  <Text style={{ marginLeft: 12 }}>Employee Directory ({filteredEmployees.length})</Text>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <View>
                  {paginatedEmployees.map((employee, empIndex) => (
                    <View
                      key={`emp-list-${employee.id || empIndex}`}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 20,
                        borderWidth: 2,
                        borderColor: "#E5E7EB",
                        borderRadius: 16,
                        backgroundColor: "white",
                        marginBottom: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.08,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                          <Text style={{ fontWeight: "bold", fontSize: 18, color: "#111827" }}>
                            <HighlightText text={employee.name} searchTerm={searchTerm} />
                          </Text>
                          <Badge variant="outline" style={{ marginLeft: 12 }}>
                            {employee.employeeCode}
                          </Badge>
                        </View>

                        <Text style={{ color: "#6B7280", marginBottom: 12, fontSize: 16, fontWeight: "500" }}>
                          <HighlightText text={employee.position} searchTerm={searchTerm} />
                        </Text>

                        <View>
                          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                            <Building2 size={12} color="#6B7280" />
                            <Text style={{ fontSize: 14, color: "#6B7280", marginLeft: 8, fontWeight: "500" }}>
                              <HighlightText text={employee.department} searchTerm={searchTerm} />
                            </Text>
                          </View>

                          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                            <MapPin size={12} color="#6B7280" />
                            <Text style={{ fontSize: 14, color: "#6B7280", marginLeft: 8, fontWeight: "500" }}>
                              <HighlightText text={employee.location} searchTerm={searchTerm} />
                            </Text>
                          </View>

                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <UserCheck size={12} color="#6B7280" />
                            <Text style={{ fontSize: 14, color: "#6B7280", marginLeft: 8, fontWeight: "500" }}>
                              Manager: <HighlightText text={employee.manager} searchTerm={searchTerm} />
                            </Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => openReportModal(employee.employeeCode)}
                        style={{
                          backgroundColor: "#2563EB",
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          shadowColor: "#3B82F6",
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 0.25,
                          shadowRadius: 6,
                          elevation: 6,
                        }}
                      >
                        <Download size={14} color="white" />
                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 14, marginLeft: 8 }}>Report</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
              </CardContent>
            </Card>
          )}
        </View>

        <ReportModal isOpen={isModalOpen} employeeCode={selectedEmployeeCode} onClose={() => setIsModalOpen(false)} />
      </View>
    </ScrollView>
  )
}
