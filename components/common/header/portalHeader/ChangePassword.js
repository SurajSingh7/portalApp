"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { API_BASE_URL } from "../../../../config/api"
import { getToken, clearToken } from "../../../../utils/storage"
import { Eye, EyeOff, Lock, Shield, AlertCircle, CheckCircle, XCircle } from "lucide-react-native"

const ChangePasswordScreen = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  })

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
    if (name === "newPassword") {
      setPasswordStrength({
        length: value.length >= 8,
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
      })
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long"
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Include at least one uppercase letter"
    } else if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Include at least one lowercase letter"
    } else if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = "Include at least one number"
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.newPassword)) {
      newErrors.newPassword = "Include at least one special character"
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    setSuccessMessage("")
    if (!validateForm()) return
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) throw new Error("No token found")
      const res = await fetch(`${API_BASE_URL}/hrms/updatePassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          password: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      })
      const result = await res.json()
      if (res.ok) {
        setSuccessMessage("Password changed successfully!")
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setPasswordStrength({
          length: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          hasSpecial: false,
        })
        await clearToken()
        router.replace("/")
      } else {
        setErrors({ form: result.message || "Failed to change password." })
      }
    } catch (err) {
      setErrors({ form: "An error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Clean White Header */}
      <View className="bg-white px-4 pt-3 pb-6 rounded-b-3xl shadow-sm">
        <View className="items-center">
          {/* Orange Icon Container */}
          <View className="bg-orange-100 rounded-full p-4 mb-3 shadow-sm">
            <Shield size={28} color="#EA580C" />
          </View>

          {/* Title Section */}
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-800 mb-1">Change Password</Text>
            <View className="w-12 h-0.5 bg-orange-400 rounded-full mb-2" />
            <Text className="text-gray-600 text-center text-sm px-4">Secure your account with a new password</Text>
          </View>
        </View>
      </View>

      <View className="px-4 py-4">
        {/* Success Message */}
        {successMessage ? (
          <View className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-3 mb-4">
            <View className="flex-row items-center">
              <View className="bg-green-100 rounded-full p-1.5 mr-2">
                <CheckCircle size={14} color="#16A34A" />
              </View>
              <Text className="text-green-700 font-medium text-sm flex-1">{successMessage}</Text>
            </View>
          </View>
        ) : null}

        {/* Error Message */}
        {errors.form ? (
          <View className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-3 mb-4">
            <View className="flex-row items-center">
              <View className="bg-red-100 rounded-full p-1.5 mr-2">
                <XCircle size={14} color="#DC2626" />
              </View>
              <Text className="text-red-700 font-medium text-sm flex-1">{errors.form}</Text>
            </View>
          </View>
        ) : null}

        {/* Current Password */}
        <View className="mb-4">
          <Text className="text-sm font-bold text-gray-800 mb-2">Current Password</Text>
          <View
            className={`flex-row items-center bg-white border ${errors.currentPassword ? "border-red-300" : "border-orange-200"} rounded-xl px-3 py-2 shadow-sm`}
          >
            <View className="bg-orange-100 rounded-full p-1.5 mr-2">
              <Lock size={14} color="#EA580C" />
            </View>
            <TextInput
              placeholder="Enter current password"
              placeholderTextColor="#9CA3AF"
              value={formData.currentPassword}
              onChangeText={(text) => handleChange("currentPassword", text)}
              secureTextEntry={!showCurrentPassword}
              className="flex-1 text-gray-800 text-sm"
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              className="bg-gray-100 rounded-full p-1.5"
            >
              {showCurrentPassword ? <EyeOff size={16} color="#6B7280" /> : <Eye size={16} color="#6B7280" />}
            </TouchableOpacity>
          </View>
          {errors.currentPassword && (
            <View className="flex-row items-center mt-1 ml-1">
              <XCircle size={12} color="#DC2626" />
              <Text className="text-red-500 text-xs ml-1">{errors.currentPassword}</Text>
            </View>
          )}
        </View>

        {/* New Password */}
        <View className="mb-4">
          <Text className="text-sm font-bold text-gray-800 mb-2">New Password</Text>
          <View
            className={`flex-row items-center bg-white border ${errors.newPassword ? "border-red-300" : "border-orange-200"} rounded-xl px-3 py-2 shadow-sm`}
          >
            <View className="bg-orange-100 rounded-full p-1.5 mr-2">
              <Lock size={14} color="#EA580C" />
            </View>
            <TextInput
              placeholder="Create new password"
              placeholderTextColor="#9CA3AF"
              value={formData.newPassword}
              onChangeText={(text) => handleChange("newPassword", text)}
              secureTextEntry={!showNewPassword}
              className="flex-1 text-gray-800 text-sm"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              className="bg-gray-100 rounded-full p-1.5"
            >
              {showNewPassword ? <EyeOff size={16} color="#6B7280" /> : <Eye size={16} color="#6B7280" />}
            </TouchableOpacity>
          </View>
          {errors.newPassword && (
            <View className="flex-row items-center mt-1 ml-1">
              <XCircle size={12} color="#DC2626" />
              <Text className="text-red-500 text-xs ml-1">{errors.newPassword}</Text>
            </View>
          )}

          {/* Compact Password Requirements */}
          <View className="mt-3 bg-orange-50 rounded-xl p-3 border border-orange-100 shadow-sm">
            <Text className="text-xs font-bold text-gray-700 mb-2">Password Requirements:</Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { label: "8+ chars", key: "length" },
                { label: "Upper", key: "hasUppercase" },
                { label: "Lower", key: "hasLowercase" },
                { label: "Number", key: "hasNumber" },
                { label: "Symbol", key: "hasSpecial" },
              ].map((rule) => (
                <View key={rule.key} className="flex-row items-center">
                  <View
                    className={`rounded-full p-0.5 mr-1 ${passwordStrength[rule.key] ? "bg-green-100" : "bg-gray-200"}`}
                  >
                    {passwordStrength[rule.key] ? (
                      <CheckCircle size={10} color="#16A34A" />
                    ) : (
                      <XCircle size={10} color="#9CA3AF" />
                    )}
                  </View>
                  <Text className={`text-xs ${passwordStrength[rule.key] ? "text-green-700" : "text-gray-600"}`}>
                    {rule.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Confirm Password */}
        <View className="mb-5">
          <Text className="text-sm font-bold text-gray-800 mb-2">Confirm Password</Text>
          <View
            className={`flex-row items-center bg-white border ${errors.confirmPassword ? "border-red-300" : "border-orange-200"} rounded-xl px-3 py-2 shadow-sm`}
          >
            <View className="bg-orange-100 rounded-full p-1.5 mr-2">
              <Lock size={14} color="#EA580C" />
            </View>
            <TextInput
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
              secureTextEntry={!showConfirmPassword}
              className="flex-1 text-gray-800 text-sm"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              className="bg-gray-100 rounded-full p-1.5"
            >
              {showConfirmPassword ? <EyeOff size={16} color="#6B7280" /> : <Eye size={16} color="#6B7280" />}
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <View className="flex-row items-center mt-1 ml-1">
              <XCircle size={12} color="#DC2626" />
              <Text className="text-red-500 text-xs ml-1">{errors.confirmPassword}</Text>
            </View>
          )}
        </View>

        {/* Compact Submit Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleSubmit}
          className={`bg-orange-500 rounded-xl py-3 items-center shadow-sm ${loading ? "opacity-70" : "active:bg-orange-600"}`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#fff" size="small" />
              <Text className="text-white font-bold text-sm ml-2">Updating...</Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Shield size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm ml-2">Change Password</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Compact Security Notice */}
        <View className="mt-4 bg-amber-50 rounded-xl p-3 border border-amber-200 shadow-sm">
          <View className="flex-row items-center">
            <View className="bg-amber-100 rounded-full p-1.5 mr-2">
              <AlertCircle size={12} color="#F59E0B" />
            </View>
            <Text className="text-amber-700 text-xs flex-1">
              You'll be logged out after changing password for security.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default ChangePasswordScreen
