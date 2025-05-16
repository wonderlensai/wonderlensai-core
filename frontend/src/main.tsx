import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Force standalone mode prompt and viewport meta
const isStandalone = (window.matchMedia('(display-mode: standalone)').matches ||
  // @ts-ignore: Property 'standalone' is non-standard (iOS Safari)
  (typeof navigator !== 'undefined' && (navigator as any).standalone === true));
if (!isStandalone) {
  localStorage.setItem('pwaUrl', window.location.href);
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    alert("Please install this app by clicking the share button and selecting 'Add to Home Screen'");
  } else {
    alert("Install this app by clicking the menu button and selecting 'Install App' or 'Add to Home Screen'");
  }
}
window.addEventListener('load', () => {
  // Remove any existing viewport meta tag
  const existingViewport = document.querySelector('meta[name=viewport]');
  if (existingViewport) {
    existingViewport.remove();
  }
  // Create a new one with the correct settings
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui, viewport-fit=cover';
  document.head.appendChild(meta);

  // Add iOS specific meta tags
  const appleCapable = document.createElement('meta');
  appleCapable.name = 'apple-mobile-web-app-capable';
  appleCapable.content = 'yes';
  document.head.appendChild(appleCapable);

  const appleStatusBar = document.createElement('meta');
  appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
  appleStatusBar.content = 'black-translucent';
  document.head.appendChild(appleStatusBar);

  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
  if ('caches' in window) {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
