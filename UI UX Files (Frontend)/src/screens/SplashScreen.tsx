import React from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SplashScreen = () => {
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient colors={['#74BA1E', '#5A9618']} style={styles.container}>
      <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
        <Icon name="pill" size={80} color="#FFFFFF" />
        <Text style={styles.title}>DVAGO</Text>
        <Text style={styles.subtitle}>Smart Medicine Reminder</Text>
        <Text style={styles.tagline}>Your Health, Our Priority</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.95,
  },
  tagline: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 16,
    opacity: 0.8,
    fontStyle: 'italic',
  },
});

export default SplashScreen;
