import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'http://10.0.2.2:5000/api';
// Android emulator

// If using physical phone, replace with your laptop IP:
const BASE_URL = 'http://192.168.10.10:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
  });

  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });

  return response.data;
};

export const getProfile = async () => {
  const token = await AsyncStorage.getItem('token');

  const response = await api.get('/auth/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const saveAuthData = async (token: string, user: any) => {
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

export const getStoredToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const getStoredUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const clearAuthData = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export default api;