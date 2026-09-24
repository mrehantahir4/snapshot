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
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../../theme/color';

const SignupScreen = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = () => {
        console.log('Signup pressed');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Ionicons name="camera" size={48} color={Colors.primary} />
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Snapshot and start sharing moments</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>

                    {/* Full Name */}
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
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
                        <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
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
                        <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
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
                                size={20}
                                color={Colors.textMuted}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            placeholderTextColor={Colors.inputPlaceholder}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons
                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={Colors.textMuted}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Signup Button */}
                    <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
                        <Text style={styles.signupButtonText}>Create Account</Text>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>Already have an account? </Text>
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
        backgroundColor: Colors.background
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 40
    },
    header: {
        alignItems: 'center',
        marginBottom: 36
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.primary,
        marginTop: 16,
        marginBottom: 8
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center'
    },
    form: {
        flex: 1
    },
    label: {
        color: Colors.textSecondary,
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 4
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 54,
        marginBottom: 16,
    },
    inputIcon: {
        marginRight: 10
    },
    input: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: 15
    },
    signupButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    signupButtonText: {
        color: Colors.black,
        fontSize: 16,
        fontWeight: '700'
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginText: {
        color: Colors.textSecondary,
        fontSize: 14
    },
    loginLink: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '700'
    },
});

export default SignupScreen;
