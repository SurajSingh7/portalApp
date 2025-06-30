// "use client"

// import { useState, useEffect } from "react"
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Animated,
//   StatusBar,
//   Dimensions,
// } from "react-native"
// import { useRouter } from "expo-router"
// import tw from "twrnc"
// import { Feather } from "@expo/vector-icons"
// import AsyncStorage from "@react-native-async-storage/async-storage"
// import { API_BASE_URL } from "../config/api"

// const { width, height } = Dimensions.get("window")

// export default function ForgotPassword() {
//   const [mobileNumber, setMobileNumber] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [otpSent, setOtpSent] = useState(false)
//   const [fadeAnim] = useState(new Animated.Value(0))
//   const [slideAnim] = useState(new Animated.Value(30))
//   const [scaleAnim] = useState(new Animated.Value(0.95))
//   const [successAnim] = useState(new Animated.Value(0))
//   const [backButtonAnim] = useState(new Animated.Value(0))
//   const router = useRouter()

//   useEffect(() => {
//     // Start animations
//     Animated.sequence([
//       Animated.timing(backButtonAnim, {
//         toValue: 1,
//         duration: 400,
//         useNativeDriver: true,
//       }),
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(slideAnim, {
//           toValue: 0,
//           duration: 400,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 400,
//           useNativeDriver: true,
//         }),
//       ]),
//     ]).start()
//   }, [])

//   useEffect(() => {
//     if (otpSent) {
//       Animated.timing(successAnim, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       }).start()
//     }
//   }, [otpSent])

//   const handleSendOtp = async () => {
//     if (!/^\d{10}$/.test(mobileNumber)) {
//       return Alert.alert("Invalid Number", "Please enter a valid 10-digit mobile number")
//     }

//     setLoading(true)
//     try {
//       const response = await fetch(`${API_BASE_URL}/hrms/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ mobileNumber }),
//       })

//       const result = await response.json()

//       if (response.ok) {
//         setOtpSent(true)
//         await AsyncStorage.setItem("otpMobileNumber", mobileNumber)
//         Alert.alert("Success", "OTP sent successfully")
//       } else {
//         Alert.alert("Failed", result.message || "Could not send OTP")
//       }
//     } catch (error) {
//       Alert.alert("Error", "Server or network error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleContinue = async () => {
//     await AsyncStorage.setItem("otpMobileNumber", mobileNumber)
//     router.push("/verify-otp")
//   }

//   return (
//     <>
//       <StatusBar barStyle="light-content" backgroundColor="#fb923c" />
//       <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1`}>
//         {/* Main Background with Orange-400 Theme */}
//         <View style={tw`flex-1 bg-orange-400`}>
//           {/* Enhanced Background Layers */}
//           <View style={tw`absolute top-0 left-0 right-0 h-80 bg-orange-500 opacity-50`} />
//           <View style={tw`absolute top-0 left-0 right-0 h-40 bg-orange-600 opacity-25`} />

//           {/* Compact 3D Floating elements */}
//           <View
//             style={tw`absolute top-24 left-6 w-12 h-12 bg-orange-300 rounded-xl opacity-30 shadow-lg`}
//             transform={[{ rotate: "12deg" }]}
//           />
//           <View style={tw`absolute top-40 right-8 w-8 h-8 bg-orange-500 rounded-full opacity-25 shadow-md`} />
//           <View
//             style={tw`absolute top-56 left-12 w-6 h-6 bg-orange-300 rounded-lg opacity-40 shadow-sm`}
//             transform={[{ rotate: "-15deg" }]}
//           />
//           <View style={tw`absolute bottom-40 right-6 w-10 h-10 bg-orange-500 rounded-2xl opacity-20 shadow-lg`} />

//           {/* Enhanced Back Button */}
//           <Animated.View
//             style={[
//               tw`pt-12 px-6 pb-4`,
//               {
//                 opacity: backButtonAnim,
//                 transform: [
//                   {
//                     translateX: backButtonAnim.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [-50, 0],
//                     }),
//                   },
//                 ],
//               },
//             ]}
//           >
//             <View style={tw`relative`}>
//               {/* Back Button 3D Shadow */}
//               <View style={tw`absolute top-1 left-1 w-10 h-10 bg-orange-600 rounded-2xl opacity-40`} />
//               <TouchableOpacity
//                 onPress={() => router.back()}
//                 style={tw`w-10 h-10 bg-white bg-opacity-90 rounded-2xl items-center justify-center shadow-xl border border-orange-200`}
//                 activeOpacity={0.8}
//               >
//                 <Feather name="arrow-left" size={18} color="#fb923c" />
//               </TouchableOpacity>
//             </View>
//           </Animated.View>

//           <ScrollView
//             contentContainerStyle={tw`flex-grow justify-center px-6 pb-6`}
//             showsVerticalScrollIndicator={false}
//           >
//             <Animated.View
//               style={[
//                 tw`flex-1 justify-center`,
//                 {
//                   opacity: fadeAnim,
//                   transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
//                 },
//               ]}
//             >
//               {/* Compact Header Section */}
//               <View style={tw`items-center mb-6`}>
//                 <View style={tw`relative mb-3`}>
//                   {/* Smaller Icon 3D Shadow */}
//                   <View style={tw`absolute top-1 left-1 w-14 h-14 bg-orange-600 rounded-2xl opacity-30`} />
//                   <View style={tw`w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-xl`}>
//                     <Feather name="smartphone" size={24} color="#fb923c" />
//                   </View>
//                 </View>
//                 <Text style={tw`text-2xl font-black text-white tracking-wide mb-1 shadow-lg`}>Forgot Password</Text>
//                 <Text style={tw`text-orange-100 text-sm font-medium text-center px-6 leading-5`}>
//                   Enter your registered mobile number to receive OTP
//                 </Text>
//               </View>

//               {/* Compact Enhanced 3D Card */}
//               <View style={tw`relative`}>
//                 {/* Smaller Card Shadow Layers */}
//                 <View style={tw`absolute top-2 left-2 right-2 bottom-2 bg-orange-600 rounded-2xl opacity-15`} />
//                 <View style={tw`absolute top-1 left-1 right-1 bottom-1 bg-orange-500 rounded-2xl opacity-25`} />

//                 {/* Main Card - Smaller Padding */}
//                 <View style={tw`bg-white rounded-2xl p-5 shadow-2xl border border-orange-100`}>
//                   {/* Compact Mobile Number Input */}
//                   <View style={tw`mb-4`}>
//                     <Text style={tw`text-gray-700 font-semibold mb-2 ml-1 text-sm`}>Mobile Number</Text>
//                     <View style={tw`relative`}>
//                       {/* Smaller Input Shadow */}
//                       <View style={tw`absolute top-1 left-1 right-1 bottom-1 bg-orange-100 rounded-xl opacity-40`} />
//                       <View style={tw`absolute top-0.5 left-0.5 right-0.5 bottom-0.5 bg-orange-50 rounded-xl`} />

//                       <TextInput
//                         value={mobileNumber}
//                         onChangeText={setMobileNumber}
//                         keyboardType="number-pad"
//                         maxLength={10}
//                         placeholder="Enter 10-digit mobile number"
//                         placeholderTextColor="#9CA3AF"
//                         editable={!otpSent}
//                         style={[
//                           tw`border-2 p-3 rounded-xl bg-white text-gray-800 font-medium pl-11 text-sm relative z-10 shadow-sm`,
//                           tw`border-orange-300`,
//                           otpSent && tw`bg-gray-50 text-gray-500`,
//                         ]}
//                       />
//                       <View
//                         style={tw`absolute left-3 top-3 w-5 h-5 bg-orange-400 rounded-lg items-center justify-center z-20 shadow-sm`}
//                       >
//                         <Feather name="phone" size={12} color="#fff" />
//                       </View>
//                     </View>
//                     <Text style={tw`text-gray-500 text-xs mt-1 ml-1`}>OTP will be sent via WhatsApp</Text>
//                   </View>

//                   {/* Compact Success Message */}
//                   {otpSent && (
//                     <Animated.View
//                       style={[
//                         tw`mb-4 p-3 bg-green-50 rounded-xl border border-green-200`,
//                         {
//                           opacity: successAnim,
//                           transform: [
//                             {
//                               translateY: successAnim.interpolate({
//                                 inputRange: [0, 1],
//                                 outputRange: [15, 0],
//                               }),
//                             },
//                           ],
//                         },
//                       ]}
//                     >
//                       <View style={tw`flex-row items-center`}>
//                         <View style={tw`w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-2`}>
//                           <Feather name="check" size={12} color="#fff" />
//                         </View>
//                         <View style={tw`flex-1`}>
//                           <Text style={tw`text-green-700 font-semibold text-xs`}>OTP Sent Successfully!</Text>
//                           <Text style={tw`text-green-600 text-xs mt-0.5`}>Check your WhatsApp</Text>
//                         </View>
//                       </View>
//                     </Animated.View>
//                   )}

//                   {/* Compact Action Button */}
//                   {otpSent ? (
//                     <View style={tw`relative`}>
//                       {/* Smaller Button 3D Shadow */}
//                       <View style={tw`absolute top-2 left-2 right-2 bottom-2 bg-green-700 rounded-xl`} />
//                       <View style={tw`absolute top-1 left-1 right-1 bottom-1 bg-green-600 rounded-xl`} />

//                       <TouchableOpacity
//                         onPress={handleContinue}
//                         style={tw`bg-green-500 p-3.5 rounded-xl relative z-10 shadow-xl`}
//                         activeOpacity={0.8}
//                       >
//                         <View style={tw`flex-row items-center justify-center`}>
//                           <Feather name="arrow-right" size={16} color="#fff" />
//                           <Text style={tw`text-white text-center text-base font-bold ml-2`}>Continue</Text>
//                         </View>
//                       </TouchableOpacity>
//                     </View>
//                   ) : (
//                     <View style={tw`relative`}>
//                       {/* Smaller Button 3D Shadow */}
//                       <View style={tw`absolute top-2 left-2 right-2 bottom-2 bg-orange-600 rounded-xl`} />
//                       <View style={tw`absolute top-1 left-1 right-1 bottom-1 bg-orange-500 rounded-xl`} />

//                       <TouchableOpacity
//                         onPress={handleSendOtp}
//                         disabled={loading}
//                         style={[tw`bg-orange-400 p-3.5 rounded-xl relative z-10 shadow-xl`, loading && tw`opacity-80`]}
//                         activeOpacity={0.8}
//                       >
//                         {loading ? (
//                           <View style={tw`flex-row items-center justify-center`}>
//                             <ActivityIndicator color="#fff" size="small" />
//                             <Text style={tw`text-white text-base font-bold ml-2`}>Sending...</Text>
//                           </View>
//                         ) : (
//                           <View style={tw`flex-row items-center justify-center`}>
//                             <Feather name="send" size={16} color="#fff" />
//                             <Text style={tw`text-white text-center text-base font-bold ml-2`}>Send OTP</Text>
//                           </View>
//                         )}
//                       </TouchableOpacity>
//                     </View>
//                   )}

//                   {/* Compact Help Text */}
//                   <View style={tw`mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100`}>
//                     <View style={tw`flex-row items-start`}>
//                       <View style={tw`w-5 h-5 bg-orange-200 rounded-full items-center justify-center mr-2 mt-0.5`}>
//                         <Feather name="info" size={10} color="#fb923c" />
//                       </View>
//                       <View style={tw`flex-1`}>
//                         <Text style={tw`text-orange-700 font-medium text-xs mb-0.5`}>Need Help?</Text>
//                         <Text style={tw`text-orange-600 text-xs leading-4`}>
//                           Ensure your number is registered. Contact support if OTP doesn't arrive.
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 </View>
//               </View>

//               {/* Compact Version Text */}
//               <View style={tw`items-center mt-4`}>
//                 <View style={tw`bg-white bg-opacity-20 px-3 py-1.5 rounded-full`}>
//                   <Text style={tw`text-white text-xs font-semibold tracking-wide`}>Version 1.0</Text>
//                 </View>
//               </View>
//             </Animated.View>
//           </ScrollView>
//         </View>
//       </KeyboardAvoidingView>
//     </>
//   )
// }



import { View, Text } from 'react-native'
import React from 'react'

const forgot = () => {
  return (
    <View>
      <Text>forgot-password</Text>
    </View>
  )
}

export default forgot;