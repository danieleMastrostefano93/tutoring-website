Sostituisce il sito Angular con il progetto Astro locale aggiornato, senza account come concordato. Mantiene il dominio Firebase, il meta tag Google, la cronologia e i workflow. Le pagine statiche vengono pubblicate da `dist`; Node.js 24 è usato sia per il live sia per l’anteprima PR, che usa il backend demo.

Aggiunge `/privacy/`, i link relativi nei moduli e nel footer e il consenso esplicito per la pubblicazione delle recensioni. L’informativa descrive i dati realmente inviati a Firestore. La bozza è esclusa dall’indicizzazione finché incompleta; il workflow live richiede che il titolare completi e confermi `src/lib/privacy-policy.json`.

Corregge le quattro voci high di npm audit aggiornando soltanto gRPC `1.9.16` → `1.14.7` mediante override circoscritto a Firestore. Firebase rimane `13.3.0`; audit dopo la modifica: zero vulnerabilità rilevate. Analisi di esposizione e limiti in `docs/DEPENDENCIES.md`.

Validazione: `npm ci`, build produzione e demo, 43 controlli delle regole nell’emulatore, compatibilità client Node/gRPC con operazioni effettive, Chromium sulle pagine principali e sulla privacy desktop/mobile, invio Contatti al database reale (dato di prova rimosso). Home indicizzabile e sitemap sul dominio esistente. Firestore già pubblicato e verificato; nessun nuovo deploy Firestore necessario.

Prima del merge: completare i dati dell’informativa, impostare/verificare `FIREBASE_API_KEY` e `PRIVACY_URL=/privacy/` nelle variabili Actions, attendere controlli verdi e verificare l’anteprima PR. Il merge è autorizzato solo dopo il completamento dell’informativa; non è necessario ripristinare login o account.
