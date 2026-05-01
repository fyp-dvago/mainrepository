import {Platform} from 'react-native';

const API_PORT = 5000;
const PHYSICAL_DEVICE_HOST = '192.168.10.7';
const USE_PHYSICAL_DEVICE_API = true;

const getDefaultApiHost = () => {
  if (USE_PHYSICAL_DEVICE_API) {
    return PHYSICAL_DEVICE_HOST;
  }

  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }

  if (Platform.OS === 'ios') {
    return 'localhost';
  }

  return PHYSICAL_DEVICE_HOST;
};

export const PHYSICAL_DEVICE_API_BASE_URL = `http://${PHYSICAL_DEVICE_HOST}:${API_PORT}/api`;

export const API_BASE_URL = `http://${getDefaultApiHost()}:${API_PORT}/api`;
