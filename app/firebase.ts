import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAbfaau0zidV94U8HTTSBXzgLu4GZBBLIg",
  authDomain: "sohelmart-7e956.firebaseapp.com",
  projectId: "sohelmart-7e956",
  storageBucket: "sohelmart-7e956.firebasestorage.app",
  messagingSenderId: "440470435908",
  appId: "1:440470435908:web:98162b93934fbd9fcb6411",
  measurementId: "G-939NCE3JMD"
};

const app = initializeApp(firebaseConfig);

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const VAPID_KEY = "BCCxWiBzCSz6pkxtgsaBrRZOvj-HmqyRYh-WskWGm49_d43Nbg49vbk6jN1Hp07o-0TMMP_EPI5sDbAhrhlQXXU";

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted' && messaging) {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Notification permission error:', error);
    return null;
  }
}

export { onMessage };