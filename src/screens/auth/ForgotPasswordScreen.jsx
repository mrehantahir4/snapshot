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
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../../theme/color';
import { wp, hp, scale, ms } from '../../utils/responsive';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Alert', 'Please enter your email address');
      return;
    }
    Alert.alert('Success', 'Reset link has been sent to your email.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={ms(24)} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="lock-open-outline" size={ms(60)} color={Colors.primary} />
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address to receive password reset instructions.
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
            />
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}>
            <Text style={styles.resetButtonText}>Send Reset Link</Text>
          </TouchableOpacity>

          {/* Back to Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(12), // Extra bottom padding for full scroll room
  },
  backButton: {
    width: ms(40),
    height: ms(40),
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(4),
  },
  title: {
    fontSize: ms(26),
    fontWeight: '700',
    color: Colors.primary,
    marginTop: hp(1.5),
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: ms(14),
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
