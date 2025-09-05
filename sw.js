// --- INIZIO BLOCCO AGGIORNATO ---

// Importiamo gli script di Firebase (usiamo la versione 'compat' per semplicità nel Service Worker)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Inizializziamo Firebase nel Service Worker
const firebaseConfig = {
    apiKey: "AIzaSyCrLAomryfk-0s5Inm2XOsBrJusgmMI87E",
    authDomain: "condo-app-49255.firebaseapp.com",
    projectId: "condo-app-49255",
    storageBucket: "condo-app-49255.appspot.com",
    messagingSenderId: "485319278595",
    appId: "1:485319278595:web:2997689b234fbba4dece36",
    measurementId: "G-2SM3DH41EZ"
};

firebase.initializeApp(firebaseConfig);

// Inizializziamo il servizio di messaggistica
const messaging = firebase.messaging();

// Gestore per le notifiche ricevute quando l'app è in background o chiusa
messaging.onBackgroundMessage(function(payload) {
    console.log('[sw.js] Ricevuto messaggio in background. ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/Con-bridge/icons/icon-192x192.png' // Icona da mostrare nella notifica
    };

    // Mostriamo la nostra notifica al sistema operativo
    self.registration.showNotification(notificationTitle, notificationOptions);
});


// --- LOGICA PWA ESISTENTE (Caching) ---

const CACHE_NAME = 'condo-app-pwa-cache-v1';
const URLS_TO_CACHE = [
  '/Con-bridge/',
  '/Con-bridge/index.html',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta e file salvati per uso offline');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// --- FINE BLOCCO AGGIORNATO ---

