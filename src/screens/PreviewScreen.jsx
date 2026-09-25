import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { createThumbnail } from 'react-native-create-thumbnail';
import Video from 'react-native-video';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../theme/color';
import { wp, hp, ms } from '../utils/responsive';

// ☁️ Cloudinary Configurations
// Inhe apne Cloudinary Dashboard ke sath update karein:
export const CLOUDINARY_CONFIG = {
    cloudName: 'ggejsahs',
    uploadPreset: 'snapshot_preset',
};

const PreviewScreen = ({ route, navigation }) => {
    const { mediaPath, isVideo = false, filterColor = null } = route.params || {};

    const [saving, setSaving] = useState(false);
    const [savedLocally, setSavedLocally] = useState(false);
    const [videoThumb, setVideoThumb] = useState(null);

    // Format URI with file:// protocol if not present
    const fileUri = mediaPath?.startsWith('file://') ? mediaPath : `file://${mediaPath}`;

    // Extract video thumbnail for preview if media is a video
    useEffect(() => {
        let isMounted = true;
        if (isVideo && mediaPath) {
            createThumbnail({
                url: fileUri,
                timeStamp: 500,
            })
                .then((res) => {
                    if (isMounted && res?.path) {
                        setVideoThumb(res.path);
                    }
                })
                .catch((err) => console.log('Thumbnail error:', err));
        }
        return () => {
            isMounted = false;
        };
    }, [isVideo, mediaPath]);

    // 1. Save to Device Gallery
    const saveToPhoneMemory = async () => {
        try {
            await CameraRoll.saveAsset(fileUri, {
                type: isVideo ? 'video' : 'photo',
            });
            return true;
        } catch (error) {
            console.log('Error saving to phone memory:', error);
            // Fallback to CameraRoll.save
            try {
                await CameraRoll.save(fileUri, {
                    type: isVideo ? 'video' : 'photo',
                });
                return true;
            } catch (err2) {
                console.log('Fallback save error:', err2);
                return false;
            }
        }
    };

    // 2. Upload to Cloudinary
    const uploadToCloudinary = async () => {
        if (
            CLOUDINARY_CONFIG.cloudName === 'YOUR_CLOUD_NAME' ||
            CLOUDINARY_CONFIG.uploadPreset === 'YOUR_UPLOAD_PRESET'
        ) {
            console.log('Cloudinary credentials not configured yet.');
            return {
                skipped: true,
                message: 'Phone mein save ho gaya! Cloudinary credentials add karein cloud upload ke liye.',
            };
        }

        const formData = new FormData();
        formData.append('file', {
            uri: fileUri,
            type: isVideo ? 'video/mp4' : 'image/jpeg',
            name: isVideo ? 'snapshot_video.mp4' : 'snapshot_photo.jpg',
        });
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

        const resourceType = isVideo ? 'video' : 'image';
        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const data = await response.json();
        if (data.secure_url) {
            return { success: true, url: data.secure_url };
        } else {
            throw new Error(data.error?.message || 'Upload failed');
        }
    };

    // Handle Save (Phone + Cloudinary)
    const handleSave = async () => {
        if (saving) return;
        setSaving(true);

        try {
            // Save to phone gallery
            const localSaved = await saveToPhoneMemory();
            if (localSaved) {
                setSavedLocally(true);
            }

            // Upload to Cloudinary
            const cloudResult = await uploadToCloudinary();

            if (cloudResult?.success) {
                Alert.alert('Saved!', 'Media aapke phone aur Cloudinary par successfully save ho gaya!');
            } else if (cloudResult?.skipped) {
                Alert.alert('Saved to Phone!', cloudResult.message);
            } else {
                Alert.alert('Phone Saved', 'Phone memory mein save ho gaya!');
            }
        } catch (error) {
            console.log('Save process error:', error);
            Alert.alert(
                'Notice',
                'Phone memory mein save ho gaya, lekin Cloudinary upload mein issue aaya: ' + (error.message || '')
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Media Display */}
            {isVideo ? (
                <View style={styles.videoContainer}>
                    <Video
                        source={{ uri: fileUri }}
                        style={styles.media}
                        resizeMode="cover"
                        repeat={true}
                        paused={false}
                        ignoreSilentSwitch="ignore"
                    />
                    <View style={styles.videoBadge}>
                        <Ionicons name="videocam" size={ms(16)} color={Colors.white} />
                        <Text style={styles.videoBadgeText}>Playing Video</Text>
                    </View>
                </View>
            ) : (
                <Image source={{ uri: fileUri }} style={styles.media} resizeMode="cover" />
            )}

            {/* Filter Overlay */}
            {filterColor && (
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: filterColor, zIndex: 1 },
                    ]}
                    pointerEvents="none"
                />
            )}

            {/* Top Bar (Retake / Close) */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.circleBtn}
                    onPress={() => navigation?.goBack()}
                    disabled={saving}>
                    <Ionicons name="close" size={ms(26)} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomBar}>
                {/* Save Button (Phone + Cloudinary) */}
                <TouchableOpacity
                    style={[styles.saveBtn, savedLocally && styles.savedBtn]}
                    onPress={handleSave}
                    disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color={Colors.black} />
                    ) : (
                        <>
                            <Ionicons
                                name={savedLocally ? 'checkmark-circle' : 'arrow-down-outline'}
                                size={ms(20)}
                                color={savedLocally ? Colors.white : Colors.black}
                            />
                            <Text style={[styles.saveBtnText, savedLocally && styles.savedBtnText]}>
                                {savedLocally ? 'Saved' : 'Save'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Send Button */}
                <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={() => {
                        Alert.alert('Snapshot', 'Ready to send / share!');
                    }}>
                    <Ionicons name="send" size={ms(20)} color={Colors.black} style={{ marginLeft: 2 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    media: {
        width: '100%',
        height: '100%',
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111114',
    },
    videoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoBadge: {
        position: 'absolute',
        top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + hp(7) : hp(12),
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.7),
        borderRadius: ms(20),
    },
    videoBadgeText: {
        color: Colors.white,
        fontSize: ms(13),
        fontWeight: '700',
    },
    topBar: {
        position: 'absolute',
        top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : hp(6),
        left: wp(4),
        right: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    circleBtn: {
        width: ms(44),
        height: ms(44),
        borderRadius: ms(22),
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomBar: {
        position: 'absolute',
        bottom: hp(4),
        left: wp(5),
        right: wp(5),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        backgroundColor: Colors.white,
        paddingHorizontal: wp(5),
        paddingVertical: hp(1.4),
        borderRadius: ms(25),
        elevation: 4,
    },
    savedBtn: {
        backgroundColor: '#10B981',
    },
    saveBtnText: {
        color: Colors.black,
        fontSize: ms(15),
        fontWeight: '700',
    },
    savedBtnText: {
        color: Colors.white,
    },
    sendBtn: {
        width: ms(52),
        height: ms(52),
        borderRadius: ms(26),
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
    },
});

export default PreviewScreen;
