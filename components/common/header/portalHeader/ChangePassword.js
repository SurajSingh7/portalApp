import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../../../config/api";
import { getToken, clearToken } from "../../../../utils/storage";
import {
  Eye,
  EyeOff,
  Lock,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react-native";

const ChangePasswordScreen = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });

    if (name === "newPassword") {
      setPasswordStrength({
        length: value.length >= 8,
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
      });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Include at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Include at least one lowercase letter";
    } else if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = "Include at least one number";
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.newPassword)) {
      newErrors.newPassword = "Include at least one special character";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSuccessMessage("");
    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("No token found");

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
      });

      const result = await res.json();

      if (res.ok) {
        setSuccessMessage("Password changed successfully!");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordStrength({
          length: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          hasSpecial: false,
        });
        await clearToken();
        router.replace("/"); // log user out
      } else {
        setErrors({ form: result.message || "Failed to change password." });
      }
    } catch (err) {
      setErrors({ form: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 py-8">
      <View className="items-center mb-6">
        <View className="bg-blue-100 rounded-full p-4 mb-3">
          <Shield size={32} color="#2563EB" />
        </View>
        <Text className="text-2xl font-bold text-gray-800">Change Password</Text>
        <Text className="text-gray-500 mt-1">
          Update your password to keep your account secure
        </Text>
      </View>

      {successMessage ? (
        <View className="bg-green-100 border border-green-300 rounded-lg p-3 mb-4">
          <Text className="text-green-700 text-center">{successMessage}</Text>
        </View>
      ) : null}

      {errors.form ? (
        <View className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
          <Text className="text-red-700 text-center">{errors.form}</Text>
        </View>
      ) : null}

      {/* Current Password */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">
          Current Password
        </Text>
        <View className="flex-row items-center border rounded-lg px-3">
          <Lock size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Enter your current password"
            value={formData.currentPassword}
            onChangeText={(text) => handleChange("currentPassword", text)}
            secureTextEntry={!showCurrentPassword}
            className="flex-1 ml-2 py-2 text-gray-800"
          />
          <TouchableOpacity
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? (
              <EyeOff size={18} color="#9CA3AF" />
            ) : (
              <Eye size={18} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>
        {errors.currentPassword && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.currentPassword}
          </Text>
        )}
      </View>

      {/* New Password */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">
          New Password
        </Text>
        <View className="flex-row items-center border rounded-lg px-3">
          <Lock size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Create a new password"
            value={formData.newPassword}
            onChangeText={(text) => handleChange("newPassword", text)}
            secureTextEntry={!showNewPassword}
            className="flex-1 ml-2 py-2 text-gray-800"
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff size={18} color="#9CA3AF" />
            ) : (
              <Eye size={18} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>
        {errors.newPassword && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.newPassword}
          </Text>
        )}

        {/* Password Requirements Checklist */}
        <View className="mt-2">
          <Text className="text-xs font-medium text-gray-600 mb-1">
            Password must include:
          </Text>
          <View className="space-y-1 flex-row flex-wrap gap-3">
            {[
              {
                label: "8+ chars",
                key: "length",
              },
              {
                label: "Uppercase",
                key: "hasUppercase",
              },
              {
                label: "Lowercase",
                key: "hasLowercase",
              },
              {
                label: "Number",
                key: "hasNumber",
              },
              {
                label: "Symbol(!@#$...)",
                key: "hasSpecial",
              },
            ].map((rule) => (
              <View key={rule.key} className="flex-row items-center">
                {passwordStrength[rule.key] ? (
                  <CheckCircle size={14} color="#16A34A" />
                ) : (
                  <XCircle size={14} color="#DC2626" />
                )}
                <Text
                  className={`ml-2 text-xs font-bold ${
                    passwordStrength[rule.key] ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {rule.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Confirm Password */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </Text>
        <View className="flex-row items-center border rounded-lg px-3">
          <Lock size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
            secureTextEntry={!showConfirmPassword}
            className="flex-1 ml-2 py-2 text-gray-800"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={18} color="#9CA3AF" />
            ) : (
              <Eye size={18} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.confirmPassword}
          </Text>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        disabled={loading}
        onPress={handleSubmit}
        className={`bg-blue-600 rounded-lg py-3 items-center ${
          loading ? "opacity-50" : "active:opacity-80"
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">Change Password</Text>
        )}
      </TouchableOpacity>

      <View className="mt-6 flex-row justify-center items-center">
        <AlertCircle size={14} color="#9CA3AF" />
        <Text className="text-xs text-gray-500 ml-1">
          For security, you'll be logged out after changing password.
        </Text>
      </View>
    </ScrollView>
  );
};

export default ChangePasswordScreen;
