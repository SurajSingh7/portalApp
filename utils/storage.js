import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Token
export const setToken = (token) => AsyncStorage.setItem('authToken', token);
export const getToken = () => AsyncStorage.getItem('authToken');
export const clearToken = () => AsyncStorage.removeItem('authToken');

// Remembered Credentials
export const saveCredentials = async (username, password) => {
  await AsyncStorage.setItem('rememberedUsername', username);
  await AsyncStorage.setItem('rememberedPassword', password);
};

export const getCredentials = async () => {
  const username = await AsyncStorage.getItem('rememberedUsername');
  const password = await AsyncStorage.getItem('rememberedPassword');
  return { username, password };
};

export const clearCredentials = async () => {
  await AsyncStorage.removeItem('rememberedUsername');
  await AsyncStorage.removeItem('rememberedPassword');
};
