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
import Ionicons from '@react-native-vector-icons/ionicons';
import { getAuth, sendPasswordResetEmail } from '@react-native-firebase/auth';
import Colors from '../../theme/color';
import { wp, hp, scale, ms } from '../../utils/responsive';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, trimmedEmail);

      setLoading(false);

      Alert.alert(
        'Reset Link Sent ✉️',
        `An official password reset link has been sent to:\n${trimmedEmail}\n\nPlease check your email inbox (and spam folder), click the link to set your new password, and then log in.`,
        [
          {
            text: 'Go to Login',
            onPress: () => {
              navigation?.navigate('Login');
            },
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      let errorMsg = 'Failed to send reset link. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email address. Please check the email or sign up.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      Alert.alert('Reset Failed', errorMsg);
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

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={ms(24)} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Inner Content Centered */}
          <View style={styles.innerContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="mail-unread-outline" size={ms(42)} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your registered email address. We will send an official password reset link directly to your Gmail inbox.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Email Address</Text>
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
                  editable={!loading}
                />
              </View>

              {/* Send Reset Link Button */}
              <TouchableOpacity
                style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                onPress={handleSendResetEmail}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={Colors.black} size="small" />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>

              {/* Back to Login Link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Remember your password? </Text>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : hp(4),
    paddingBottom: hp(14),
  },
  backButton: {
    width: ms(40),
    height: ms(40),
    justifyContent: 'center',
    marginBottom: hp(1),
  },
  innerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: hp(2),
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(3.5),
  },
  iconCircle: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(40),
    backgroundColor: 'rgba(245, 197, 24, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.3)',
  },
  title: {
    fontSize: ms(24),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: ms(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: ms(20),
    paddingHorizontal: wp(3),
  },
  form: {
    width: '100%',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: ms(13),
    fontWeight: '500',
    marginBottom: hp(0.8),
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
    marginBottom: hp(2.5),
  },
  inputIcon: {
    marginRight: scale(10),
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: ms(15),
  },
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: ms(12),
    height: hp(6.5),
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2.5),
    elevation: 3,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: Colors.black,
    fontSize: ms(16),
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1),
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

export default ForgotPasswordScreen;
