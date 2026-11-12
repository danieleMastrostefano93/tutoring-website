# Notifiche TutorOnline con Apps Script autonomo

Questa soluzione sostituisce il piano Cloud Functions: non richiede Functions, Cloud Scheduler, estensioni Firebase, account di servizio, chiavi private, API key o passaggio a Blaze. Il sito continua a inviare i documenti come prima. I due soli file da copiare in Apps Script sono `Code.gs` e `appsscript.json`; questa cartella non è importata dal sito né inclusa nella sua build.

## Schema verificato nel clone GitHub aggiornato

Verifica del 12 novembre 2026: clone di `danieleMastrostefano93/tutoring-website`, branch di rilascio **master**, commit `0aafe5534bf6a7ab62bf2f185029c75b08abbb0c` (merge PR #5). Attenzione: il branch predefinito `main` contiene ancora la vecchia versione. Fonti: [backend aggiornato](https://github.com/danieleMastrostefano93/tutoring-website/blob/0aafe5534bf6a7ab62bf2f185029c75b08abbb0c/src/lib/firebase-backend.js#L48), `firestore.rules`, `README.md` dello stesso commit.

| Tipo | Raccolta attiva | Data | Comportamento |
| --- | --- | --- | --- |
| Contatto | `tutoronlineContacts` | `createdAt`, Timestamp da `serverTimestamp()` | Avviso sul nuovo documento |
| Recensione | `tutoronlineReviews` | `createdAt`, Timestamp da `serverTimestamp()` | Avviso appena ricevuta, anche se `status: pending` |

Le raccolte legacy `Contatti` e `recensioni` non sono quelle del sito Astro attuale e non vengono monitorate. Il polling non legge `status`: approvare una recensione cambiando soltanto `status` in `approved` non cambia la coppia `(createdAt, ID)` e non genera un altro avviso. Non modificare `createdAt` quando approvi.

## 1. Crea e configura lo script

1. Accedi a [script.google.com](https://script.google.com/) con l'account Google che dovrà eseguire i controlli. Usa sempre lo stesso account per autorizzare e installare il trigger.
2. Scegli **Nuovo progetto**, chiamalo `TutorOnline - notifiche Firestore`. È un progetto autonomo: non serve un foglio Google.
3. Sostituisci il contenuto di `Code.gs` con il file omonimo di questa cartella.
4. Cambia **solo** `CONFIG.recipient` con il tuo indirizzo Gmail completo. Il Gmail non è ricavabile dal repository: il recapito pubblico del sito è Hotmail, quindi non è stato usato come destinatario. Puoi usare il Gmail dell'account che autorizza lo script.
5. Apri **Impostazioni progetto** (ingranaggio), abilita **Mostra il file manifest "appsscript.json" nell'editor**. Torna nell'editor, apri il manifest e sostituiscilo integralmente con il file fornito. Salva entrambi i file.
6. Non pubblicare un'app Web e non premere **Esegui deployment**. Non aggiungere servizi avanzati o codice al sito. Mantieni `tutor-website-717e5` su **Spark**, senza collegare fatturazione.

Il manifest include esplicitamente `https://www.googleapis.com/auth/datastore` (scope Firestore), richieste esterne, invio MailApp e gestione trigger. Non richiede accesso alla casella Gmail. Il token è ottenuto al momento con `ScriptApp.getOAuthToken()`, non salvato o stampato.

## 2. Verifica prima l'accesso a Firestore

1. L'account che autorizza deve avere accesso IAM al progetto `tutor-website-717e5`. Se è già proprietario del progetto, ha i permessi necessari. Per un account dedicato, un amministratore può assegnargli il ruolo di sola lettura **Cloud Datastore Viewer** (`roles/datastore.viewer`) da [IAM del progetto](https://console.cloud.google.com/iam-admin/iam?project=tutor-website-717e5). L'autorizzazione OAuth da sola non concede accesso al progetto. Non aggiungere ruoli di scrittura per questo script.
2. Nell'editor, seleziona `verificaAccessoFirestore` dal menu delle funzioni e premi **Esegui**.
3. Alla prima esecuzione scegli **Rivedi autorizzazioni**, seleziona l'account corretto e concedi tutti gli scope richiesti. Se compare l'avviso di app non verificata per il tuo progetto personale, controlla che sia quello appena creato, poi usa **Avanzate → Vai a [nome progetto]** se Google consente questa opzione. Se il tuo dominio blocca il consenso, serve l'amministratore del dominio.
4. Nel **Log di esecuzione** deve apparire `Accesso Firestore OK per entrambe le raccolte. Ora server: ...`. Anche raccolte vuote sono valide. Questa funzione esegue due query di lettura con proiezione e limite 1: **non manda email, non salva cursori e non installa trigger**. Non stampa i contenuti dei documenti.
5. Solo dopo questo esito passa all'attivazione.

Diagnostica: con `401` controlla account e autorizzazione; con `403` controlla IAM e scope del manifest. Se l'errore segnala API disabilitata nelle verifiche Google Cloud, abilita **Cloud Firestore API** nel progetto indicato dall'errore (può essere il progetto Cloud associato allo script); non attivare billing. Normalmente l'API del database è già abilitata. Per diagnosi senza cambiare lo script, usa **API e servizi** in Google Cloud; non stampare il token. Con `404` verifica progetto e database `(default)`; con `400` verifica ordinamento/indici; con `429` controlla quote. Le query usano l'indice standard crescente di `createdAt`, con `__name__` come spareggio, senza filtro su `status`: non serve l'indice composito delle recensioni approvate. Se hai escluso `createdAt` dagli indici, ripristina l'indicizzazione di quel campo. Non aprire le Security Rules del sito: con OAuth Google l'accesso server è governato da IAM, non dalle regole dei client Firebase.

## 3. Attiva stato e trigger ogni 10 minuti

1. Seleziona `attivaNotifiche` e premi **Esegui**. Concedi eventuali autorizzazioni ancora richieste.
2. La funzione verifica nuovamente entrambe le raccolte e alla prima attivazione salva come soglia il `readTime` del server Firestore. Per ciascuna raccolta crea un cursore `{timestamp: soglia, id: null}`: `null` significa che tutta quella data è esclusa. Sono eleggibili soltanto documenti con `createdAt` successivo alla soglia. Non parte alcun invio retroattivo né email di attivazione.
3. Apri **Trigger** (icona sveglia): deve esserci una sola voce `controllaNotifiche`, origine **Basato sul tempo**, timer ogni **10 minuti**. Il trigger è creato dal codice con `everyMinutes(10)`: non crearne un secondo manualmente. Il servizio può ritardare l'esecuzione; non è una notifica istantanea.
4. In **Impostazioni progetto → Proprietà script** troverai `TUTORONLINE_NOTIFICATIONS_V1`: contiene soglia e cursori, senza contenuti dei messaggi. Non cancellarla. Rilanciare `attivaNotifiche` non azzera lo stato e non aggiunge altri trigger se uno esiste già.
5. Per fermare i controlli esegui `disattivaNotifiche`. Per riprenderli esegui `attivaNotifiche`: conserva i cursori e recupera anche i nuovi documenti rimasti durante la pausa. Per un'attivazione da zero usa un nuovo progetto Apps Script e rimuovi prima il trigger del vecchio progetto.

Il trigger gira con l'identità di chi lo installa, anche a browser chiuso. Non installarlo da altri account o da copie parallele del progetto: le copie hanno stati/lock separati e produrrebbero duplicati.

## Come funziona e cosa succede in caso di errore

- Solo `POST .../documents:runQuery`: è una query di lettura REST, non una scrittura. La proiezione seleziona esclusivamente `__name__` e `createdAt`. Firestore restituisce anche i propri metadati standard; lo script non richiede nome, email, messaggio, voto o testo delle recensioni.
- Una query per raccolta a ogni controllo, ordinata per `createdAt ASC, __name__ ASC`, con cursore esclusivo data+ID. Il timestamp REST viene conservato integralmente, inclusi i nanosecondi; la conversione a `Date` è usata solo per mostrare la data italiana. Gli ID distinguono i documenti con data identica.
- Fino a 100 documenti per raccolta per giro, massimo 200 in un'unica email allo stesso Gmail, con tipo, data, ID e link al documento nella Console Firebase. Il resto viene recuperato al giro successivo, senza scansione dello storico o offset. Il link richiede l'accesso alla Console con un account autorizzato.
- Un lock di script protegge lettura, invio, aggiornamento stato e attivazione. Se è già occupato, il polling salta quel giro.
- Nessun documento nuovo significa nessuna email e nessun avanzamento. Dopo un invio riuscito, tutti i cursori vengono salvati insieme in una sola proprietà. Se una query o MailApp fallisce, l'eccezione compare in **Esecuzioni** e lo stato precedente resta valido; il trigger successivo riprova. Con quota email esaurita non vengono neppure fatte query.
- MailApp e PropertiesService non condividono una transazione: se l'email parte ma il salvataggio dello stato fallisce (o l'esecuzione viene interrotta in quell'intervallo), il giro successivo può reinviarla. È consegna almeno una volta; non è possibile garantire contemporaneamente zero perdite e zero duplicati con questi due servizi. Un invio riuscito significa accettato da MailApp, non garanzia di recapito nella posta in arrivo.
- È polling: un documento cancellato prima del controllo non può essere notificato. Presuppone `createdAt` immutabile, valorizzato dal server come nel sito attuale; documenti importati con date arretrate o senza `createdAt` non verranno recuperati. Modificare una vecchia data in una successiva al cursore può produrre un nuovo avviso.

## 4. Collaudo con dati fittizi e pulizia

Non sono stati creati dati reali da questa preparazione. Dopo l'attivazione:

1. Apri il sito pubblico [TutorOnline](https://tutor-website-717e5.web.app/), vai a **Contatti** e invia un messaggio con nome `TEST NOTIFICHE DA ELIMINARE`, email `test@example.com`, livello `altro`, testo `Prova tecnica notifiche, dati fittizi da eliminare`, senza telefono. Lascia vuoti materia/pacchetto se facoltativi. Invia una sola volta e attendi conferma.
2. Invia una recensione dalla sezione recensioni: nome `TEST NOTIFICHE`, voto 5, testo `Prova tecnica fittizia da eliminare`. Nascerà `pending`, quindi non sarà mostrata sul sito. Non usare dati di persone reali.
3. In [Console Firestore](https://console.firebase.google.com/project/tutor-website-717e5/firestore/data) identifica i due documenti nelle raccolte attive, verificane testo e `createdAt` e annota gli ID. Non modificare le date. Creando i due documenti prima dello stesso controllo, li riceverai raggruppati; se interviene il trigger tra i due invii, potranno arrivare due email.
4. Per non aspettare il trigger, esegui `controllaNotifiche` nell'editor. Controlla Gmail (anche Spam): l'email deve contenere i due ID, tipo, data e link. Il link deve aprire il documento corretto. Rilancia la funzione: nessuna nuova email.
5. Per collaudare anche l'approvazione: in Console modifica **soltanto** `status` della recensione fittizia da `pending` a `approved`, salva ed esegui ancora `controllaNotifiche`. Non deve arrivare un altro avviso. Attenzione: durante questa prova la recensione fittizia diventa pubblica sul sito, quindi eliminala subito dopo. Se non vuoi pubblicarla, ometti questa singola prova: lascia `pending` fino alla cancellazione.
6. Elimina **i due documenti di test**, identificati dagli ID annotati, tramite il menu del singolo documento in Console. Non eliminare le raccolte, non toccare altri documenti o i cursori. Esegui nuovamente `controllaNotifiche`: le cancellazioni non generano avvisi. Elimina anche le email di collaudo se non servono.
7. In **Esecuzioni** controlla poi che una chiamata automatica del trigger finisca correttamente entro il successivo intervallo di circa 10 minuti.

Puoi anche provare una pausa/ripresa: esegui `disattivaNotifiche`, invia un nuovo test dal sito, riesegui `attivaNotifiche` e poi `controllaNotifiche`. Il nuovo test deve essere recuperato; rimuovilo come sopra. Non esaurire volontariamente la quota Gmail per collaudare gli errori: questi casi sono coperti dai test locali simulati.

## Quote e costo

Il progetto può restare su Spark. Firestore ha una quota gratuita di 50.000 letture documenti/giorno condivisa con il sito e gli altri client. Anche una query vuota conta almeno una lettura: a riposo questo script esegue circa **288 query/giorno** (2 × 144), oltre alla verifica iniziale; le letture dei documenti nuovi, degli eventuali tentativi ripetuti e delle voci indice si aggiungono. Proiettare pochi campi riduce i dati trasferiti, non annulla il conteggio delle letture. Controlla l'utilizzo complessivo nella Console.

Per un account Gmail personale Apps Script prevede attualmente **100 destinatari email/giorno**, 20.000 chiamate URL Fetch/giorno e 90 minuti totali/giorno dei trigger. Le quote sono condivise con altri script e possono cambiare. Un destinatario per riepilogo: con nuovi documenti a ogni giro si potrebbero richiedere 144 invii/giorno, superando la quota Gmail. Lo script allora sospende gli invii e conserva l'arretrato fino al ripristino della quota (finestra di 24 ore secondo il servizio). Un volume sostenuto superiore alla capacità gratuita può accumulare ritardo. Nessun passaggio automatico a un piano a pagamento è richiesto.

Riferimenti ufficiali verificati:

- [REST Firestore: OAuth e scope datastore, IAM](https://firebase.google.com/docs/firestore/use-rest-api)
- [StructuredQuery: proiezione e cursori](https://docs.cloud.google.com/firestore/docs/reference/rest/v1/StructuredQuery)
- [Ruoli Firestore, incluso Datastore Viewer](https://docs.cloud.google.com/iam/docs/roles-permissions/firestore)
- [Timer Apps Script ogni 10 minuti](https://developers.google.com/apps-script/reference/script/clock-trigger-builder#everyMinutes(Integer))
- [MailApp](https://developers.google.com/apps-script/reference/mail/mail-app)
- [Quote Apps Script](https://developers.google.com/apps-script/guides/services/quotas)
- [Quota gratuita Firestore](https://firebase.google.com/docs/firestore/quotas) e [conteggio delle letture](https://firebase.google.com/docs/firestore/pricing)

## Verifiche locali

`npm run test:notifications` (oppure `node --test apps-script-notifications/notifications.test.cjs`) esegue test con servizi Google simulati: inizializzazione, ordinamento e cursori con timestamp identici/nanosecondi, batch successivi, nessuna ripetizione su approvazione, errori REST/MailApp, quota esaurita, lock e conservazione dello stato. Entrambi i workflow GitHub eseguono lo stesso comando prima della build, senza credenziali Google. Non contatta Google e non invia email. L'autorizzazione OAuth/IAM reale e il recapito Gmail devono essere verificati seguendo i passi 2 e 4 nell'account che installerà lo script.
