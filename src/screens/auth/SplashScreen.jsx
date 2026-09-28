import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../../theme/color';
import { wp, hp, ms } from '../../utils/responsive';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const auth = getAuth();
        if (auth && auth.currentUser && auth.currentUser.emailVerified) {
          navigation.replace('Camera');
          return;
        }
      } catch (err) {
        console.log('Firebase auth check:', err);
      }
      navigation.replace('Login');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Logo & Title */}
      <View style={styles.centerContent}>
        <Ionicons name="camera" size={ms(75)} color={Colors.primary} />
        <Text style={styles.title}>Snapshot</Text>
        <Text style={styles.subtitle}>Capture & Share Every Moment</Text>
      </View>

      {/* Bottom Loader */}
      <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: ms(34),
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: hp(1.8),
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: ms(14),
    color: Colors.textSecondary,
    marginTop: hp(0.8),
  },
  loader: {
    position: 'absolute',
    bottom: hp(6),
  },
});

export default SplashScreen;
