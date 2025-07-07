"use client"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  Easing,
} from "react-native"
import { useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { API_BASE_URL } from "../../../config/api"
import { setToken, getToken, saveCredentials, getCredentials, clearCredentials } from "../../../utils/storage"
import { usePermissions } from "../../../context/PermissionContext"
import logo from "../../../assets/images/logonetra.png"

const { width, height } = Dimensions.get("window")

export default function LoginComp() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ username: "", password: "" })
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(30))
  const [scaleAnim] = useState(new Animated.Value(0.9))
  const [versionAnim] = useState(new Animated.Value(0))
  const [pulseAnim] = useState(new Animated.Value(1))
  const [shimmerAnim] = useState(new Animated.Value(0))
  const [glowAnim] = useState(new Animated.Value(0))
  const rotateAnim = useState(new Animated.Value(0))[0]

  const router = useRouter()
  const { fetchAuthData } = usePermissions()

  useEffect(() => {
    const initialize = async () => {
      const token = await getToken()
      if (token) {
        router.replace("/(PortalTab)/portalHome")
      } else {
        const creds = await getCredentials()
        if (creds?.username && creds?.password) {
          setUsername(creds.username)
          setPassword(creds.password)
          setRememberMe(true)
        }
        setChecking(false)

        // Entrance animations
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
        ]).start()

        // Start orbit rotation
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 20000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ).start()

        // Pulse animation for logo
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start()

        // Shimmer effect
        Animated.loop(
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ).start()

        // Glow effect
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start()
      }
    }
    initialize()
  }, [])

  const validateForm = () => {
    const newErrors = { username: "", password: "" }
    let isValid = true

    if (!username.trim()) {
      newErrors.username = "Username is required"
      isValid = false
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
      isValid = false
    }

    if (!password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/hrms/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "reactnative",
        },
        body: JSON.stringify({ username, password }),
      })

      const result = await res.json()

      if (res.ok && result.success) {
        await setToken(result.token)
        await fetchAuthData()

        if (rememberMe) {
          await saveCredentials(username, password)
        } else {
          await clearCredentials()
        }

        router.replace("/(PortalTab)/portalHome")
      } else {
        setErrors({
          username: "",
          password: result.message || "Invalid credentials",
        })
      }
    } catch (error) {
      setErrors({
        username: "",
        password: "Network error. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <View
          className="bg-gray-900 p-8 rounded-3xl border border-gray-800"
          style={{
            shadowColor: "#00D4FF",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text className="text-gray-100 mt-4 text-lg font-semibold text-center">Initializing...</Text>
        </View>
      </View>
    )
  }

  const orbitData = [
    { label: "HRMS", icon: "users", color: "#00D4FF", angle: 0 },
    { label: "Stock", icon: "package", color: "#10B981", angle: 60 },
    { label: "Sales", icon: "trending-up", color: "#F59E0B", angle: 120 },
    { label: "NOC", icon: "shield", color: "#EF4444", angle: 180 },
    { label: "CRM", icon: "heart", color: "#8B5CF6", angle: 240 },
    { label: "Network", icon: "wifi", color: "#06B6D4", angle: 300 },
  ]

  const orbitRadius = 80

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-1 bg-black">
          {/* Animated Background Elements */}
          <Animated.View
            className="absolute top-10 right-10 w-20 h-20 rounded-full opacity-20"
            style={{
              backgroundColor: "#00D4FF",
              transform: [
                {
                  scale: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.3, 1],
                  }),
                },
              ],
              opacity: shimmerAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.1, 0.3, 0.1],
              }),
            }}
          />
          <Animated.View
            className="absolute bottom-32 left-8 w-16 h-16 rounded-full opacity-15"
            style={{
              backgroundColor: "#8B5CF6",
              transform: [
                {
                  scale: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1.2, 1, 1.2],
                  }),
                },
              ],
            }}
          />
          <Animated.View
            className="absolute top-1/3 left-1/4 w-12 h-12 rounded-full opacity-10"
            style={{
              backgroundColor: "#10B981",
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.4],
                  }),
                },
              ],
            }}
          />

          {/* Subtle grid pattern overlay */}
          <View
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />

          <Animated.View
            className="flex-1 justify-between px-6 py-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
          >
            {/* Top Section - Logo with Orbit */}
            <View className="flex-1 justify-center items-center">
              <View
                style={{
                  position: "relative",
                  width: 200,
                  height: 200,
                  marginBottom: 20,
                }}
              >
                {/* Enhanced Connection Lines with Neon Glow */}
                {orbitData.map((item, index) => {
                  const angle = item.angle * (Math.PI / 180)
                  const x = orbitRadius * Math.cos(angle)
                  const y = orbitRadius * Math.sin(angle)
                  return (
                    <View key={`line-${index}`}>
                      {/* Neon glowing line to center */}
                      <Animated.View
                        style={{
                          position: "absolute",
                          left: 100,
                          top: 100,
                          width: Math.sqrt(x * x + y * y),
                          height: 2,
                          backgroundColor: item.color,
                          transformOrigin: "0 50%",
                          transform: [{ rotate: `${item.angle}deg` }],
                          shadowColor: item.color,
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 6,
                          opacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 0.7],
                          }),
                        }}
                      />
                      {/* Connection lines between adjacent nodes */}
                      {index < orbitData.length - 1 && (
                        <View
                          style={{
                            position: "absolute",
                            left: 100 + x,
                            top: 100 + y,
                            width: 50,
                            height: 1,
                            backgroundColor: "#333333",
                            opacity: 0.4,
                            transformOrigin: "0 50%",
                            transform: [{ rotate: `${item.angle + 60}deg` }],
                          }}
                        />
                      )}
                    </View>
                  )
                })}

                {/* Orbiting Service Icons with Neon Effects */}
                <Animated.View
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    transform: [
                      {
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  }}
                >
                  {orbitData.map((item, index) => {
                    const angle = item.angle * (Math.PI / 180)
                    const x = orbitRadius * Math.cos(angle)
                    const y = orbitRadius * Math.sin(angle)
                    return (
                      <Animated.View
                        key={index}
                        style={{
                          position: "absolute",
                          left: 100 + x - 25,
                          top: 100 + y - 25,
                          width: 50,
                          height: 50,
                          backgroundColor: item.color,
                          borderRadius: 25,
                          alignItems: "center",
                          justifyContent: "center",
                          shadowColor: item.color,
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.6,
                          shadowRadius: 15,
                          elevation: 15,
                          borderWidth: 2,
                          borderColor: "rgba(255, 255, 255, 0.1)",
                          transform: [
                            {
                              rotate: rotateAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0deg", "-360deg"],
                              }),
                            },
                          ],
                        }}
                      >
                        <Feather name={item.icon} size={16} color="#fff" />
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 8,
                            fontWeight: "700",
                            marginTop: 2,
                            textAlign: "center",
                            textShadowColor: "rgba(0, 0, 0, 0.8)",
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 3,
                          }}
                        >
                          {item.label}
                        </Text>
                      </Animated.View>
                    )
                  })}
                </Animated.View>

                {/* Enhanced Central Logo with Neon Ring */}
                <Animated.View
                  style={{
                    position: "absolute",
                    left: 50,
                    top: 50,
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: "#1A1A1A",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#00D4FF",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 25,
                    elevation: 25,
                    borderWidth: 3,
                    borderColor: "#00D4FF",
                    transform: [{ scale: pulseAnim }],
                  }}
                >
                  {/* Animated neon ring */}
                  <Animated.View
                    style={{
                      position: "absolute",
                      width: 110,
                      height: 110,
                      borderRadius: 55,
                      borderWidth: 2,
                      borderColor: "#00D4FF",
                      opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.8],
                      }),
                    }}
                  />
                  {/* Inner glow ring */}
                  <View
                    style={{
                      position: "absolute",
                      width: 92,
                      height: 92,
                      borderRadius: 46,
                      borderWidth: 1,
                      borderColor: "rgba(0, 212, 255, 0.3)",
                    }}
                  />
                  <Image source={logo} style={{ width: 80, height: 80 }} resizeMode="contain" />
                </Animated.View>
              </View>

              <Text className="text-gray-100 text-lg text-center mt-4 font-medium">
                Access your enterprise dashboard
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1 opacity-80">Secure • Reliable • Efficient</Text>
            </View>

            {/* Enhanced Login Form with Dark Theme */}
            <View
              className="bg-gray-900 rounded-3xl p-6 border border-gray-800"
              style={{
                shadowColor: "#00D4FF",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.2,
                shadowRadius: 24,
                elevation: 24,
              }}
            >
              {/* Header with enhanced styling */}
              <View className="items-center mb-6">
                <View
                  className="bg-gray-800 p-4 rounded-full mb-4 border border-gray-700"
                  style={{
                    shadowColor: "#00D4FF",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 8,
                  }}
                >
                  <Feather name="log-in" size={24} color="#00D4FF" />
                </View>
                <Text className="text-gray-300 text-base font-medium">Enter your credentials to continue</Text>
              </View>

              {/* Enhanced Username Field */}
              <View className="mb-4">
                <View className="relative">
                  <View className="absolute left-4 top-4 z-10">
                    <Feather name="user" size={18} color="#00D4FF" />
                  </View>
                  <TextInput
                    className={`border bg-gray-800 p-4 pl-12 rounded-xl text-gray-100 placeholder-gray-500 text-base font-medium ${
                      errors.username ? "border-red-400" : "border-gray-700"
                    }`}
                    placeholder="Username"
                    placeholderTextColor="#6B7280"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text)
                      if (errors.username) setErrors({ ...errors, username: "" })
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      shadowColor: errors.username ? "#EF4444" : "#00D4FF",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  />
                </View>
                {errors.username && (
                  <Text className="text-red-400 text-sm mt-2 ml-1 font-medium">{errors.username}</Text>
                )}
              </View>

              {/* Enhanced Password Field */}
              <View className="mb-6">
                <View className="relative">
                  <View className="absolute left-4 top-4 z-10">
                    <Feather name="lock" size={18} color="#00D4FF" />
                  </View>
                  <TextInput
                    className={`border bg-gray-800 p-4 pl-12 pr-12 rounded-xl text-gray-100 placeholder-gray-500 text-base font-medium ${
                      errors.password ? "border-red-400" : "border-gray-700"
                    }`}
                    placeholder="Password"
                    placeholderTextColor="#6B7280"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text)
                      if (errors.password) setErrors({ ...errors, password: "" })
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      shadowColor: errors.password ? "#EF4444" : "#00D4FF",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4"
                    activeOpacity={0.7}
                  >
                    <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#00D4FF" />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="text-red-400 text-sm mt-2 ml-1 font-medium">{errors.password}</Text>
                )}
              </View>

              {/* Enhanced Remember Me + Forgot Password */}
              <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  className="flex-row items-center"
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-5 h-5 mr-3 rounded border-2 items-center justify-center ${
                      rememberMe ? "bg-blue-500 border-blue-500" : "border-gray-600 bg-gray-800"
                    }`}
                    style={{
                      shadowColor: rememberMe ? "#00D4FF" : "transparent",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                      elevation: rememberMe ? 4 : 0,
                    }}
                  >
                    {rememberMe && <Feather name="check" size={12} color="#fff" />}
                  </View>
                  <Text className="text-gray-300 text-sm font-medium">Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/forgot-password")} activeOpacity={0.7}>
                  <Text className="text-blue-400 text-sm font-semibold">Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Enhanced Login Button with Neon Effect */}
              <TouchableOpacity
                className={`bg-blue-600 p-4 rounded-xl ${loading ? "opacity-80" : ""}`}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#00D4FF",
                  shadowColor: "#00D4FF",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 15,
                  elevation: 15,
                }}
              >
                {loading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="#000" size="small" />
                    <Text className="text-black ml-3 font-bold text-base">Signing in...</Text>
                  </View>
                ) : (
                  <Text className="text-black text-center font-bold text-base tracking-wide">Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Enhanced Version Info */}
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
              className="items-center mt-4"
            >
              <View className="bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
                <Text className="text-gray-400 text-xs font-semibold">Version 1.0</Text>
              </View>
            </Animated.View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </>
  )
}
