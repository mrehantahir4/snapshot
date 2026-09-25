import React, { useState, useEffect, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    StatusBar,
    Platform,
    PermissionsAndroid,
    ActivityIndicator,
    Dimensions,
    Linking,
} from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { createThumbnail } from 'react-native-create-thumbnail';
import Video from 'react-native-video';
import Ionicons from '@react-native-vector-icons/ionicons';
import Colors from '../theme/color';
import { wp, hp, ms } from '../utils/responsive';

const { width } = Dimensions.get('window');
const COLUMN_SIZE = width / 3 - 2;

// Dedicated item component with video thumbnail generation
const MediaItem = memo(({ item, onPress }) => {
    const [thumbUri, setThumbUri] = useState(null);

    useEffect(() => {
        let isMounted = true;
        if (item.isVideo) {
            createThumbnail({
                url: item.uri,
                timeStamp: 1000,
            })
                .then((res) => {
                    if (isMounted && res?.path) {
                        setThumbUri(res.path);
                    }
                })
                .catch(() => {
                    // Fallback to placeholder if thumbnail extraction fails
                });
        }
        return () => {
            isMounted = false;
        };
    }, [item.uri, item.isVideo]);

    const formatDuration = (sec) => {
        if (!sec) return '';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (item.isVideo) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.imageWrapper}
                onPress={() => onPress({ ...item, thumbUri })}>
                {thumbUri ? (
                    <Image source={{ uri: thumbUri }} style={styles.thumbnail} />
                ) : (
                    <View style={[styles.thumbnail, styles.videoPlaceholder]}>
                        <Ionicons name="videocam" size={ms(26)} color={Colors.primary} />
                    </View>
                )}
                <View style={styles.videoBadge}>
                    <Ionicons name="play" size={ms(10)} color={Colors.white} />
                    {item.playableDuration ? (
                        <Text style={styles.videoDuration}>{formatDuration(item.playableDuration)}</Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={styles.imageWrapper}
            onPress={() => onPress(item)}>
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
        </TouchableOpacity>
    );
});

const GalleryScreen = ({ navigation }) => {
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Photos' | 'Videos'

    // Photos + Videos Permissions
    const requestGalleryPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                if (Platform.Version >= 33) {
                    const statuses = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                    ]);
                    const imgGranted =
                        statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
                        PermissionsAndroid.RESULTS.GRANTED;
                    const vidGranted =
                        statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
                        PermissionsAndroid.RESULTS.GRANTED;

                    return { imgGranted, vidGranted, hasAny: imgGranted || vidGranted };
                } else {
                    const status = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                    );
                    const granted = status === PermissionsAndroid.RESULTS.GRANTED;
                    return { imgGranted: granted, vidGranted: granted, hasAny: granted };
                }
            } catch (err) {
                console.warn('Permission error:', err);
                return { imgGranted: false, vidGranted: false, hasAny: false };
            }
        }
        return { imgGranted: true, vidGranted: true, hasAny: true };
    };

    // Fetch both Photos and Videos
    const loadGalleryMedia = async (tab = 'All') => {
        setLoading(true);
        const perm = await requestGalleryPermission();
        if (!perm.hasAny) {
            setHasPermission(false);
            setLoading(false);
            return;
        }
        setHasPermission(true);

        try {
            const result = await CameraRoll.getPhotos({
                first: 500,
                assetType: tab, // 'All' | 'Photos' | 'Videos'
                include: ['playableDuration', 'fileExtension', 'filename'],
            });

            const mapped = result.edges.map((edge, index) => {
                const mime = edge.node.type?.toLowerCase() || '';
                const ext = edge.node.image.extension?.toLowerCase() || '';
                const duration = edge.node.image.playableDuration;
                const isVideo =
                    mime.startsWith('video') ||
                    (duration != null && duration > 0) ||
                    ['mp4', 'mov', '3gp', 'mkv', 'webm', 'ts'].includes(ext);

                return {
                    id: edge.node.id || `${edge.node.image.uri}_${index}`,
                    uri: edge.node.image.uri,
                    width: edge.node.image.width,
                    height: edge.node.image.height,
                    playableDuration: duration,
                    type: edge.node.type,
                    isVideo,
                };
            });

            setMediaList(mapped);
        } catch (error) {
            console.log('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGalleryMedia(activeTab);
    }, [activeTab]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            {/* Top Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
                    <Ionicons name="arrow-back" size={ms(24)} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Memories & Gallery</Text>
                <View style={{ width: ms(24) }} />
            </View>

            {/* Filter Tabs (All, Photos, Videos) */}
            <View style={styles.tabsRow}>
                {['All', 'Photos', 'Videos'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                        onPress={() => setActiveTab(tab)}>
                        <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Media Grid */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading Media...</Text>
                </View>
            ) : !hasPermission || mediaList.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="images-outline" size={ms(60)} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>
                        {!hasPermission
                            ? 'Photos/Videos permission is required to view your gallery.'
                            : `No ${activeTab.toLowerCase()} found.`}
                    </Text>
                    <View style={styles.actionBtnRow}>
                        <TouchableOpacity style={styles.retryBtn} onPress={() => loadGalleryMedia(activeTab)}>
                            <Text style={styles.retryText}>Grant Permission</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.settingsBtn} onPress={() => Linking.openSettings()}>
                            <Text style={styles.settingsText}>App Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={mediaList}
                    keyExtractor={(item) => item.id || item.uri}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={15}
                    maxToRenderPerBatch={15}
                    windowSize={5}
                    renderItem={({ item }) => (
                        <MediaItem item={item} onPress={setSelectedMedia} />
                    )}
                />
            )}

            {/* Full Screen Media Preview Modal */}
            {selectedMedia && (
                <View style={styles.previewModal}>
                    <TouchableOpacity
                        style={styles.closePreviewBtn}
                        onPress={() => setSelectedMedia(null)}>
                        <Ionicons name="close" size={ms(28)} color={Colors.white} />
                    </TouchableOpacity>

                    {selectedMedia.isVideo ? (
                        <View style={styles.videoPreviewBox}>
                            <Video
                                source={{ uri: selectedMedia.uri }}
                                style={styles.fullImage}
                                resizeMode="contain"
                                repeat={true}
                                controls={true}
                                paused={false}
                            />
                        </View>
                    ) : (
                        <Image
                            source={{ uri: selectedMedia.uri }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : hp(5),
        paddingBottom: hp(1.2),
        backgroundColor: '#0B0B0E',
    },
    backBtn: {
        padding: ms(4),
    },
    headerTitle: {
        color: Colors.white,
        fontSize: ms(18),
        fontWeight: '700',
    },
    tabsRow: {
        flexDirection: 'row',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.2),
        backgroundColor: '#0B0B0E',
        gap: wp(2.5),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    tabBtn: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.6),
        borderRadius: ms(16),
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    tabBtnActive: {
        backgroundColor: Colors.primary,
    },
    tabBtnText: {
        color: Colors.textSecondary,
        fontSize: ms(13),
        fontWeight: '600',
    },
    tabBtnTextActive: {
        color: Colors.black,
        fontWeight: '700',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(8),
    },
    loadingText: {
        color: Colors.textSecondary,
        fontSize: ms(14),
        marginTop: hp(1.5),
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: ms(14),
        textAlign: 'center',
        marginTop: hp(1.5),
    },
    actionBtnRow: {
        flexDirection: 'row',
        gap: wp(3),
        marginTop: hp(2),
    },
    retryBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: wp(4.5),
        paddingVertical: hp(1.2),
        borderRadius: ms(10),
    },
    retryText: {
        color: Colors.black,
        fontWeight: '700',
        fontSize: ms(13),
    },
    settingsBtn: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: wp(4.5),
        paddingVertical: hp(1.2),
        borderRadius: ms(10),
    },
    settingsText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: ms(13),
    },
    imageWrapper: {
        width: COLUMN_SIZE,
        height: COLUMN_SIZE,
        margin: 1,
        position: 'relative',
        backgroundColor: '#16161A',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        backgroundColor: '#1E1E22',
    },
    videoPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#18181C',
    },
    videoBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.7)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    videoDuration: {
        color: Colors.white,
        fontSize: ms(10),
        fontWeight: '700',
    },
    previewModal: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.95)',
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closePreviewBtn: {
        position: 'absolute',
        top: hp(5),
        right: wp(5),
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: ms(6),
        borderRadius: ms(20),
    },
    videoPreviewBox: {
        width: '100%',
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    videoPlaceholderLarge: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111114',
    },
    playIconCircle: {
        position: 'absolute',
        width: ms(70),
        height: ms(70),
        borderRadius: ms(35),
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoLabel: {
        position: 'absolute',
        bottom: hp(4),
        color: Colors.white,
        fontSize: ms(14),
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.6),
        borderRadius: ms(12),
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
});

export default GalleryScreen;
