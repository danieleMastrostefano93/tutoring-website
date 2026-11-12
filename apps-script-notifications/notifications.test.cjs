const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(__dirname + '/Code.gs', 'utf8')
  .replace('INSERISCI_IL_TUO_INDIRIZZO@gmail.com', 'owner@gmail.com');
const T0 = '2026-11-12T12:00:00.000000000Z';
const T1 = '2026-11-12T12:00:00.000000001Z';
const T2 = '2026-11-12T12:00:00.000000002Z';
const collections = ['tutoronlineContacts', 'tutoronlineReviews'];
const root = 'projects/tutor-website-717e5/databases/(default)/documents';

function harness() {
  const h = { docs: [], requests: [], sent: [], triggers: [], quota: 100, locked: false,
    mailError: false, httpError: 0, failCollection: null, writes: 0, raw: null, writeError: false };
  const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  const context = vm.createContext({
    console: { log() {} },
    LockService: { getScriptLock: () => ({
      tryLock: () => !h.locked,
      waitLock: () => { if (h.locked) throw Error('lock'); },
      releaseLock: () => {}
    }) },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: () => h.raw,
      setProperty: (key, value) => { if (h.writeError) throw Error('properties failure'); h.raw = value; h.writes++; }
    }) },
    ScriptApp: {
      getOAuthToken: () => 'mock-token',
      getProjectTriggers: () => h.triggers,
      deleteTrigger: t => { h.triggers = h.triggers.filter(item => item !== t); },
      newTrigger: handler => ({ timeBased: () => ({ everyMinutes: n => ({
        create: () => { assert.equal(n, 10); h.triggers.push({ getHandlerFunction: () => handler }); }
      }) }) })
    },
    MailApp: {
      getRemainingDailyQuota: () => h.quota,
      sendEmail: message => { if (h.mailError) throw Error('mail failure'); h.sent.push(message); }
    },
    Utilities: { formatDate: date => date.toISOString() },
    UrlFetchApp: { fetch: (url, options) => {
      assert.equal(url, 'https://firestore.googleapis.com/v1/' + root + ':runQuery');
      assert.equal(options.method, 'post');
      assert.equal(options.headers.Authorization, 'Bearer mock-token');
      const q = JSON.parse(options.payload).structuredQuery;
      assert.deepEqual(q.select.fields.map(f => f.fieldPath), ['__name__', 'createdAt']);
      assert.deepEqual(q.orderBy.map(o => [o.field.fieldPath, o.direction]),
        [['createdAt', 'ASCENDING'], ['__name__', 'ASCENDING']]);
      assert.equal(q.where, undefined); // Nessun filtro status.
      h.requests.push(q);
      const code = h.httpError || (h.failCollection === q.from[0].collectionId ? 403 : 200);
      let docs = h.docs.filter(d => d.collection === q.from[0].collectionId);
      docs.sort((a, b) => compare(a.timestamp, b.timestamp) || compare(a.id, b.id));
      if (q.startAt) {
        assert.equal(q.startAt.before, false);
        const values = q.startAt.values;
        docs = docs.filter(d => {
          const order = compare(d.timestamp, values[0].timestampValue);
          return order > 0 || (order === 0 && values[1] &&
            compare(root + '/' + d.collection + '/' + d.id, values[1].referenceValue) > 0);
        });
      }
      const rows = docs.slice(0, q.limit).map(d => ({
        document: { name: root + '/' + d.collection + '/' + d.id,
          fields: { createdAt: { timestampValue: d.timestamp } } }, readTime: T0
      }));
      if (!rows.length) rows.push({ readTime: T0 });
      return { getResponseCode: () => code, getContentText: () => JSON.stringify(rows) };
    } }
  });
  vm.runInContext(source, context);
  h.run = name => context[name]();
  h.state = () => JSON.parse(h.raw);
  h.add = (collection, id, timestamp) => h.docs.push({ collection, id, timestamp, status: 'pending' });
  return h;
}

test('verifica accesso non invia, non installa e non inizializza; attivazione esclude storico', () => {
  const h = harness();
  collections.forEach(c => h.add(c, 'old', T0));
  h.run('verificaAccessoFirestore');
  assert.equal(h.raw, null);
  assert.equal(h.triggers.length, 0);
  assert.equal(h.sent.length, 0);
  h.run('attivaNotifiche');
  assert.equal(h.state().activatedAt, T0);
  collections.forEach(c => assert.deepEqual(h.state().cursors[c], { timestamp: T0, id: null }));
  h.run('controllaNotifiche');
  assert.equal(h.sent.length, 0);
});

test('raggruppa contatto e recensione pending; approvazione non ripete; precisione nanosecondi', () => {
  const h = harness();
  h.run('attivaNotifiche');
  h.add(collections[0], 'contact', T1);
  h.add(collections[1], 'review', T1);
  h.run('controllaNotifiche');
  assert.equal(h.sent.length, 1);
  assert.match(h.sent[0].body, /Contatto.*ID: contact/);
  assert.match(h.sent[0].body, /Recensione.*ID: review/);
  assert.match(h.sent[0].body, /firestore\/data\/~2FtutoronlineReviews~2Freview/);
  assert.equal(h.state().cursors[collections[1]].timestamp, T1);
  h.docs[1].status = 'approved';
  h.run('controllaNotifiche');
  assert.equal(h.sent.length, 1);
  h.add(collections[1], 'second', T2);
  h.run('controllaNotifiche');
  assert.equal(h.sent.length, 2);
  assert.doesNotMatch(h.sent[1].body, /ID: review/);
});

test('batch successivi con più di 100 documenti allo stesso timestamp, senza saltarne', () => {
  const h = harness();
  h.run('attivaNotifiche');
  for (let i = 104; i >= 0; i--) h.add(collections[0], 'id' + String(i).padStart(3, '0'), T1);
  h.run('controllaNotifiche');
  assert.equal(h.state().cursors[collections[0]].id, 'id099');
  assert.equal((h.sent[0].body.match(/ID:/g) || []).length, 100);
  h.run('controllaNotifiche');
  assert.equal((h.sent[1].body.match(/ID:/g) || []).length, 5);
  assert.equal(h.state().cursors[collections[0]].id, 'id104');
  h.run('controllaNotifiche');
  assert.equal(h.sent.length, 2);
});

test('errore invio conserva entrambi i cursori e riprova gli stessi documenti', () => {
  const h = harness();
  h.run('attivaNotifiche');
  collections.forEach(c => h.add(c, 'new', T1));
  const before = h.raw;
  h.mailError = true;
  assert.throws(() => h.run('controllaNotifiche'), /mail failure/);
  assert.equal(h.raw, before);
  h.mailError = false;
  h.run('controllaNotifiche');
  assert.equal(h.sent.length, 1);
  assert.notEqual(h.raw, before);
});

test('quota esaurita evita query e modifiche; al ripristino recupera arretrato', () => {
  const h = harness();
  h.run('attivaNotifiche');
  h.add(collections[1], 'new', T1);
  const before = h.raw, requests = h.requests.length;
  h.quota = 0;
  h.run('controllaNotifiche');
  assert.equal(h.requests.length, requests);
  assert.equal(h.raw, before);
  h.quota = 1;
  h.run('controllaNotifiche');
  assert.equal(h.sent.length, 1);
});

test('errore seconda raccolta non invia né salva avanzamento parziale', () => {
  const h = harness();
  h.run('attivaNotifiche');
  h.add(collections[0], 'new', T1);
  const before = h.raw;
  h.failCollection = collections[1];
  assert.throws(() => h.run('controllaNotifiche'), /HTTP 403/);
  assert.equal(h.raw, before);
  assert.equal(h.sent.length, 0);
});

test('lock occupato salta il polling; assenza stato non si inizializza da sola', () => {
  const h = harness();
  assert.throws(() => h.run('controllaNotifiche'), /Prima eseguire/);
  h.locked = true;
  h.run('controllaNotifiche');
  assert.equal(h.requests.length, 0);
  assert.equal(h.raw, null);
});

test('riattivazione e pausa conservano cursori, un solo trigger; accesso fallito non attiva', () => {
  const h = harness();
  h.httpError = 403;
  assert.throws(() => h.run('attivaNotifiche'), /HTTP 403/);
  assert.equal(h.raw, null);
  assert.equal(h.triggers.length, 0);
  h.httpError = 0;
  h.run('attivaNotifiche');
  h.add(collections[0], 'new', T1);
  h.run('controllaNotifiche');
  const before = h.raw;
  h.run('attivaNotifiche');
  assert.equal(h.raw, before);
  assert.equal(h.triggers.length, 1);
  h.run('disattivaNotifiche');
  assert.equal(h.triggers.length, 0);
  assert.equal(h.raw, before);
  h.run('attivaNotifiche');
  assert.equal(h.raw, before);
  assert.equal(h.triggers.length, 1);
});

test('salvataggio fallito dopo invio non perde dati: possibile duplicato documentato', () => {
  const h = harness();
  h.run('attivaNotifiche');
  h.add(collections[1], 'new', T1);
  const before = h.raw;
  h.writeError = true;
  assert.throws(() => h.run('controllaNotifiche'), /properties failure/);
  assert.equal(h.sent.length, 1);
  assert.equal(h.raw, before);
  h.writeError = false;
  h.run('controllaNotifiche');
  assert.equal(h.sent.length, 2);
  assert.equal(h.state().cursors[collections[1]].id, 'new');
});
