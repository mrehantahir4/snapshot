import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard mobile screen size (Base design)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// 1. Width Percentage (e.g. wp(50) = 50% screen width)
export const wp = (percentage) => {
    return (SCREEN_WIDTH * percentage) / 100;
};

// 2. Height Percentage (e.g. hp(20) = 20% screen height)
export const hp = (percentage) => {
    return (SCREEN_HEIGHT * percentage) / 100;
};

// 3. Width Scale (Padding, Margin, Width ke liye)
export const scale = (size) => {
    return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

// 4. Height Scale (Height aur Vertical Spacing ke liye)
export const verticalScale = (size) => {
    return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

// 5. Moderate Scale (Font size, Icons, aur Border Radius ke liye - taake bare phone par font bohot bara na ho)
export const ms = (size, factor = 0.5) => {
    return size + (scale(size) - size) * factor;
};

// Direct Dimensions
export { SCREEN_WIDTH, SCREEN_HEIGHT };
