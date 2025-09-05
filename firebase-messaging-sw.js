// firebase-messaging-sw.js

// Importa gli script Firebase (necessario per le notifiche)
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

const messaging = firebase.messaging();

// Gestione delle notifiche in background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Ricevuta notifica in background: ', payload);
  
  try {
    const notificationTitle = payload.notification?.title || 'Nuova notifica';
    const notificationBody = payload.notification?.body || '';
    const notificationIcon = payload.notification?.icon || '/PWA-CONDO-APP/icons/icon-192x192.png';
    const notificationUrl = payload.fcmOptions?.link || 'https://riccardoponte.github.io/PWA-CONDO-APP/';
    
    const notificationOptions = {
      body: notificationBody,
      icon: notificationIcon,
      badge: '/PWA-CONDO-APP/icons/icon-192x192.png',
      tag: 'condo-app-notification',
      requireInteraction: true,
      data: { 
        url: notificationUrl,
        payload: payload
      }
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Errore nella gestione della notifica:', error);
  }
});

// Gestione del click sulla notifica
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Click sulla notifica:', event);
    
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || 'https://riccardoponte.github.io/PWA-CONDO-APP/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Se c'è già una finestra aperta, portala in primo piano
                for (const client of clientList) {
                    if (client.url.includes('PWA-CONDO-APP') && 'focus' in client) {
                        return client.focus().then(() => {
                            if (urlToOpen !== client.url) {
                                return client.navigate(urlToOpen);
                            }
                        });
                    }
                }
                // Altrimenti apri una nuova finestra
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
            .catch((error) => {
                console.error('[firebase-messaging-sw.js] Errore nel gestire il click sulla notifica:', error);
            })
    );
});

// Installazione del Service Worker e caching dei file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta e file salvati per uso offline');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Intercettazione delle richieste di rete
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

