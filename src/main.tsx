import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-register service worker for offline support and PWA installability
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New app version available.');
  },
  onOfflineReady() {
    console.log('App is ready to work offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
