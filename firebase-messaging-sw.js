// firebase-messaging-sw.js

// Importa gli script di Firebase (necessario per le notifiche)
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Inizializza l'app Firebase nel Service Worker
// IMPORTANTE: Questa configurazione DEVE essere presente anche qui
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

// Questo file è principalmente per l'inizializzazione.
// La logica di gestione delle notifiche in background (onBackgroundMessage)
// può rimanere nel tuo sw.js principale se preferisci, oppure puoi spostarla qui.
// Per ora, lasciamola in sw.js per mantenere le cose semplici.
// Firebase caricherà entrambi i service worker.

console.log("firebase-messaging-sw.js caricato e inizializzato.");
