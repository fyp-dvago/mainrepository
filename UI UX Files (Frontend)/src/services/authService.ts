import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  getAuth,
  getIdToken,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  updateProfile,
} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  GOOGLE_ANDROID_PACKAGE_NAME,
  GOOGLE_WEB_CLIENT_ID,
} from '../config/firebaseConfig';
import api from './apiClient';

let isGoogleSigninConfigured = false;

/**
 * Configure Google Sign-In (with validations)
 */
const configureGoogleSignin = () => {
  if (isGoogleSigninConfigured) {
    return;
  }

  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('Missing GOOGLE_WEB_CLIENT_ID in firebaseConfig');
  }

  if (!GOOGLE_WEB_CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
    throw new Error('Invalid GOOGLE_WEB_CLIENT_ID format');
  }

  console.log(
    'Google Sign-In expected Android package:',
    GOOGLE_ANDROID_PACKAGE_NAME,
  );
  console.log(
    'GOOGLE_WEB_CLIENT_ID prefix:',
    GOOGLE_WEB_CLIENT_ID.slice(0, 20),
  );

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });

  isGoogleSigninConfigured = true;
};

/**
 * Send Firebase ID token to backend
 */
const loginWithFirebaseIdToken = async (idToken: string) => {
  if (!idToken) {
    throw new Error('Missing Firebase ID token');
  }

  const response = await api.post('/auth/firebase', {idToken});
  return response.data;
};

/**
 * Normal Email/Password Register
 */
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

/**
 * Normal Email/Password Login
 */
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });

  return response.data;
};

/**
 * Get Profile
 */
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

/**
 * Firebase Email Login
 */
export const loginWithFirebaseEmail = async (
  email: string,
  password: string,
) => {
  try {
    const credential = await signInWithEmailAndPassword(
      getAuth(),
      email,
      password,
    );
    const idToken = await getIdToken(credential.user);

    return loginWithFirebaseIdToken(idToken);
  } catch (error: any) {
    console.log('Firebase Email Login Error:', error);
    throw error;
  }
};

/**
 * Firebase Email Register
 */
export const registerWithFirebaseEmail = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    const credential = await createUserWithEmailAndPassword(
      getAuth(),
      email,
      password,
    );

    await updateProfile(credential.user, {
      displayName: name,
    });

    const idToken = await getIdToken(credential.user, true);

    return loginWithFirebaseIdToken(idToken);
  } catch (error: any) {
    console.log('Firebase Register Error:', error);
    throw error;
  }
};

/**
 * Google Sign-In (Fully Debuggable)
 */
export const loginWithGoogle = async () => {
  try {
    configureGoogleSignin();

    const hasPlayServices = await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    console.log('Google Play Services available:', hasPlayServices);

    // Force fresh login (avoid cached bad tokens)
    await GoogleSignin.signOut();

    const signInResult = await GoogleSignin.signIn();

    console.log('Google sign-in result type:', signInResult.type);

    const idToken =
      signInResult.type === 'success'
        ? signInResult.data?.idToken
        : null;

    if (!idToken) {
      throw new Error(
        'Google sign-in did not return an ID token. Check webClientId / SHA-1',
      );
    }

    console.log('Google ID Token received');

    const googleCredential = GoogleAuthProvider.credential(idToken);

    const credential = await signInWithCredential(getAuth(), googleCredential);

    const firebaseIdToken = await getIdToken(credential.user, true);

    if (!firebaseIdToken) {
      throw new Error('Firebase did not return an ID token');
    }

    console.log('Firebase ID Token received');

    return loginWithFirebaseIdToken(firebaseIdToken);
  } catch (error: any) {
    console.log('================ GOOGLE SIGN-IN ERROR ================');
    console.log('Code:', error?.code);
    console.log('Message:', error?.message);
    console.log('====================================================');

    throw error;
  }
};

/**
 * Local Storage
 */
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
