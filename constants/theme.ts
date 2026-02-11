/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#516527';
const tintColorDark = '#718d34ff';

export const Colors = {
  light: {
    text: '#1E2019',
    numbers: '#616112ff',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#f0f0f0',
    button: '#516527',
    placeholder: '#C7C7CD',
    pickerActive: '#fff',
    blue: '#6E8898',
    pink: '#DBBEB7',
    olive: '#4e522fff',
    taupe: '#A36E51',
    wood: '#907162',
    yellow: '#9B892F'
  },
  dark: {
    text: '#ECEDEE',
    numbers: '#F0F0C9',
    background: '#1E2019',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: '#3B3E31',
    button: '#718d34ff',
    placeholder: '#636366',
    pickerActive: '#ECEDEE',
    blue: '#95A3B3',
    pink: '#DBBEB7',
    olive: '#858961',
    taupe: '#907162',
    wood: '#A36E51',
    yellow: '#9B892F',
    ellow: '#ffffffff'
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
