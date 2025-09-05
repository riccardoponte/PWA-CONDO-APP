// Questo file gestisce le notifiche in background.
// NON rinominarlo e NON spostarlo dalla root.

// Importiamo gli script di Firebase
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Inizializza l'app Firebase nel Service Worker
// Le tue credenziali sono già nel codice principale, ma qui sono necessarie
// per il funzionamento in background.
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

// Gestore per quando arriva una notifica push in background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Ricevuto messaggio in background: ', payload);

  // Estraiamo i dati dalla notifica per personalizzarla
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/PWA-CONDO-APP/icons/icon-192x192.png', // Usa un'icona dalla tua PWA
    badge: '/PWA-CONDO-APP/icons/icon-192x192.png', // Icona per Android
    data: {
        url: payload.data.url || '/PWA-CONDO-APP/' // URL da aprire al click
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestore per il click sulla notifica
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Chiude la notifica

    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Se c'è già una finestra aperta, la mette in primo piano
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Altrimenti, apre una nuova finestra
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});