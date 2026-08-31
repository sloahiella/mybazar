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
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsVisible(false);
        }
        setDeferredPrompt(null);
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button 
      onClick={handleInstall}
      style={{
        background: '#db2777', // গোলাপি কালার
        color: 'white',
        border: 'none',
        borderRadius: '50px', // রাউন্ড ডিজাইন
        padding: '5px 12px',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        display: 'inline-block',
        marginLeft: '10px' // লোগো থেকে একটু দূরে সরাতে
      }}
    >
      অ্যাপ ইনস্টল 📲
    </button>
  );
}