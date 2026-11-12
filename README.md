# TutorOnline

Sito di Daniele Mastrostefano per le ripetizioni online di matematica, fisica e informatica. Realizzato con Astro 7 e Firebase Firestore, senza registrazione o login utenti.

## Avvio in IntelliJ

Apri la cartella che contiene `package.json` e usa Node.js 24 (`.nvmrc`).

```bash
npm ci
npm run dev
```

L'anteprima è normalmente disponibile su `http://localhost:4321/`. Il file locale `.env` è già configurato per Firebase; i moduli salvano dati reali. Il file è escluso da Git. Per configurare una nuova copia del progetto, parti da `.env.example`: la modalità `demo` simula gli invii senza salvare dati.

```bash
npm run build
npm run preview
```

Il build rigenera `dist/` con la versione corrente del sito. `node_modules/`, `.astro/` e `dist/` sono cartelle generate e sono escluse da Git.

## Struttura

| File o cartella | Contenuto |
| --- | --- |
| `src/components/` | Contenuto delle pagine |
| `src/layouts/Site.astro` | Intestazione, menu, footer e metadati |
| `src/styles/site.css` | Stile e layout responsive |
| `src/lib/site-data.js` | Metadati, tariffe, materie e livelli |
| `src/lib/site-client.js` | Menu, moduli, stelle e visualizzazione recensioni |
| `src/lib/firebase-backend.js` | Salvataggio e lettura da Firestore |
| `src/lib/site-meta.js` | URL canonici e indicizzazione |
| `public/assets/` | Immagini, font e relative licenze |
| `firestore.rules` | Regole dei messaggi e delle recensioni |
| `firestore.indexes.json` | Indice delle recensioni approvate per data |
| `scripts/check-firestore-rules.mjs` | Verifiche delle regole nell'emulatore |

Le pagine sono `/`, `/info/`, `/prezzi/`, `/contatti/`, `/tutte-recensioni/` e `/recensioni/`. Le tariffe rimandano al modulo Contatti tramite un unico pulsante.

## Firebase

Il progetto associato è `tutor-website-717e5`, indicato anche in `.firebaserc`. Il database è Firestore `(default)`.

- `tutoronlineContacts`: messaggi con nome, email, livello scolastico, telefono facoltativo, testo, eventuali riferimenti a materia e pacchetto, data server. Dal sito è consentito soltanto inviare messaggi validi; i messaggi si consultano nella console Firebase.
- `tutoronlineReviews`: nome o iniziali facoltativi, voto da 1 a 5, commento fino a 150 caratteri, stato e data server. Le recensioni nascono con `status: pending`. Il sito legge soltanto quelle approvate, mostrando le 30 più recenti, le stelle e la relativa media.

Le collection vengono create automaticamente al primo invio. Le regole mantengono gli invii validati e la lettura delle recensioni Angular (`Contatti`, `recensioni`) durante il passaggio. `users/{uid}` e `tutoronlineProfiles/{uid}` sono privati e accessibili solo al proprietario autenticato. Non esistono permessi generali per utenti autenticati. Le regole effettive sono state lette tramite Firebase Rules API prima della modifica; l’indice in produzione è già READY e viene conservato. Il sito Astro attuale non include login o profili.

### Approvare una recensione

1. Apri [Firestore nella console Firebase](https://console.firebase.google.com/project/tutor-website-717e5/firestore).
2. Seleziona `tutoronlineReviews` e il documento da controllare.
3. Cambia il campo stringa `status` da `pending` a `approved` e salva.
4. Ricarica la pagina Recensioni. Per nascondere una recensione, reimposta `status` a `pending`.

### Verifiche locali

Installa Java 21 o successivo, quindi esegui:

```bash
npm run test:rules
```

Il controllo avvia l'emulatore su `127.0.0.1:8080` e usa soltanto il progetto dimostrativo `demo-tutoronline`, senza scrivere sul database reale. Per provare anche i moduli nell'anteprima, imposta temporaneamente `PUBLIC_BACKEND=emulator` in `.env`, avvia l'emulatore e riavvia il server di sviluppo:

```bash
npx --yes firebase-tools@15.36.0 emulators:start --only firestore --project demo-tutoronline
```

### Pubblicare

Il login CLI autorizza l'account proprietario a distribuire la configurazione; non introduce un login nel sito.

```bash
npx --yes firebase-tools@15.36.0 login
npx --yes firebase-tools@15.36.0 deploy --only firestore:rules,firestore:indexes --project tutor-website-717e5
```

Per pubblicare anche il sito, imposta `SITE_URL` in `.env` con il dominio effettivo, poi:

```bash
npm run build
npx --yes firebase-tools@15.36.0 deploy --only hosting --project tutor-website-717e5
```

`SITE_URL` attiva URL canonici, sitemap e indicizzazione nella modalità Firebase. La configurazione pubblica Firebase richiede `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_PROJECT_ID` e `PUBLIC_FIREBASE_APP_ID`. `PUBLIC_FIREBASE_APP_CHECK_KEY` è facoltativo e abilita App Check con reCAPTCHA Enterprise quando configurato sul progetto.
