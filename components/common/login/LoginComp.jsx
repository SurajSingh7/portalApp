"use client"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  Easing,
  SafeAreaView,
} from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { useRouter } from "expo-router"
import { useCallback } from "react"
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
  const rotateAnim = useState(new Animated.Value(0))[0]

  const router = useRouter()
  const { fetchAuthData } = usePermissions()

  // Force status bar configuration
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#FFFFFF', true)
        StatusBar.setBarStyle('dark-content', true)
        StatusBar.setTranslucent(false)
      } else {
        StatusBar.setBarStyle('dark-content', true)
      }
    }, [])
  )

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
      <>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#FFFFFF"
          translucent={false}
        />
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <View 
            style={{ 
              flex: 1, 
              backgroundColor: "#FFFFFF",
              paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
            }}
          >
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: "#FFF7ED" }}>
              <View
                className="bg-white p-8 rounded-3xl shadow-2xl border border-orange-100"
                style={{
                  shadowColor: "#FB923C",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  elevation: 20,
                }}
              >
                <ActivityIndicator size="large" color="#FB923C" />
                <Text className="text-orange-600 mt-4 text-lg font-semibold text-center">Initializing...</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </>
    )
  }

  const orbitData = [
    { label: "HRMS", icon: "users", color: "#FB923C", angle: 0 },
    { label: "Stock", icon: "package", color: "#10B981", angle: 60 },
    { label: "Sales", icon: "trending-up", color: "#F59E0B", angle: 120 },
    { label: "NOC", icon: "shield", color: "#EF4444", angle: 180 },
    { label: "CRM", icon: "heart", color: "#8B5CF6", angle: 240 },
    { label: "Network", icon: "wifi", color: "#06B6D4", angle: 300 },
  ]

  const orbitRadius = 90

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <View 
          style={{ 
            flex: 1, 
            backgroundColor: "#FFFFFF",
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
          }}
        >
          <KeyboardAwareScrollView
            style={{ flex: 1, backgroundColor: "#FFF7ED" }}
            contentContainerStyle={{ 
              flexGrow: 1, 
              justifyContent: "space-between", 
              paddingBottom: Platform.OS === "ios" ? 20 : 0 
            }}
            enableOnAndroid={true}
            extraScrollHeight={Platform.OS === "ios" ? 0 : 20}
            enableAutomaticScroll={true}
          >
        {/* Background Gradient Overlay */}
        <View
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)",
          }}
        />

        {/* Animated Background Elements */}
        <Animated.View
          className="absolute top-10 right-10 w-20 h-20 rounded-full bg-orange-200 opacity-30"
          style={{
            transform: [
              {
                scale: shimmerAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.2, 1],
                }),
              },
            ],
          }}
        />
        <Animated.View
          className="absolute bottom-32 left-8 w-16 h-16 rounded-full bg-orange-300 opacity-20"
          style={{
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
                marginBottom: 80,
              }}
            >
              {/* Enhanced Connection Lines with Glow */}
              {orbitData.map((item, index) => {
                const angle = item.angle * (Math.PI / 180)
                const x = orbitRadius * Math.cos(angle)
                const y = orbitRadius * Math.sin(angle)
                return (
                  <View key={`line-${index}`}>
                    {/* Glowing line to center */}
                    <View
                      style={{
                        position: "absolute",
                        left: 100,
                        top: 100,
                        width: Math.sqrt(x * x + y * y),
                        height: 3,
                        backgroundColor: "#FB923C",
                        opacity: 0.3,
                        transformOrigin: "0 50%",
                        transform: [{ rotate: `${item.angle}deg` }],
                        shadowColor: "#FB923C",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 4,
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
                          height: 2,
                          backgroundColor: "#FDBA74",
                          opacity: 0.4,
                          transformOrigin: "0 50%",
                          transform: [{ rotate: `${item.angle + 60}deg` }],
                        }}
                      />
                    )}
                  </View>
                )
              })}

              {/* Orbiting Service Icons with Enhanced Styling */}
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
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                        borderWidth: 2,
                        borderColor: "rgba(255, 255, 255, 0.3)",
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
                          textShadowColor: "rgba(0, 0, 0, 0.3)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      >
                        {item.label}
                      </Text>
                    </Animated.View>
                  )
                })}
              </Animated.View>

              {/* Enhanced Central Logo */}
              <Animated.View
                style={{
                  position: "absolute",
                  left: 50,
                  top: 50,
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "#1F2937",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#FB923C",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 20,
                  borderWidth: 4,
                  borderColor: "#FB923C",
                  transform: [{ scale: pulseAnim }],
                }}
              >
                {/* Inner glow ring */}
                <View
                  style={{
                    position: "absolute",
                    width: 92,
                    height: 92,
                    borderRadius: 46,
                    borderWidth: 2,
                    borderColor: "rgba(251, 146, 60, 0.3)",
                  }}
                />
                <Image source={logo} style={{ width: 80, height: 80 }} resizeMode="contain" />
              </Animated.View>
            </View>

            <Text className="text-orange-700 text-lg text-center -mt-16 font-medium">
              Access your enterprise dashboard
            </Text>
            <Text className="text-orange-500 text-sm text-center mt-1 opacity-80">Secure • Reliable • Efficient</Text>
          </View>

          {/* Enhanced Login Form */}
          <View
            className="bg-white rounded-3xl p-6 border border-orange-100"
            style={{
              shadowColor: "#FB923C",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 24,
            }}
          >
            {/* Header with enhanced styling */}
            <View className="items-center mb-6 ">
              <View
                className="bg-orange-50 p-2 rounded-full mt-2 border border-orange-100"
                style={{
                  shadowColor: "#FB923C",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Feather  name="log-in" size={24} color="#FB923C" />
              </View>
              <Text className="text-orange-600 text-base font-medium">Enter your credentials to continue</Text>
            </View>

            {/* Enhanced Username Field */}
            <View className="mb-4">
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Feather name="user" size={18} color="#FB923C" />
                </View>
                <TextInput
                  className={`border bg-orange-50 p-4 pl-12 rounded-xl text-gray-900 placeholder-orange-400 text-base font-medium ${
                    errors.username ? "border-red-400" : "border-orange-200"
                  }`}
                  placeholder="Username"
                  placeholderTextColor="#FB923C"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text)
                    if (errors.username) setErrors({ ...errors, username: "" })
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    shadowColor: errors.username ? "#EF4444" : "#FB923C",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                />
              </View>
              {errors.username && (
                <Text className="text-red-500 text-sm mt-2 ml-1 font-medium">{errors.username}</Text>
              )}
            </View>

            {/* Enhanced Password Field */}
            <View className="mb-6">
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Feather name="lock" size={18} color="#FB923C" />
                </View>
                <TextInput
                  className={`border bg-orange-50 p-4 pl-12 pr-12 rounded-xl text-gray-900 placeholder-orange-400 text-base font-medium ${
                    errors.password ? "border-red-400" : "border-orange-200"
                  }`}
                  placeholder="Password"
                  placeholderTextColor="#FB923C"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text)
                    if (errors.password) setErrors({ ...errors, password: "" })
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    shadowColor: errors.password ? "#EF4444" : "#FB923C",
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
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#FB923C" />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-2 ml-1 font-medium">{errors.password}</Text>
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
                    rememberMe ? "bg-orange-500 border-orange-500" : "border-orange-300 bg-white"
                  }`}
                  style={{
                    shadowColor: rememberMe ? "#FB923C" : "transparent",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: rememberMe ? 2 : 0,
                  }}
                >
                  {rememberMe && <Feather name="check" size={12} color="#fff" />}
                </View>
                <Text className="text-orange-700 text-sm font-medium">Remember me</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={() => router.push("/forgot-password")} activeOpacity={0.7}>
                <Text className="text-orange-600 text-sm font-semibold">Forgot Password?</Text>
              </TouchableOpacity> */}
            </View>

            {/* Enhanced Login Button */}
            <TouchableOpacity
              className={`bg-orange-500 p-4 rounded-xl ${loading ? "opacity-80" : ""}`}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              style={{
                shadowColor: "#FB923C",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
                background: "linear-gradient(135deg, #FB923C 0%, #F97316 100%)",
              }}
            >
              {loading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white ml-3 font-bold text-base">Signing in...</Text>
                </View>
              ) : (
                <Text className="text-white text-center font-bold text-base tracking-wide">Sign In</Text>
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
            <View className="bg-white px-3 py-2 rounded-full border border-orange-100">
              <Text className="text-orange-600 text-xs font-semibold">Version 1.0</Text>
            </View>
          </Animated.View>
        </Animated.View>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </>
  )
}