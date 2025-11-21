import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.attendmate.app',
  appName: 'AttendMate',
  webDir: 'dist',

  // We control StatusBar completely via JavaScript in App.tsx
  // So leave it empty here → no conflicts!
  plugins: {
    StatusBar: {}
  }
};

export default config;