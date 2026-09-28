import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { getAuth, signOut, updateProfile, sendPasswordResetEmail } from '@react-native-firebase/auth';
import Colors from '../theme/color';
import { wp, hp, ms } from '../utils/responsive';

const ProfileScreen = ({ navigation }) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [displayName, setDisplayName] = useState(currentUser?.displayName || 'Snapshot User');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isVerified, setIsVerified] = useState(currentUser?.emailVerified || false);
  const [memberSince, setMemberSince] = useState('Recently');

  // Edit Name Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newName, setNewName] = useState(displayName);
  const [isSavingName, setIsSavingName] = useState(false);

  // Logout loading state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || 'Snapshot User');
      setEmail(currentUser.email || '');
      setIsVerified(currentUser.emailVerified || false);

      if (currentUser.metadata?.creationTime) {
        try {
          const date = new Date(currentUser.metadata.creationTime);
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          setMemberSince(`${month} ${year}`);
        } catch {
          setMemberSince('2026');
        }
      }
    }
  }, [currentUser]);

  // Handle Update Display Name
  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty.');
      return;
    }

    try {
      setIsSavingName(true);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName.trim() });
        setDisplayName(newName.trim());
      }
      setIsSavingName(false);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile name updated successfully! 🎉');
    } catch (error) {
      setIsSavingName(false);
      Alert.alert('Update Failed', error.message || 'Could not update name.');
    }
  };

  // Handle Send Password Reset Email
  const handlePasswordReset = () => {
    if (!email) return;

    Alert.alert(
      'Reset Password',
      `Send a password reset link to:\n${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, email);
              Alert.alert(
                'Email Sent ✉️',
                'A password reset link has been dispatched to your email inbox.'
              );
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to send reset link.');
            }
          },
        },
      ]
    );
  };

  // Handle Logout
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Snapshot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await signOut(auth);
              setIsLoggingOut(false);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err) {
              setIsLoggingOut(false);
              Alert.alert('Error', err.message || 'Logout failed.');
            }
          },
        },
      ]
    );
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Top Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={ms(22)} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        <TouchableOpacity
          style={styles.headerRightBtn}
          onPress={() => {
            setNewName(displayName);
            setIsEditModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={ms(18)} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card */}
        <View style={styles.profileCard}>
          {/* Avatar Ring */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarBadge}
              onPress={() => {
                setNewName(displayName);
                setIsEditModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="create" size={ms(14)} color={Colors.black} />
            </TouchableOpacity>
          </View>

          {/* Name & Email */}
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{email}</Text>

          {/* Badges Row */}
          <View style={styles.badgesRow}>
            {isVerified && (
              <View style={styles.badgeVerified}>
                <Ionicons name="checkmark-circle" size={ms(13)} color="#4CAF50" />
                <Text style={styles.badgeVerifiedText}>Verified</Text>
              </View>
            )}

            <View style={styles.badgeMember}>
              <Ionicons name="calendar-outline" size={ms(13)} color={Colors.textSecondary} />
              <Text style={styles.badgeMemberText}>{memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Camera')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#F5C51822' }]}>
              <Ionicons name="camera" size={ms(24)} color={Colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Open Camera</Text>
            <Text style={styles.actionSub}>Capture snaps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Gallery')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#3B82F622' }]}>
              <Ionicons name="images" size={ms(24)} color="#3B82F6" />
            </View>
            <Text style={styles.actionTitle}>My Gallery</Text>
            <Text style={styles.actionSub}>Photos & Videos</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings Section */}
        <Text style={styles.sectionHeader}>Account & Security</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              setNewName(displayName);
              setIsEditModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconBox}>
              <Ionicons name="person-outline" size={ms(20)} color={Colors.primary} />
            </View>
            <View style={styles.settingTextBox}>
              <Text style={styles.settingLabel}>Display Name</Text>
              <Text style={styles.settingValue}>{displayName}</Text>
            </View>
            <Ionicons name="chevron-forward" size={ms(18)} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name="mail-outline" size={ms(20)} color={Colors.primary} />
            </View>
            <View style={styles.settingTextBox}>
              <Text style={styles.settingLabel}>Email Address</Text>
              <Text style={styles.settingValue}>{email}</Text>
            </View>
            {isVerified ? (
              <Ionicons name="shield-checkmark" size={ms(18)} color="#4CAF50" />
            ) : (
              <Ionicons name="alert-circle-outline" size={ms(18)} color="#FF9800" />
            )}
          </View>

          <View style={styles.settingDivider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handlePasswordReset}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconBox}>
              <Ionicons name="key-outline" size={ms(20)} color={Colors.primary} />
            </View>
            <View style={styles.settingTextBox}>
              <Text style={styles.settingLabel}>Change Password</Text>
              <Text style={styles.settingValue}>Send reset link to email</Text>
            </View>
            <Ionicons name="chevron-forward" size={ms(18)} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Cloud & App Info Section */}
        <Text style={styles.sectionHeader}>App & Storage</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name="cloud-done-outline" size={ms(20)} color="#10B981" />
            </View>
            <View style={styles.settingTextBox}>
              <Text style={styles.settingLabel}>Cloud Storage</Text>
              <Text style={styles.settingValue}>Cloudinary Connected (Free Tier)</Text>
            </View>
            <View style={styles.activeDot} />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Ionicons name="information-circle-outline" size={ms(20)} color={Colors.primary} />
            </View>
            <View style={styles.settingTextBox}>
              <Text style={styles.settingLabel}>App Version</Text>
              <Text style={styles.settingValue}>Snapshot v1.0.0 (Release)</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.8}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#FF4444" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={ms(20)} color="#FF4444" />
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>Logged in with Firebase Authentication</Text>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Display Name</Text>
            <Text style={styles.modalSubtitle}>Enter your new display name below</Text>

            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Your Name"
              placeholderTextColor={Colors.inputPlaceholder}
              autoCapitalize="words"
              maxLength={30}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isSavingName}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleUpdateName}
                disabled={isSavingName}
              >
                {isSavingName ? (
                  <ActivityIndicator size="small" color={Colors.black} />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + hp(1) : hp(5),
    paddingBottom: hp(1.8),
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backBtn: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(19),
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  headerRightBtn: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(19),
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(6),
  },
  profileCard: {
    backgroundColor: '#141414',
    borderRadius: ms(20),
    paddingVertical: hp(3),
    paddingHorizontal: wp(4),
    alignItems: 'center',
    marginTop: hp(2.5),
    borderWidth: 1,
    borderColor: '#222222',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: hp(1.5),
  },
  avatarContainer: {
    width: ms(84),
    height: ms(84),
    borderRadius: ms(42),
    backgroundColor: '#1F1F1F',
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: ms(28),
    fontWeight: '800',
    letterSpacing: 1,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: ms(26),
    height: ms(26),
    borderRadius: ms(13),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#141414',
  },
  userName: {
    fontSize: ms(20),
    fontWeight: '700',
    color: Colors.white,
    marginBottom: hp(0.4),
  },
  userEmail: {
    fontSize: ms(13),
    color: Colors.textSecondary,
    marginBottom: hp(1.8),
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
    justifyContent: 'center',
  },
  badgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: ms(12),
    gap: wp(1),
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  badgeVerifiedText: {
    color: '#4CAF50',
    fontSize: ms(11),
    fontWeight: '600',
  },


  badgeMember: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: ms(12),
    gap: wp(1),
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  badgeMemberText: {
    color: Colors.textSecondary,
    fontSize: ms(11),
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: ms(14),
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: hp(3),
    marginBottom: hp(1.2),
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: wp(3),
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: ms(16),
    padding: wp(4),
    borderWidth: 1,
    borderColor: '#222222',
    alignItems: 'flex-start',
  },
  actionIconCircle: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  actionTitle: {
    color: Colors.white,
    fontSize: ms(14),
    fontWeight: '700',
    marginBottom: hp(0.3),
  },
  actionSub: {
    color: Colors.textSecondary,
    fontSize: ms(11),
  },
  settingsGroup: {
    backgroundColor: '#141414',
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: '#222222',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(4),
  },
  settingIconBox: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3.5),
  },
  settingTextBox: {
    flex: 1,
  },
  settingLabel: {
    color: Colors.white,
    fontSize: ms(14),
    fontWeight: '600',
    marginBottom: hp(0.2),
  },
  settingValue: {
    color: Colors.textSecondary,
    fontSize: ms(12),
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#1E1E1E',
    marginLeft: wp(16),
  },
  activeDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: '#10B981',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.25)',
    borderRadius: ms(14),
    paddingVertical: hp(1.8),
    marginTop: hp(3.5),
    gap: wp(2),
  },
  logoutBtnText: {
    color: '#FF4444',
    fontSize: ms(15),
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: ms(11),
    marginTop: hp(2),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: ms(20),
    padding: wp(6),
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  modalTitle: {
    color: Colors.white,
    fontSize: ms(18),
    fontWeight: '700',
    marginBottom: hp(0.6),
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: ms(12),
    marginBottom: hp(2),
  },
  modalInput: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: ms(12),
    color: Colors.white,
    fontSize: ms(15),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    marginBottom: hp(2.5),
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: wp(3),
  },
  modalCancelBtn: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: ms(10),
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: ms(14),
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
    borderRadius: ms(10),
    minWidth: ms(70),
    alignItems: 'center',
  },
  modalSaveText: {
    color: Colors.black,
    fontSize: ms(14),
    fontWeight: '700',
  },
});

export default ProfileScreen;
