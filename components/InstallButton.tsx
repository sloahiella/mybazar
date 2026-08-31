'use client';
import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => { setDeferredPrompt(null); setIsVisible(false); });
    }
  };

  if (!isVisible) return null;

  return (
    <button 
      onClick={handleInstall}
      style={{
        background: '#fff',
        color: '#be185d',
        border: 'none',
        borderRadius: '20px',
        padding: '5px 12px',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        whiteSpace: 'nowrap'
      }}
    >
      Install App 📲
    </button>
  );
}