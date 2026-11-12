/** Script autonomo: nessuna dipendenza dal sito, nessuna scrittura Firestore. */
const CONFIG = Object.freeze({
  projectId: 'tutor-website-717e5',
  databaseId: '(default)',
  recipient: 'INSERISCI_IL_TUO_INDIRIZZO@gmail.com',
  // Massimo 100 documenti per raccolta per esecuzione. Il resto passa al giro dopo.
  batchSize: 100
});
const COLLECTIONS = Object.freeze([
  { id: 'tutoronlineContacts', type: 'Contatto' },
  { id: 'tutoronlineReviews', type: 'Recensione' }
]);
const STATE_KEY = 'TUTORONLINE_NOTIFICATIONS_V1';

/** Primo passo: verifica OAuth/IAM per entrambe le raccolte, senza email o stato. */
function verificaAccessoFirestore() {
  const result = verificaAccesso_();
  console.log('Accesso Firestore OK per entrambe le raccolte. Ora server: ' + result);
}

/** Secondo passo: inizializza una sola volta, poi installa il trigger. Idempotente. */
function attivaNotifiche() {
  validaDestinatario_();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const cutoff = verificaAccesso_();
    const properties = PropertiesService.getScriptProperties();
    if (!properties.getProperty(STATE_KEY)) {
      const cursors = {};
      COLLECTIONS.forEach(c => { cursors[c.id] = { timestamp: cutoff, id: null }; });
      // Un'unica proprietà per salvare insieme tutti i cursori.
      properties.setProperty(STATE_KEY, JSON.stringify({
        version: 1, projectId: CONFIG.projectId, databaseId: CONFIG.databaseId,
        activatedAt: cutoff, cursors: cursors
      }));
    }
    leggiStato_(); // Non sovrascrivere mai uno stato esistente o non valido.
    const triggers = ScriptApp.getProjectTriggers()
      .filter(t => t.getHandlerFunction() === 'controllaNotifiche');
    if (!triggers.length) {
      ScriptApp.newTrigger('controllaNotifiche').timeBased().everyMinutes(10).create();
    }
    console.log('Notifiche attive ogni 10 minuti. Lo stato esistente è conservato.');
  } finally {
    lock.releaseLock();
  }
}

/** Funzione del trigger; eseguibile anche manualmente per il collaudo. */
function controllaNotifiche() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    console.log('Altra esecuzione in corso; riprovo al prossimo trigger.');
    return;
  }
  try {
    validaDestinatario_();
    const state = leggiStato_();
    if (MailApp.getRemainingDailyQuota() < 1) {
      console.log('Quota email esaurita: nessuna query e cursori invariati.');
      return;
    }
    const items = [];
    COLLECTIONS.forEach(collection => {
      const query = queryBase_(collection.id, CONFIG.batchSize);
      const cursor = state.cursors[collection.id];
      const values = [{ timestampValue: cursor.timestamp }];
      if (cursor.id !== null) {
        values.push({ referenceValue: documentRoot_() + '/' + collection.id + '/' + cursor.id });
      }
      // before:false equivale a startAfter. Il timestamp resta nella precisione REST.
      query.startAt = { values: values, before: false };
      const result = eseguiQuery_(query);
      result.documents.forEach(doc => {
        const id = doc.name.substring(doc.name.lastIndexOf('/') + 1);
        const timestamp = doc.fields && doc.fields.createdAt && doc.fields.createdAt.timestampValue;
        if (!timestamp || !Number.isFinite(Date.parse(timestamp))) {
          throw new Error('createdAt non è un timestamp: nessun invio o avanzamento.');
        }
        items.push({ type: collection.type, collection: collection.id, id: id, timestamp: timestamp });
      });
      if (result.documents.length) {
        const last = items[items.length - 1];
        state.cursors[collection.id] = { timestamp: last.timestamp, id: last.id };
      }
    });
    if (!items.length) {
      console.log('Nessun nuovo documento. Nessuna email.');
      return;
    }
    const lines = items.map(item => {
      const date = Utilities.formatDate(new Date(item.timestamp), 'Europe/Rome', 'dd/MM/yyyy HH:mm:ss');
      return item.type + ' | ' + date + ' (Europe/Rome) | ID: ' + item.id +
        '\ncreatedAt: ' + item.timestamp + '\n' + consoleLink_(item.collection, item.id);
    });
    MailApp.sendEmail({
      to: CONFIG.recipient,
      subject: 'TutorOnline: ' + items.length + ' nuovi documenti',
      body: 'Nuovi documenti ricevuti da TutorOnline:\n\n' + lines.join('\n\n') +
        '\n\nAvviso automatico. Eventuali ulteriori documenti saranno inclusi nel prossimo controllo.',
      name: 'TutorOnline notifiche'
    });
    // Se sendEmail lancia un errore, questa scrittura non viene raggiunta.
    PropertiesService.getScriptProperties().setProperty(STATE_KEY, JSON.stringify(state));
    console.log('Email inviata: ' + items.length + ' documenti. Cursori aggiornati.');
  } finally {
    lock.releaseLock();
  }
}

/** Ferma il trigger senza perdere lo stato: attivaNotifiche riprenderà da qui. */
function disattivaNotifiche() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    ScriptApp.getProjectTriggers()
      .filter(t => t.getHandlerFunction() === 'controllaNotifiche')
      .forEach(t => ScriptApp.deleteTrigger(t));
    console.log('Trigger rimosso; cursori conservati.');
  } finally {
    lock.releaseLock();
  }
}

function verificaAccesso_() {
  let cutoff;
  COLLECTIONS.forEach(collection => {
    // Stesso indice/ordinamento usato dal polling, proiezione solo createdAt e nome.
    const result = eseguiQuery_(queryBase_(collection.id, 1));
    if (!cutoff) cutoff = result.readTime;
  });
  return cutoff;
}

function queryBase_(collection, limit) {
  return {
    select: { fields: [{ fieldPath: '__name__' }, { fieldPath: 'createdAt' }] },
    from: [{ collectionId: collection }],
    orderBy: [
      { field: { fieldPath: 'createdAt' }, direction: 'ASCENDING' },
      { field: { fieldPath: '__name__' }, direction: 'ASCENDING' }
    ],
    limit: limit
  };
}

function eseguiQuery_(query) {
  // POST runQuery è un'operazione di sola lettura, non crea/aggiorna documenti.
  const response = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/' + documentRoot_() + ':runQuery', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ structuredQuery: query }),
    muteHttpExceptions: true
  });
  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    // Non registrare token o dati dei documenti.
    throw new Error('Firestore HTTP ' + status + '. Controllare OAuth, IAM, API, indici e quote.');
  }
  const rows = JSON.parse(response.getContentText());
  if (!Array.isArray(rows) || rows.some(row => row.error)) {
    throw new Error('Risposta Firestore non valida: stato invariato.');
  }
  const readTimes = rows.filter(row => row.readTime).map(row => row.readTime);
  if (!readTimes.length || !Number.isFinite(Date.parse(readTimes[0]))) {
    throw new Error('Firestore non ha restituito un readTime valido.');
  }
  return { documents: rows.filter(row => row.document).map(row => row.document), readTime: readTimes[0] };
}

function documentRoot_() {
  return 'projects/' + CONFIG.projectId + '/databases/' + CONFIG.databaseId + '/documents';
}

function consoleLink_(collection, id) {
  return 'https://console.firebase.google.com/project/' + CONFIG.projectId +
    '/firestore/data/' +
    encodeURIComponent('/' + collection + '/' + id).replace(/%2F/g, '~2F');
}

function leggiStato_() {
  const raw = PropertiesService.getScriptProperties().getProperty(STATE_KEY);
  if (!raw) throw new Error('Prima eseguire attivaNotifiche. Nessuna inizializzazione automatica nel polling.');
  const state = JSON.parse(raw);
  if (state.version !== 1 || state.projectId !== CONFIG.projectId || state.databaseId !== CONFIG.databaseId ||
      !state.cursors || COLLECTIONS.some(c => {
        const cursor = state.cursors[c.id];
        return !cursor || !Number.isFinite(Date.parse(cursor.timestamp)) ||
          !(cursor.id === null || (typeof cursor.id === 'string' && cursor.id.length > 0 && !cursor.id.includes('/')));
      })) {
    throw new Error('Stato non valido: non cancellarlo, ripristinare la configurazione originale.');
  }
  return state;
}

function validaDestinatario_() {
  if (!/^[^\s@,;]+@gmail\.com$/i.test(CONFIG.recipient) || CONFIG.recipient.includes('INSERISCI')) {
    throw new Error('Impostare CONFIG.recipient con il proprio singolo indirizzo Gmail.');
  }
}
