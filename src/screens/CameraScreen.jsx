import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useMicrophonePermission,
    usePhotoOutput,
    useVideoOutput,
} from 'react-native-vision-camera';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../theme/color';
import { wp, hp, ms } from '../utils/responsive';
import { FILTERS } from '../utils/filters';

const CameraScreen = ({ navigation }) => {
    const cameraRef = useRef(null);

    // States
    const [flash, setFlash] = useState(false);
    const [cameraType, setCameraType] = useState('back');
    const [timer, setTimer] = useState(0);
    const [countdown, setCountdown] = useState(null);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [screenFlashVisible, setScreenFlashVisible] = useState(false);

    // Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const recorderRef = useRef(null);
    const recordingTimerRef = useRef(null);
    const isRecordingRef = useRef(false);

    // Filter States
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);

    // Permissions
    const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();
    const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } = useMicrophonePermission();
    const device = useCameraDevice(cameraType);

    // VisionCamera Outputs
    const photoOutput = usePhotoOutput();
    const videoOutput = useVideoOutput({ enableAudio: hasMicPermission });

    useEffect(() => {
        if (!hasCameraPermission) requestCameraPermission();
        if (!hasMicPermission) requestMicPermission();
    }, [hasCameraPermission, hasMicPermission]);

    const toggleCamera = () => setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
    const toggleFlash = () => setFlash((prev) => !prev);

    const cycleTimer = () => {
        if (timer === 0) setTimer(3);
        else if (timer === 3) setTimer(5);
        else if (timer === 5) setTimer(10);
        else setTimer(0);
    };

    // Tap & Double Tap Refs
    const lastTapRef = useRef(0);
    const singleTapTimerRef = useRef(null);

    // 📸 Take Photo (Silent & Fixed Path)
    const executeCapture = async () => {
        if (isRecordingRef.current) return;
        if (cameraType === 'front' && flash) {
            setScreenFlashVisible(true);
            setTimeout(() => setScreenFlashVisible(false), 400);
        }
        try {
            const photoFile = await photoOutput.capturePhotoToFile(
                {
                    flashMode: flash && cameraType === 'back' ? 'on' : 'off',
                    enableShutterSound: false, // 🔇 No Click Sound
                },
                {}
            );
            const path = photoFile.filePath || photoFile.path;
            console.log('Captured photo path:', path);

            navigation?.navigate('Preview', {
                mediaPath: path,
                isVideo: false,
                filterColor: selectedFilter?.color || null,
            });
        } catch (e) {
            console.log('Capture error:', e);
        }
    };

    // 🎥 Start Video Recording
    const handleStartRecording = async () => {
        if (isCountingDown || isRecordingRef.current) return;
        try {
            if (!hasMicPermission) {
                await requestMicPermission();
            }
            const recorder = await videoOutput.createRecorder({});
            recorderRef.current = recorder;
            isRecordingRef.current = true;
            setIsRecording(true);
            setRecordingDuration(0);

            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);

            await recorder.startRecording(
                (filePath) => {
                    console.log('Video recorded to:', filePath);
                    cleanupRecording();
                    navigation?.navigate('Preview', {
                        mediaPath: filePath,
                        isVideo: true,
                        filterColor: selectedFilter?.color || null,
                    });
                },
                (error) => {
                    console.log('Recording error:', error);
                    cleanupRecording();
                }
            );
        } catch (err) {
            console.log('Start recording error:', err);
            cleanupRecording();
        }
    };

    const cleanupRecording = () => {
        isRecordingRef.current = false;
        setIsRecording(false);
        setRecordingDuration(0);
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
        recorderRef.current = null;
    };

    // 🛑 Stop Video Recording
    const handleStopRecording = async () => {
        if (isRecordingRef.current && recorderRef.current) {
            try {
                await recorderRef.current.stopRecording();
            } catch (e) {
                console.log('Stop recording error:', e);
                cleanupRecording();
            }
        }
    };

    // 🎯 Shutter Tap Handler: Single Tap = Photo, Double Tap = Video Recording
    const handleShutterPress = () => {
        if (isCountingDown) return;

        // Agar video pehle se record ho rahi hai to click karne se STOP ho jaye
        if (isRecordingRef.current) {
            handleStopRecording();
            return;
        }

        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // 👉 DOUBLE CLICK: Start Video Recording!
            if (singleTapTimerRef.current) {
                clearTimeout(singleTapTimerRef.current);
                singleTapTimerRef.current = null;
            }
            lastTapRef.current = 0;
            handleStartRecording();
        } else {
            // 👉 FIRST CLICK: Wait 300ms. Agar second click na aaye to Photo capture karein
            lastTapRef.current = now;
            if (singleTapTimerRef.current) {
                clearTimeout(singleTapTimerRef.current);
            }
            singleTapTimerRef.current = setTimeout(() => {
                lastTapRef.current = 0;
                singleTapTimerRef.current = null;
                if (!isRecordingRef.current) {
                    if (timer === 0) {
                        executeCapture();
                    } else {
                        setIsCountingDown(true);
                        setCountdown(timer);
                    }
                }
            }, DOUBLE_TAP_DELAY);
        }
    };

    useEffect(() => {
        if (!isCountingDown) return;
        if (countdown > 0) {
            const timerId = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (countdown === 0) {
            setIsCountingDown(false);
            setCountdown(null);
            executeCapture();
        }
    }, [isCountingDown, countdown]);

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Camera Feed */}
            {device != null && hasCameraPermission ? (
                <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    torch={flash && cameraType === 'back' ? 'on' : 'off'}
                    outputs={[photoOutput, videoOutput]}
                />
            ) : (
                <View style={styles.viewfinder}>
                    {!hasCameraPermission ? (
                        <TouchableOpacity onPress={requestCameraPermission} style={styles.permissionBtn}>
                            <Text style={styles.permissionText}>Grant Camera Permission</Text>
                        </TouchableOpacity>
                    ) : (
                        <ActivityIndicator size="large" color={Colors.primary} />
                    )}
                </View>
            )}

            {/* 🎨 Live Camera Filter */}
            {selectedFilter?.color && (
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: selectedFilter.color, zIndex: 1 },
                    ]}
                    pointerEvents="none"
                />
            )}

            {/* Screen Flash & Countdown */}
            {screenFlashVisible && <View style={styles.screenFlash} />}
            {isCountingDown && countdown !== null && (
                <View style={styles.countdownContainer}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                </View>
            )}

            {/* Recording Indicator */}
            {isRecording && (
                <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingTime}>{formatTimer(recordingDuration)}</Text>
                </View>
            )}

            {/* Top Header */}
            <View style={styles.topContainer}>
                <View style={styles.topLeft}>
                    <TouchableOpacity style={styles.iconCircle}>
                        <Ionicons name="person" size={ms(18)} color={Colors.black} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconCircleGlass}>
                        <Ionicons name="search" size={ms(18)} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.rightToolbar}>
                    <TouchableOpacity style={styles.toolBtn} onPress={toggleCamera}>
                        <Ionicons name="camera-reverse-outline" size={ms(22)} color={Colors.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toolBtn, flash && styles.toolBtnActive]}
                        onPress={toggleFlash}>
                        <Ionicons
                            name={flash ? 'flash' : 'flash-off-outline'}
                            size={ms(22)}
                            color={flash ? Colors.primary : Colors.white}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toolBtn, timer > 0 && styles.toolBtnActive]}
                        onPress={cycleTimer}>
                        <Ionicons
                            name={timer > 0 ? 'timer' : 'timer-outline'}
                            size={ms(22)}
                            color={timer > 0 ? Colors.primary : Colors.white}
                        />
                        {timer > 0 && <Text style={styles.timerBadge}>{timer}s</Text>}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomOverlay}>
                {/* Filter Selector Carousel */}
                {showFilters && (
                    <View style={styles.filtersWrapper}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterList}>
                            {FILTERS.map((item) => {
                                const isSelected = selectedFilter?.id === item.id;
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.filterBubble, isSelected && styles.filterBubbleActive]}
                                        onPress={() => setSelectedFilter(item)}>
                                        <Ionicons
                                            name={item.icon}
                                            size={ms(20)}
                                            color={isSelected ? Colors.black : Colors.white}
                                        />
                                        <Text style={[styles.filterLabel, isSelected && styles.filterLabelActive]}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Shutter & Filter Toggle */}
                <View style={styles.bottomControlsContainer}>
                    {/* Gallery Button */}
                    <TouchableOpacity
                        style={styles.sideControlBtn}
                        onPress={() => navigation?.navigate('Gallery')}>
                        <Ionicons name="images-outline" size={ms(26)} color={Colors.white} />
                    </TouchableOpacity>

                    {/* Shutter Button (Tap = Photo, Double Tap = Video) */}
                    <TouchableOpacity
                        style={[
                            styles.shutterOuter,
                            isCountingDown && styles.shutterActive,
                            isRecording && styles.shutterRecording,
                        ]}
                        activeOpacity={0.8}
                        onPress={handleShutterPress}>
                        <View
                            style={[
                                styles.shutterInner,
                                isCountingDown && { backgroundColor: Colors.primary },
                                isRecording && styles.shutterInnerRecording,
                            ]}
                        />
                    </TouchableOpacity>

                    {/* Filter Toggle */}
                    <TouchableOpacity
                        style={[styles.sideControlBtn, showFilters && styles.filterBtnActive]}
                        onPress={() => setShowFilters(!showFilters)}>
                        <Ionicons
                            name="sparkles"
                            size={ms(26)}
                            color={showFilters ? Colors.primary : Colors.white}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    viewfinder: {
        flex: 1,
        backgroundColor: '#101014',
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: ms(25),
    },
    permissionText: {
        color: Colors.black,
        fontWeight: '700',
        fontSize: ms(14),
    },
    screenFlash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
        zIndex: 99,
    },
    countdownContainer: {
        position: 'absolute',
        top: '40%',
        alignSelf: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: ms(90),
        height: ms(90),
        borderRadius: ms(45),
        justifyContent: 'center',
        alignItems: 'center',
    },
    countdownText: {
        color: Colors.white,
        fontSize: ms(48),
        fontWeight: '900',
    },
    recordingIndicator: {
        position: 'absolute',
        top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : hp(6),
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: wp(3.5),
        paddingVertical: hp(0.6),
        borderRadius: ms(20),
        gap: wp(2),
        zIndex: 10,
    },
    recordingDot: {
        width: ms(10),
        height: ms(10),
        borderRadius: ms(5),
        backgroundColor: '#EF4444',
    },
    recordingTime: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: ms(14),
    },
    topContainer: {
        position: 'absolute',
        top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : hp(5),
        left: wp(4),
        right: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 5,
    },
    topLeft: {
        flexDirection: 'row',
        gap: wp(2.5),
    },
    iconCircle: {
        width: ms(38),
        height: ms(38),
        borderRadius: ms(19),
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircleGlass: {
        width: ms(38),
        height: ms(38),
        borderRadius: ms(19),
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightToolbar: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: ms(22),
        paddingVertical: hp(0.6),
        paddingHorizontal: wp(1.2),
        gap: hp(1.2),
        alignItems: 'center',
    },
    toolBtn: {
        width: ms(38),
        height: ms(38),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    toolBtnActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: ms(19),
    },
    timerBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: Colors.primary,
        color: Colors.black,
        fontSize: ms(9),
        fontWeight: '800',
        borderRadius: ms(6),
        paddingHorizontal: 3,
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 5,
        paddingBottom: Platform.OS === 'android' ? hp(2) : hp(3),
    },
    filtersWrapper: {
        marginBottom: hp(1.5),
    },
    filterList: {
        paddingHorizontal: wp(5),
        gap: wp(3),
    },
    filterBubble: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: hp(0.8),
        paddingHorizontal: wp(3),
        borderRadius: ms(18),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        minWidth: ms(60),
    },
    filterBubbleActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterLabel: {
        color: Colors.white,
        fontSize: ms(10),
        fontWeight: '600',
        marginTop: 2,
    },
    filterLabelActive: {
        color: Colors.black,
        fontWeight: '700',
    },
    bottomControlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: wp(10),
        marginBottom: hp(1),
    },
    sideControlBtn: {
        width: ms(44),
        height: ms(44),
        borderRadius: ms(22),
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBtnActive: {
        backgroundColor: 'rgba(245, 197, 24, 0.25)',
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    shutterOuter: {
        width: ms(78),
        height: ms(78),
        borderRadius: ms(39),
        borderWidth: 4.5,
        borderColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterActive: {
        borderColor: Colors.primary,
    },
    shutterRecording: {
        borderColor: '#EF4444',
        transform: [{ scale: 1.15 }],
    },
    shutterInner: {
        width: ms(62),
        height: ms(62),
        borderRadius: ms(31),
        backgroundColor: Colors.white,
    },
    shutterInnerRecording: {
        backgroundColor: '#EF4444',
        borderRadius: ms(10),
        transform: [{ scale: 0.6 }],
    },
});

export default CameraScreen;
