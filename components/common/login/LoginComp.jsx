"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { API_BASE_URL } from "../../../config/api";
import {
  setToken,
  getToken,
  saveCredentials,
  getCredentials,
  clearCredentials,
} from "../../../utils/storage";
import { usePermissions } from "../../../context/PermissionContext";

const { width, height } = Dimensions.get("window");

export default function LoginComp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [versionAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  const { fetchAuthData } = usePermissions();

  useEffect(() => {
    const initialize = async () => {
      const token = await getToken();
      if (token) {
        router.replace("/(PortalTab)/portalHome");
      } else {
        const creds = await getCredentials();
        if (creds?.username && creds?.password) {
          setUsername(creds.username);
          setPassword(creds.password);
          setRememberMe(true);
        }
        setChecking(false);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(versionAnim, {
            toValue: 1,
            duration: 800,
            delay: 1000,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };
    initialize();
  }, []);

  const validateForm = () => {
    const newErrors = { username: "", password: "" };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hrms/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "reactnative",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        await setToken(result.token);
         
        await fetchAuthData();
        if (rememberMe) {
          await saveCredentials(username, password);
        } else {
          await clearCredentials();
        }

        router.replace("/(PortalTab)/portalHome");
      } else {
        setErrors({
          username: "",
          password: result.message || "Invalid credentials",
        });
      }
    } catch (error) {
      setErrors({
        username: "",
        password: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <View className="flex-1 bg-orange-400 justify-center items-center">
        <View className="bg-white p-6 rounded-3xl shadow-2xl border border-orange-100">
          <ActivityIndicator size="large" color="#fb923c" />
          <Text className="text-orange-600 mt-3 text-base font-semibold">Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-orange-400">
          {/* Background Decorations */}
          <View className="absolute top-0 left-0 right-0 h-64 bg-orange-500 opacity-60" />
          <View className="absolute top-0 left-0 right-0 h-32 bg-orange-600 opacity-30" />
          <View className="absolute top-16 left-8 w-20 h-20 bg-orange-300 rounded-2xl opacity-40 shadow-xl" />
          <View className="absolute top-32 right-12 w-16 h-16 bg-orange-500 rounded-full opacity-30 shadow-lg" />
          <View className="absolute top-48 left-16 w-12 h-12 bg-orange-300 rounded-xl opacity-50 shadow-md" />
          <View className="absolute bottom-32 right-8 w-14 h-14 bg-orange-500 rounded-2xl opacity-25 shadow-lg" />

          <ScrollView
            className="px-8 py-8"
            contentContainerStyle={{ flexGrow: 1 }}
            contentContainerClassName="justify-center"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              className="flex-1 justify-center"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              }}
            >
              {/* Logo & Welcome */}
              <View className="items-center mb-8">
                <View className="relative mb-4">
                  <View className="absolute top-2 left-2 w-16 h-16 bg-orange-600 rounded-3xl opacity-40" />
                  <View className="w-16 h-16 bg-white rounded-3xl items-center justify-center shadow-2xl">
                    <Text className="text-2xl font-black text-orange-400">G</Text>
                  </View>
                </View>
                <Text className="text-3xl font-black text-white tracking-wide mb-1 shadow-lg">GIGANTIC</Text>
                <Text className="text-orange-100 text-sm font-medium">Welcome Back</Text>
              </View>

              {/* Login Card */}
              <View className="relative">
                <View className="absolute top-3 left-3 right-3 bottom-3 bg-orange-600 rounded-3xl opacity-20" />
                <View className="absolute top-2 left-2 right-2 bottom-2 bg-orange-500 rounded-3xl opacity-30" />
                <View className="bg-white rounded-3xl p-6 shadow-2xl border border-orange-100">
                  <View className="items-center mb-6">
                    <View className="relative mb-3">
                      <View className="absolute top-1 left-1 w-12 h-12 bg-orange-200 rounded-2xl opacity-50" />
                      <View className="w-12 h-12 bg-orange-400 rounded-2xl items-center justify-center shadow-lg">
                        <Feather name="log-in" size={20} color="#fff" />
                      </View>
                    </View>
                    <Text className="text-xl font-bold text-gray-800">Sign In</Text>
                  </View>

                  {/* Username */}
                  <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2 ml-1 text-sm">Username</Text>
                    <View className="relative">
                      <TextInput
                        className={`border-2 p-3 rounded-xl bg-white text-gray-800 font-medium pl-10 text-sm relative z-10 shadow-sm ${
                          errors.username ? "border-red-400" : "border-orange-300"
                        }`}
                        placeholder="Enter username"
                        placeholderTextColor="#9CA3AF"
                        value={username}
                        onChangeText={(text) => {
                          setUsername(text);
                          if (errors.username) setErrors({ ...errors, username: "" });
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <View className="absolute left-3 top-3 w-5 h-5 bg-orange-400 rounded-lg items-center justify-center z-20 shadow-sm">
                        <Feather name="user" size={12} color="#fff" />
                      </View>
                    </View>
                    {errors.username ? (
                      <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.username}</Text>
                    ) : null}
                  </View>

                  {/* Password */}
                  <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2 ml-1 text-sm">Password</Text>
                    <View className="relative">
                      <TextInput
                        className={`border-2 p-3 rounded-xl bg-white text-gray-800 font-medium pl-10 pr-10 text-sm relative z-10 shadow-sm ${
                          errors.password ? "border-red-400" : "border-orange-300"
                        }`}
                        placeholder="Enter password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <View className="absolute left-3 top-3 w-5 h-5 bg-orange-400 rounded-lg items-center justify-center z-20 shadow-sm">
                        <Feather name="lock" size={12} color="#fff" />
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 w-5 h-5 items-center justify-center z-20"
                      >
                        <Feather name={showPassword ? "eye-off" : "eye"} size={14} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                    {errors.password ? (
                      <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password}</Text>
                    ) : null}
                  </View>

                  {/* Remember + Forgot */}
                  <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} className="flex-row items-center">
                      <View
                        className={`w-5 h-5 mr-2 rounded-lg border-2 items-center justify-center shadow-sm ${
                          rememberMe ? "bg-orange-400 border-orange-400" : "border-gray-300 bg-white"
                        }`}
                      >
                        {rememberMe && <Feather name="check" size={10} color="#fff" />}
                      </View>
                      <Text className="text-gray-600 font-medium text-xs">Remember me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                      <Text className="text-orange-500 font-semibold text-xs">Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Login Button */}
                  <View className="relative">
                    <TouchableOpacity
                      className={`bg-orange-400 p-4 rounded-xl relative z-10 border border-orange-300 shadow-xl ${
                        loading ? "opacity-80" : ""
                      }`}
                      onPress={handleLogin}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      {loading ? (
                        <View className="flex-row items-center justify-center">
                          <ActivityIndicator color="#fff" size="small" />
                          <Text className="text-white text-base font-bold ml-2">Signing In...</Text>
                        </View>
                      ) : (
                        <Text className="text-white text-center text-base font-bold">Sign In</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Version Info */}
              <Animated.View
                style={{
                  opacity: versionAnim,
                  transform: [
                    {
                      translateY: versionAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
                className="items-center mt-6"
              >
                <View className=" bg-opacity-20 px-4 py-2 mt-8 rounded-full">
                  <Text className="text-white text-xs font-semibold tracking-wide">Version 1.0</Text>
                </View>
              </Animated.View>
            </Animated.View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
