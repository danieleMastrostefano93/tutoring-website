# Analisi npm audit — 12 novembre 2026

## Prima della correzione

Le quattro voci high non rappresentavano quattro vulnerabilità indipendenti: npm propagava la severità di una dipendenza a tutta la catena.

| Pacchetto installato | Ruolo nella segnalazione | Dopo la correzione |
| --- | --- | --- |
| `firebase@13.3.0` | Dipendenza diretta; severità ereditata da Firestore | Invariato |
| `@firebase/firestore-compat@0.4.18` | Eredita la segnalazione Firestore; non importato dal sito | Invariato |
| `@firebase/firestore@4.20.0` | Include gRPC nel client Node | Invariato |
| `@grpc/grpc-js@1.9.16` | Dipendenza con gli advisory effettivi | `1.14.7` |

Gli advisory del manutentore sono:

- [GHSA-m9gg-hp2v-232j](https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j), high: autenticazione errata se un server gRPC usa certificati client non obbligatori e si affida a `getAuthContext`. Corretto nelle linee `1.13.6` e `1.14.5`.
- [GHSA-f596-whhp-79r4](https://github.com/grpc/grpc-node/security/advisories/GHSA-f596-whhp-79r4), low: un server gRPC può inviare al client dettagli sensibili contenuti negli errori degli handler. Il manutentore indica le correzioni `1.13.7` e `1.14.6`. La versione scelta `1.14.7` copre anche queste correzioni.

## Esposizione concreta

Il sito pubblicato è statico. Il codice applicativo importa `firebase/firestore/lite`, [SDK solo REST](https://firebase.google.com/docs/firestore/solutions/firestore-lite), e non avvia server gRPC. Il percorso vulnerabile non è usato nel browser. Nella build la dipendenza era installata in Node, ma il progetto non usa server gRPC, `getAuthContext`, credenziali TLS server o handler gRPC; i presupposti dei due advisory non risultano presenti nella pipeline applicativa analizzata. Questa conclusione deriva dall’ispezione degli import e dei workflow, non da una garanzia generale su tutti i servizi esterni.

## Correzione e compatibilità

Alla verifica del registry, Firebase `13.3.0` e Firestore `4.20.0` erano le ultime versioni stabili e Firestore richiedeva ancora `@grpc/grpc-js ~1.9.0`. Non era disponibile una correzione patch dentro quel vincolo. Il downgrade Firebase proposto da `npm audit fix --force` non è stato applicato.

È stato aggiunto un override **solo sotto `@firebase/firestore`**, fissando gRPC `1.14.7`, nella stessa major 1. L’override supera intenzionalmente il vecchio vincolo minor di Firestore: è una correzione locale verificata, non un aggiornamento già recepito da Firebase. Va rimosso quando Firebase dichiarerà una versione sicura nella propria dipendenza.

Validazione completata:

- `npm ci` dal lockfile aggiornato.
- `npm audit`: zero vulnerabilità rilevate.
- 43 controlli Firestore nell’emulatore.
- Client Node **completo** `firebase/firestore`: scrittura, lettura server e cancellazione con gRPC nell’emulatore (`scripts/check-grpc-compat.mjs`).
- Build Astro Firebase e test Chromium: otto pagine/risorse, pagina privacy desktop/mobile, collegamenti nei moduli, consenso recensioni non preselezionato, invio Contatti a produzione riuscito e dato di prova rimosso.

I workflow PR e live ora eseguono `npm audit --audit-level=high` dopo `npm ci`. L’audit riguarda le dipendenze npm del repository; non certifica le dipendenze interne delle azioni GitHub o della CLI Firebase esterna.
