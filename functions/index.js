// Importa i moduli necessari di Firebase (sintassi aggiornata)
const {onDocumentCreated} = require("firebase-functions/v2/firestore"); // <-- MODIFICATO
const {setGlobalOptions} = require("firebase-functions/v2"); // <-- MODIFICATO
const admin = require("firebase-admin");

// Inizializza l'SDK di Firebase Admin
admin.initializeApp();

// Imposta la regione globalmente per tutte le funzioni in questo file
setGlobalOptions({region: "europe-west1"}); // <-- MODIFICATO

/**
 * Cloud Function che si attiva alla creazione di un nuovo documento
 * nella collection 'reports'.
 */
// La definizione della funzione ora usa onDocumentCreated
exports.sendNotificationOnNewReport = onDocumentCreated("reports/{reportId}", async (event) => { // <-- MODIFICATO
  // 'event.data' contiene lo snapshot del documento
  const snap = event.data;
  if (!snap) {
    console.log("Nessun dato associato all'evento.");
    return;
  }
  const report = snap.data();
  console.log("Nuova segnalazione creata:", report.title);

  const recipientRole = report.recipientType;
  if (!recipientRole) {
    console.log("Nessun destinatario specificato nella segnalazione.");
    return;
  }

  const usersSnapshot = await admin.firestore().collection("users")
      .where("tipoUtente", "==", recipientRole).get();

  if (usersSnapshot.empty) {
    console.log("Nessun utente trovato con il ruolo:", recipientRole);
    return;
  }

  const tokens = [];
  usersSnapshot.forEach((doc) => {
    const userTokens = doc.data().fcmTokens;
    if (userTokens && Array.isArray(userTokens)) {
      tokens.push(...userTokens);
    }
  });

  if (tokens.length === 0) {
    console.log("Nessun token FCM trovato per gli utenti destinatari.");
    return;
  }

  const payload = {
    notification: {
      title: "Nuova Segnalazione Ricevuta!",
      body: `(#${report.reportNumber}) ${report.title}`,
      icon: "/Con-bridge/icons/icon-192x192.png",
      click_action: "/Con-bridge/",
    },
  };

  console.log(
      `Invio di ${tokens.length} notifiche per la segnalazione:`,
      report.title,
  );

  return admin.messaging().sendToDevice(tokens, payload);
});

/**
 * Esempio per una notifica alla creazione di un nuovo sondaggio.
 */
exports.sendNotificationOnNewPoll = onDocumentCreated("polls/{pollId}", async (event) => { // <-- MODIFICATO
  const snap = event.data;
  if (!snap) {
    console.log("Nessun dato associato all'evento.");
    return;
  }
  const poll = snap.data();
  console.log("Nuovo sondaggio creato:", poll.title);

  const usersSnapshot = await admin.firestore().collection("users").get();

  const tokens = [];
  usersSnapshot.forEach((doc) => {
    const user = doc.data();
    if (user.tipoUtente !== "fornitore" && user.fcmTokens) {
      tokens.push(...user.fcmTokens);
    }
  });

  if (tokens.length === 0) {
    return;
  }

  const payload = {
    notification: {
      title: "Nuovo Sondaggio Disponibile!",
      body: poll.title,
      icon: "/Con-bridge/icons/icon-192x192.png",
      click_action: "/Con-bridge/",
    },
  };

  console.log(
      `Invio di ${tokens.length} notifiche per il sondaggio:`,
      poll.title,
  );
  return admin.messaging().sendToDevice(tokens, payload);
});