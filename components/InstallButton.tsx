'use client';
import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // ব্রাউজারের নিজের পপ-আপ বন্ধ রাখা
      e.preventDefault();
      // ইভেন্টটি সেভ করে রাখা
      setDeferredPrompt(e);
      // বাটনটি দেখানো
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      // ইউজারের সামনে ইনস্টল অপশন নিয়ে আসা
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setIsVisible(false);
      });
    }
  };

  // যদি ইনস্টল করা সম্ভব না হয় তবে কিছু দেখাবে না
  if (!isVisible) return null;

  return (
    <div 
      style={{ 
        background: '#db2777', 
        color: '#fff', 
        padding: '8px 5px', 
        textAlign: 'center', 
        cursor: 'pointer', 
        fontSize: '13px', 
        fontWeight: 'bold', 
        borderBottom: '1px solid #ffffff',
        width: '100%',
        position: 'relative',
        zIndex: 9999
      }} 
      onClick={handleInstall}
    >
      সোহেল মার্ট অ্যাপটি ডাউনলোড করতে এখানে ক্লিক করুন (Install)
    </div>
  );
}