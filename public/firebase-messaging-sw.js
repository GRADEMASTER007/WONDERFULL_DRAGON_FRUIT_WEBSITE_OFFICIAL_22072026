importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
const firebaseConfig = {
  apiKey: "AIzaSyDkAsX2kQblm18lNkLEp1vmGeaVH-1WZbo",
  authDomain: "wonderfuldf-firebase.firebaseapp.com",
  projectId: "wonderfuldf-firebase",
  storageBucket: "wonderfuldf-firebase.firebasestorage.app",
  messagingSenderId: "944064943609",
  appId: "1:944064943609:web:813102a380706639e85928",
  measurementId: "G-5BFHRDSP2K"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
