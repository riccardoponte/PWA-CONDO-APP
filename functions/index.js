// Importa i moduli necessari con la nuova sintassi V2
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { initializeApp } = require("firebase-admin/app");
const logger = require("firebase-functions/logger");

// Inizializza l'app admin
initializeApp();

/**
 * Raccoglie tutti i token FCM validi da tutti gli utenti.
 */
async function getAllTokens() {
  const tokens = new Set();
  const db = getFirestore();
  const usersSnapshot = await db.collection("users").get();
  usersSnapshot.forEach((userDoc) => {
    const userData = userDoc.data();
    if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
      userData.fcmTokens.forEach((token) => tokens.add(token));
    }
  });
  return Array.from(tokens);
}

/**
 * Funzione triggerata alla creazione di una nuova comunicazione (sintassi V2).
 */
exports.sendNewCommunicationNotification = onDocumentCreated("communications/{commId}", async (event) => {
  const communication = event.data.data();
  const tokens = await getAllTokens();

  if (tokens.length === 0) {
    logger.info("Nessun token a cui inviare la notifica.");
    return null;
  }

  const payload = {
    notification: {
      title: "Nuova Comunicazione in Bacheca",
      body: communication.title,
      icon: "/PWA-CONDO-APP/icons/icon-192x192.png",
    },
    webpush: {
        fcmOptions: {
            link: "/PWA-CONDO-APP/index.html?page=bacheca_tutte",
        },
    },
  };

  logger.info(`Invio notifica per comunicazione a ${tokens.length} token.`);
  return getMessaging().sendToDevice(tokens, payload);
});

/**
 * Funzione triggerata alla creazione di un nuovo sondaggio (sintassi V2).
 */
exports.sendNewPollNotification = onDocumentCreated("polls/{pollId}", async (event) => {
  const poll = event.data.data();
  const tokens = await getAllTokens();

  if (tokens.length === 0) {
    logger.info("Nessun token per notifica sondaggio.");
    return null;
  }

  const payload = {
    notification: {
      title: "Nuovo Sondaggio Disponibile!",
      body: `È stato pubblicato il sondaggio: "${poll.title}"`,
      icon: "/PWA-CONDO-APP/icons/icon-192x192.png",
    },
    webpush: {
        fcmOptions: {
            link: "/PWA-CONDO-APP/index.html?page=sondaggi_elenco",
        },
    },
  };

  logger.info(`Invio notifica per sondaggio a ${tokens.length} token.`);
  return getMessaging().sendToDevice(tokens, payload);
});

/**
 * Funzione triggerata quando una segnalazione viene aggiornata (sintassi V2).
 */
exports.sendUrgentReportNotification = onDocumentUpdated("reports/{reportId}", async (event) => {
  const newValue = event.data.after.data();
  const previousValue = event.data.before.data();

  // Controlliamo se il campo 'isUrgent' è appena diventato 'true'
  if (newValue.isUrgent === true && previousValue.isUrgent !== true) {
    // Idealmente, qui invieresti solo ai manager. Per ora a tutti.
    const tokens = await getAllTokens(); 

    if (tokens.length === 0) {
      logger.info("Nessun token per notifica sollecito.");
      return null;
    }

    const payload = {
      notification: {
        title: "⚠️ Sollecito di Segnalazione",
        body: `È stato inviato un sollecito per: #${newValue.reportNumber || ""} ${newValue.title}`,
        icon: "/PWA-CONDO-APP/icons/icon-192x192.png",
      },
      webpush: {
        fcmOptions: {
            link: "/PWA-CONDO-APP/index.html?page=segnalazioni_urgenti",
        },
      },
    };

    logger.info(`Invio notifica per sollecito a ${tokens.length} token.`);
    return getMessaging().sendToDevice(tokens, payload);
  }

  return null;
});