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

## Completamento su GitHub

Non sono disponibili credenziali GitHub nel contesto di esecuzione. Il clone pubblico è riuscito; variabili Actions, push, PR, controlli, anteprima e merge richiedono autenticazione con permessi sul repository.

1. Autenticare GitHub CLI con `gh auth login` e configurare Git con `gh auth setup-git`.
2. Impostare `FIREBASE_API_KEY` nelle variabili Actions usando `apiKey` della configurazione SDK dell’app Web `1:870834974460:web:bce395908569695b33b179` (verificata tramite Firebase Management API). Conservare `PRIVACY_URL` se già esiste; altrimenti chiedere l’URL al proprietario. Nel progetto corrente non è presente un URL privacy.
3. Eseguire `git push -u origin nuovo-sito-astro`.
4. Aprire la PR con base **master**: `gh pr create --base master --head nuovo-sito-astro --title "Sostituisci il sito Angular con Astro" --body-file docs/PR_BODY.md`.
5. Verificare i controlli GitHub Actions e aprire l’anteprima Firebase generata dalla PR. La build PR usa `PUBLIC_BACKEND=demo` e non salva dati reali.
6. Risolvere il requisito account: il progetto sorgente è esplicitamente senza login. Concordare questa versione o implementare il login prima del merge se ancora richiesto.
7. Con controlli verdi e anteprima verificata, fare merge su `master` e attendere il workflow Hosting live. Verificare nuovamente Home, sitemap, Contatti e l’eventuale login.

Non è stato effettuato alcun deploy Hosting diretto. La Home pubblica attuale risponde HTTP 200 con titolo `Tutor Online` (versione precedente).

## Dipendenze

`npm audit` segnala quattro voci high nella catena Firebase → Firestore → gRPC. Il report propone un downgrade major di Firebase; non è stato applicato automaticamente per non cambiare il progetto sorgente. Il client del sito importa Firestore Lite; le segnalazioni gRPC riguardano dipendenze per Node. Il risultato dell’audit non equivale a una verifica di sicurezza completa.
