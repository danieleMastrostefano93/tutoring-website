Sostituisce il sito Angular con il progetto Astro locale aggiornato, mantenendo dominio Firebase, cronologia e workflow di pubblicazione. Il sito pubblica pagine statiche da `dist`; il workflow di master usa Firebase, l’anteprima PR usa la modalità demo. Entrambi usano Node.js 24.

Mantiene il meta tag Google e configura canonical, robots e sitemap sul dominio esistente. Le regole Firestore conservano gli invii Angular durante il passaggio e limitano i profili al proprietario; l’indice delle nuove recensioni è conservato. Regole e indici sono già stati distribuiti e verificati in produzione.

Validazione: `npm ci`, build produzione, 43 controlli delle regole nell’emulatore, navigazione Chromium delle pagine principali e invio Contatti al database reale (dato di prova rimosso). Home indicizzabile e sitemap corretta. Il sorgente Astro attuale non include login; Email/Password è attivo in Firebase.

Prima del merge: configurare/verificare FIREBASE_API_KEY e PRIVACY_URL nelle variabili Actions, verificare controlli e anteprima PR, confermare il rilascio senza login. Dettagli in `docs/RELEASE.md`, comprese le segnalazioni npm audit.
