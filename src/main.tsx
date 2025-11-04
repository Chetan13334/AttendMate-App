// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { setupIonicReact } from '@ionic/react';
import { StatusBar, Style } from '@capacitor/status-bar';

setupIonicReact();

// SET STATUS BAR TO LIGHT (WHITE BG, DARK TEXT)
const setStatusBar = async () => {
  if (window.capacitor) {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });
  }
};

setStatusBar();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);