import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from '@react-native-firebase/auth';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../../theme/color';
import { wp, hp, scale, ms } from '../../utils/responsive';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      // 🛑 Check if email is verified
      if (user && !user.emailVerified) {
        setLoading(false);
        Alert.alert(
          'Email Not Verified ⚠️',
          'Please verify your email address before logging in. Check your inbox (or spam folder) for the verification link.',
          [
            {
              text: 'Resend Email',
              onPress: async () => {
                try {
                  await sendEmailVerification(user);
                  await auth.signOut();
                  Alert.alert('Sent', 'A new verification link has been sent to your email.');
                } catch (e) {
                  Alert.alert('Error', e.message || 'Could not resend email.');
                }
              },
            },
            {
              text: 'OK',
              onPress: async () => {
                await auth.signOut();
              },
            },
          ]
        );
        return;
      }

      setLoading(false);
      navigation?.replace('Camera');
    } catch (error) {
      setLoading(false);
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        Alert.alert('Login Failed', 'Invalid email or password.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Login Failed', 'Please enter a valid email address.');
      } else {
        Alert.alert('Login Error', error.message || 'Something went wrong.');
      }
    }
  };

  const handleForgotPassword = () => {
    navigation?.navigate('ForgotPassword');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>

          <View style={styles.innerContent}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="camera" size={ms(50)} color={Colors.primary} />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Log in to continue to Snapshot</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email */}
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={ms(20)}
                  color={Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.inputPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={ms(20)}
                  color={Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.inputPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={ms(20)}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && { opacity: 0.6 }]}
                onPress={handleLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={Colors.black} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation?.navigate('Signup')}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(6),
    paddingVertical: hp(2),
  },
  innerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: hp(4),
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(4),
  },
  title: {
    fontSize: ms(28),
    fontWeight: '700',
    color: Colors.primary,
    marginTop: hp(1.5),
    marginBottom: hp(0.8),
  },
  subtitle: {
    fontSize: ms(14),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: ms(13),
    fontWeight: '500',
    marginBottom: hp(0.8),
    marginTop: hp(0.5),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: ms(12),
    paddingHorizontal: wp(3.5),
    height: hp(6.5),
    minHeight: 50,
    marginBottom: hp(2),
  },
  inputIcon: {
    marginRight: scale(10),
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: ms(15),
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: hp(2.5),
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: ms(13),
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: ms(12),
    height: hp(6.5),
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2.5),
  },
  loginButtonText: {
    color: Colors.black,
    fontSize: ms(16),
    fontWeight: '700',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: Colors.textSecondary,
    fontSize: ms(14),
  },
  signupLink: {
    color: Colors.primary,
    fontSize: ms(14),
    fontWeight: '700',
  },
});

export default LoginScreen;
