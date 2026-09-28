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
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from '@react-native-firebase/auth';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../../theme/color';
import { wp, hp, scale, ms } from '../../utils/responsive';

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, { displayName: trimmedName });
        // ✉️ Send real Firebase Email Verification link
        await sendEmailVerification(user);
        // Sign out unverified session
        await auth.signOut();
      }

      setLoading(false);

      Alert.alert(
        'Verification Email Sent ✉️',
        `A verification link has been sent to:\n${trimmedEmail}\n\nPlease check your email inbox (and spam folder), click the verification link, and then log in.`,
        [
          {
            text: 'Go to Login',
            onPress: () => navigation?.replace('Login'),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Signup Failed', 'This email is already registered. Please login.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Signup Failed', 'Please enter a valid email address.');
      } else {
        Alert.alert('Signup Error', error.message || 'Something went wrong.');
      }
    }
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Snapshot and start sharing moments</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Full Name */}
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={ms(20)}
                  color={Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.inputPlaceholder}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

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
                  placeholder="Create a password"
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

              {/* Confirm Password */}
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={ms(20)}
                  color={Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.inputPlaceholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={ms(20)}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                style={[styles.signupButton, loading && { opacity: 0.6 }]}
                onPress={handleSignup}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={Colors.black} size="small" />
                ) : (
                  <Text style={styles.signupButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
                  <Text style={styles.loginLink}>Login</Text>
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
    marginBottom: hp(3),
    marginTop: hp(2),
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
    marginBottom: hp(1.8),
  },
  inputIcon: {
    marginRight: scale(10),
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: ms(15),
  },
  signupButton: {
    backgroundColor: Colors.primary,
    borderRadius: ms(12),
    height: hp(6.5),
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(1),
    marginBottom: hp(2),
  },
  signupButtonText: {
    color: Colors.black,
    fontSize: ms(16),
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: ms(14),
  },
  loginLink: {
    color: Colors.primary,
    fontSize: ms(14),
    fontWeight: '700',
  },
});

export default SignupScreen;
