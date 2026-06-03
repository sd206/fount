import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Fount',
  slug: 'fount',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1D9E75',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'app.fount.mobile',
  },
  android: {
    package: 'app.fount.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1D9E75',
    },
  },
  extra: {
    eas: { projectId: 'YOUR_EAS_PROJECT_ID' },
  },
  plugins: ['expo-router', 'expo-camera', 'expo-av'],
});
