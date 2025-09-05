// functions/index.js

const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {getMessaging} = require("firebase-admin/messaging");

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

/**
 * Funzione v2 che si attiva alla creazione di un nuovo sondaggio.
 * Invia una notifica push a TUTTI gli utenti che hanno un token FCM.
 */
exports.sendNewPollNotification = onDocumentCreated("polls/{pollId}", async (event) => {
  const pollData = event.data.data();
  console.log(`Nuovo sondaggio creato: ${pollData.title}`);

  const payload = {
    notification: {
      title: "Nuovo Sondaggio Disponibile!",
      body: `Partecipa al sondaggio: "${pollData.title}"`,
      icon: "/PWA-CONDO-APP/icons/icon-192x192.png",
    },
    webpush: {
      fcmOptions: {
        link: "https://riccardoponte.github.io/PWA-CONDO-APP/#sondaggi_elenco",
      },
    },
  };

  const tokensSnapshot = await db.collection("fcmTokens").get();
  if (tokensSnapshot.empty) {
    console.log("Nessun token FCM trovato. Notifica non inviata.");
    return null;
  }

  const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);
  console.log(`Invio notifica a ${tokens.length} dispositivi.`);
  
  if (tokens.length === 0) {
    console.log("Nessun token disponibile per l'invio");
    return null;
  }

  try {
    const response = await messaging.sendMulticast({
      tokens: tokens,
      notification: payload.notification,
      webpush: payload.webpush
    });
    console.log(`Notifiche inviate con successo: ${response.successCount}/${tokens.length}`);
    return response;
  } catch (error) {
    console.error("Errore nell'invio delle notifiche:", error);
    throw error;
  }
});

/**
 * Funzione v2 che si attiva alla creazione di una nuova segnalazione.
 * Invia una notifica push SOLO al destinatario della segnalazione.
 */
exports.sendNewReportNotification = onDocumentCreated("reports/{reportId}", async (event) => {
  const reportData = event.data.data();
  const recipientRole = reportData.recipientType;
  console.log(`Nuova segnalazione per il ruolo: ${recipientRole}`);

  const usersQuery = db.collection("users").where("tipoUtente", "==", recipientRole);
  const usersSnapshot = await usersQuery.get();
  if (usersSnapshot.empty) {
    console.log(`Nessun utente trovato con ruolo ${recipientRole}.`);
    return null;
  }
  const recipientUids = usersSnapshot.docs.map((doc) => doc.id);

  const tokensQuery = db.collection("fcmTokens").where("uid", "in", recipientUids);
  const tokensSnapshot = await tokensQuery.get();
  if (tokensSnapshot.empty) {
    console.log(`Nessun token FCM per gli utenti con ruolo ${recipientRole}.`);
    return null;
  }
  const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

  const payload = {
    notification: {
      title: "Nuova Segnalazione Ricevuta",
      body: `Hai ricevuto una nuova segnalazione: "${reportData.title}"`,
      icon: "/PWA-CONDO-APP/icons/icon-192x192.png",
    },
    webpush: {
      fcmOptions: {
        link: "https://riccardoponte.github.io/PWA-CONDO-APP/#segnalazioni_ricevute",
      },
    },
  };

  console.log(`Invio notifica a ${tokens.length} dispositivi per il ruolo ${recipientRole}.`);
  
  if (tokens.length === 0) {
    console.log("Nessun token disponibile per l'invio");
    return null;
  }

  try {
    const response = await messaging.sendMulticast({
      tokens: tokens,
      notification: payload.notification,
      webpush: payload.webpush
    });
    console.log(`Notifiche inviate con successo: ${response.successCount}/${tokens.length}`);
    return response;
  } catch (error) {
    console.error("Errore nell'invio delle notifiche:", error);
    throw error;
  }
});

/**
 * Funzione v2 che si attiva all'aggiornamento di una segnalazione.
 * Controlla se è stato aggiunto un sollecito e invia una notifica.
 */
exports.sendReminderNotification = onDocumentUpdated("reports/{reportId}", async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  if (beforeData.isUrgent !== true && afterData.isUrgent === true) {
    console.log(`Sollecito rilevato per la segnalazione: ${afterData.title}`);
    const recipientRole = afterData.recipientType;

    const usersQuery = db.collection("users").where("tipoUtente", "==", recipientRole);
    const usersSnapshot = await usersQuery.get();
    if (usersSnapshot.empty) return null;
    const recipientUids = usersSnapshot.docs.map((doc) => doc.id);

    const tokensQuery = db.collection("fcmTokens").where("uid", "in", recipientUids);
    const tokensSnapshot = await tokensQuery.get();
    if (tokensSnapshot.empty) return null;
    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

    const payload = {
      notification: {
        title: "⚠️ SOLLECITO RICEVUTO",
        body: `Hai ricevuto un sollecito per la segnalazione: "${afterData.title}"`,
        icon: "/PWA-CONDO-APP/icons/icon-192x192.png",
      },
      webpush: {
        fcmOptions: {
          link: "https://riccardoponte.github.io/PWA-CONDO-APP/#segnalazioni_urgenti",
        },
      },
    };

    console.log(`Invio sollecito a ${tokens.length} dispositivi per il ruolo ${recipientRole}.`);
    
    if (tokens.length === 0) {
      console.log("Nessun token disponibile per l'invio");
      return null;
    }

    try {
      const response = await messaging.sendMulticast({
        tokens: tokens,
        notification: payload.notification,
        webpush: payload.webpush
      });
      console.log(`Notifiche inviate con successo: ${response.successCount}/${tokens.length}`);
      return response;
    } catch (error) {
      console.error("Errore nell'invio delle notifiche:", error);
      throw error;
    }
  }
  return null;
});

/**
 * Funzione per pulire i token FCM invalidi
 * Questa funzione può essere chiamata periodicamente per rimuovere token scaduti
 */
exports.cleanupInvalidTokens = onDocumentCreated("cleanup/{cleanupId}", async (event) => {
  console.log("Avvio pulizia token FCM invalidi");
  
  try {
    const tokensSnapshot = await db.collection("fcmTokens").get();
    const invalidTokens = [];
    
    for (const tokenDoc of tokensSnapshot.docs) {
      const tokenData = tokenDoc.data();
      const token = tokenData.token;
      
      try {
        // Prova a inviare un messaggio di test per verificare se il token è valido
        await messaging.send({
          token: token,
          notification: {
            title: "Test",
            body: "Test di validità token"
          }
        }, true); // dry run
      } catch (error) {
        if (error.code === 'messaging/invalid-registration-token' || 
            error.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokenDoc.id);
          console.log(`Token invalido trovato: ${tokenDoc.id}`);
        }
      }
    }
    
    // Rimuovi i token invalidi
    if (invalidTokens.length > 0) {
      const batch = db.batch();
      invalidTokens.forEach(tokenId => {
        batch.delete(db.collection("fcmTokens").doc(tokenId));
      });
      await batch.commit();
      console.log(`Rimossi ${invalidTokens.length} token invalidi`);
    } else {
      console.log("Nessun token invalido trovato");
    }
    
    return { cleanedTokens: invalidTokens.length };
  } catch (error) {
    console.error("Errore durante la pulizia dei token:", error);
    throw error;
  }
});