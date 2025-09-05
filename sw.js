// Definiamo un nome per la cache
const CACHE_NAME = 'condo-app-pwa-cache-v1';

// Elenco dei file fondamentali da salvare per il funzionamento offline
// IMPORTANTE: Percorso aggiornato con il nome della tua nuova repo.
const URLS_TO_CACHE = [
  '/Con-bridge/',
  '/Con-bridge/index.html',
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
});

// Quando l'app richiede un file, intercettiamo la richiesta
self.addEventListener('fetch', event => {
  event.respondWith(
    // Controlliamo se il file è già nella nostra cache
    caches.match(event.request)
      .then(response => {
        // Se c'è, lo restituiamo dalla cache (velocissimo e offline!)
        // Altrimenti, lo chiediamo alla rete normalmente
        return response || fetch(event.request);
      })
  );

});
