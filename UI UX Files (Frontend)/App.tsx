import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';

// import notifee, {AndroidImportance} from '@notifee/react-native';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import MainTabs from './src/navigation/MainTabs';
import AddMedicineScreen from './src/screens/AddMedicineScreen';
import MedicineDetailScreen from './src/screens/MedicineDetailScreen';
import ScanMedicineScreen from './src/screens/ScanMedicineScreen';
import {getStoredToken} from './src/services/authService';

const Stack = createNativeStackNavigator();

// async function createNotificationChannel() {
//   if (Platform.OS === 'android') {
//     await notifee.createChannel({
//       id: 'medicine-reminders',
//       name: 'Medicine Reminders',
//       importance: AndroidImportance.HIGH,
//     });
//   }
// }

// async function requestNotificationPermission() {
//   if (Platform.OS === 'android' && Platform.Version >= 33) {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//       );
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         console.log('Notification permission granted');
//       } else {
//         console.log('Notification permission denied');
//       }
//     } catch (err) {
//       console.warn('Notification permission error:', err);
//     }
//   }
// }

function App(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Onboarding');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // await createNotificationChannel();
        // await requestNotificationPermission();

        const token = await getStoredToken();

        setTimeout(() => {
          if (token) {
            setInitialRoute('MainTabs');
          } else {
            setInitialRoute('Onboarding');
          }
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.log('App init error:', error);
        setInitialRoute('Onboarding');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />

        <Stack.Screen
          name="AddMedicine"
          component={AddMedicineScreen}
          options={{
            headerShown: true,
            title: 'Add Medicine',
            headerStyle: {backgroundColor: '#74BA1E'},
            headerTintColor: '#FFFFFF',
          }}
        />

        <Stack.Screen
          name="MedicineDetail"
          component={MedicineDetailScreen}
          options={{
            headerShown: true,
            title: 'Medicine Details',
            headerStyle: {backgroundColor: '#74BA1E'},
            headerTintColor: '#FFFFFF',
          }}
        />

        <Stack.Screen
          name="ScanMedicine"
          component={ScanMedicineScreen}
          options={{
            headerShown: true,
            title: 'Scan Medicine',
            headerStyle: {backgroundColor: '#74BA1E'},
            headerTintColor: '#FFFFFF',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;