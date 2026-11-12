# Rilascio Astro — 12 novembre 2026

Sorgente: copia del progetto locale `TutorOnline_Progetto`, incluse le modifiche non versionate. Repository derivato da `master`, branch `nuovo-sito-astro`. La cartella sorgente non è stata modificata.

## Verifiche completate

- `npm ci` e build di produzione con Node.js 24.22.2 e SDK dell’app Firebase esistente.
- Home indicizzabile, canonical corretto, `robots.txt` aperto e cinque URL della sitemap sul dominio `https://tutor-website-717e5.web.app`.
- Meta tag Google recuperato con `git show origin/master:src/index.html` e mantenuto.
- Chromium: Home, Info, Prezzi, Contatti, elenco recensioni, invio recensioni e sitemap rispondono correttamente nella build locale di produzione, senza errori JavaScript.
- Invio del modulo Contatti dalla build locale al database reale riuscito. Documento di prova verificato e rimosso.
- Firebase Authentication: Email/Password attivo, password richiesta. Il progetto Astro corrente non contiene login; nessun accesso con credenziali utente è stato provato.
- Regole e indici letti dalle API effettive della produzione prima della modifica. Le regole pubblicate erano già quelle Astro, senza regola generale per utenti autenticati. Il file del vecchio repository aveva invece una regola generale e non è stato usato come riferimento della produzione.
- 43 controlli nell’emulatore: validazione contatti e recensioni, compatibilità con i moduli Angular, profili privati e divieto di accesso ad altre raccolte.
- Deploy eseguito con `npx --yes firebase-tools@15.36.0 deploy --only firestore --project tutor-website-717e5`. Regole pubblicate confrontate con il file locale; indice recensioni esistente conservato e READY.

## Completamento su GitHub e aggiornamento privacy

Il proprietario ha confermato il rilascio **senza account**. GitHub CLI è autenticata come `danieleMastrostefano93`. Le variabili Actions `FIREBASE_API_KEY` (dal valore SDK verificato) e `PRIVACY_URL=/privacy/` sono state impostate. Il secret Firebase del workflow è presente.

1. Impostare la variabile Actions `FIREBASE_API_KEY` con `apiKey` della configurazione SDK dell’app Web esistente (già verificata tramite Firebase Management API) e `PRIVACY_URL=/privacy/`.
2. Fare push di `nuovo-sito-astro` e aprire la PR con base **master** usando `docs/PR_BODY.md`.
3. Controllare Actions e l’anteprima Firebase della PR (backend demo).
4. Completare `src/lib/privacy-policy.json` con i dati confermati dal titolare. Il titolare ha confermato nome, email e conservazione di un mese per contatti e recensioni. Il titolare ha indicato come recapito territoriale `00049 Velletri (RM), Italia` e confermato la cancellazione manuale entro un mese. L’informativa è completa. Le API confermano regione `eur3`, nessun backup o pianificazione, PITR disattivato e finestra di versionamento di un’ora. Il workflow live esegue `npm run check:release` e fallisce finché questi dati non sono completi. La bozza privacy è comunque inclusa nella build e nell’anteprima, con `noindex`; una volta completa entrerà nella sitemap automaticamente.
5. Con informativa completa e controlli verdi, verificare ancora anteprima e poi fare merge. Attendere il workflow Hosting e verificare Home, `/privacy/`, `/sitemap.xml` e invio Contatti sul dominio esistente.

Le quattro voci high del primo audit sono risolte: vedere `docs/DEPENDENCIES.md`. Il sorgente originale resta intatto; le modifiche sono nel clone di rilascio.

Non è stato effettuato alcun deploy Hosting diretto. La Home pubblica attuale risponde HTTP 200 con titolo `Tutor Online` (versione precedente).
