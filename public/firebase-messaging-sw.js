importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAbfaau0zidV94U8HTTSBXzgLu4GZBBLIg",
  authDomain: "sohelmart-7e956.firebaseapp.com",
  projectId: "sohelmart-7e956",
  storageBucket: "sohelmart-7e956.firebasestorage.app",
  messagingSenderId: "440470435908",
  appId: "1:440470435908:web:98162b93934fbd9fcb6411"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body: body,
    icon: '/icon.png',
  });
});