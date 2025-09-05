// --- INIZIO FILE sw.js ---

// Definiamo un nome per la cache
const CACHE_NAME = 'condo-app-pwa-cache-v1';

// Elenco dei file fondamentali da salvare per il funzionamento offline
// IMPORTANTE: Ho già inserito il nome della tua repo qui.
const URLS_TO_CACHE = [
  '/PWA-CONDO-APP/',
  '/PWA-CONDO-APP/index.html',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Quando il service worker viene installato, apriamo la cache e salviamo i file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta e file salvati per uso offline');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  // Forza il nuovo service worker a diventare attivo subito
  self.skipWaiting();
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


// --- NUOVA SEZIONE PER LE NOTIFICHE PUSH ---

// Evento che si attiva quando arriva una notifica push dal server
self.addEventListener('push', event => {
  const data = event.data.json(); // Leggiamo i dati (titolo, corpo, ecc.)
  console.log('Push Recieved...');

  const options = {
    body: data.body,
    icon: data.icon, // L'icona che abbiamo definito nel backend
    badge: '/PWA-CONDO-APP/icons/icon-192x192.png' // Icona piccola per la barra di stato
  };

  // Mostra la notifica
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Evento che si attiva quando l'utente clicca sulla notifica
self.addEventListener('notificationclick', event => {
  console.log('Notification click Received.');

  event.notification.close(); // Chiude la notifica

  // Apre l'app (o la mette a fuoco se è già aperta)
  event.waitUntil(
    clients.openWindow('/PWA-CONDO-APP/')
  );
});

// --- FINE NUOVA SEZIONE ---

// --- FINE FILE sw.js ---
