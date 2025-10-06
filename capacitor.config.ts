import type { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'org.etnecosystem.radio.player',
  appName: 'ETN FM Player',
  webDir: '.',
  bundledWebRuntime: false,
  server: {
    cleartext: true
  }
};

export default config;
