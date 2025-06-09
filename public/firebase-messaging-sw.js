importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCNbBFu-K9eFd603oEdMZs38x0trCEMz2s",
  authDomain: "detector-gas-v2.firebaseapp.com",
  projectId: "detector-gas-v2",
  storageBucket: "detector-gas-v2.appspot.com",
  messagingSenderId: "701808955147",
  appId: "1:701808955147:web:72de4d2ffc85142fa35c0e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Notificación recibida:", payload);
  const notificationTitle = payload.notification?.title || "⚠️ Alerta de Gas";
  const notificationOptions = {
    body: payload.notification?.body || "Se ha detectado una posible fuga de gas.",
    icon: "/icon.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
