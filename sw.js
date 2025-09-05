// sw.js

// Importa gli script di Firebase (necessario per le notifiche)
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Definiamo un nome per la cache
const CACHE_NAME = 'condo-app-pwa-cache-v1';

// Elenco dei file fondamentali da salvare per il funzionamento offline
const URLS_TO_CACHE = [
  '/PWA-CONDO-APP/',
  '/PWA-CONDO-APP/index.html',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Inizializza l'app Firebase nel Service Worker
// IMPORTANTE: Usa la configurazione "compat" per gli script importati
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

// Recupera un'istanza di Firebase Messaging per gestire le notifiche in background
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Ricevuta notifica in background: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/PWA-CONDO-APP/icons/icon-192x192.png', // Usa il percorso corretto
    data: {
        url: payload.fcmOptions.link // L'URL da aprire al click
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestione del click sulla notifica
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Chiude la notifica
    const urlToOpen = event.notification.data.url;
    
    event.waitUntil(
        clients.openWindow(urlToOpen)
    );
});


// Quando il service worker viene installato, apriamo la cache e salviamo i file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta e file salvati per uso offline');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Quando l'app richiede un file, intercettiamo la richiesta
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
