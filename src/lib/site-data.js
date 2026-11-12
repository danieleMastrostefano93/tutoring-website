export const pages = {
  home: {
    path: "/",
    label: "Home",
    title: "Ripetizioni online di matematica, fisica e informatica",
    description: "Lezioni online con Daniele Mastrostefano, dottore di ricerca in matematica a Warwick e tutor da oltre 15 anni."
  },
  info: {
    path: "/info/",
    label: "Su di me",
    title: "Daniele Mastrostefano, matematico e tutor",
    description: "Scopri il percorso di Daniele Mastrostefano, il dottorato a Warwick e il suo metodo per le ripetizioni di matematica, fisica e informatica."
  },
  prezzi: {
    path: "/prezzi/",
    label: "Tariffe",
    title: "Tariffe delle ripetizioni online",
    description: "Lezione singola a 25 € e pacchetti da 5 o 10 ore. Confronta prezzi, costo orario e modalità delle lezioni online."
  },
  contatti: {
    path: "/contatti/",
    label: "Contatti",
    title: "Scrivi a Daniele per informazioni e lezioni",
    description: "Contatta Daniele per chiedere informazioni sulle ripetizioni online o concordare il percorso, gli orari e la prima lezione."
  },
  "tutte-recensioni": {
    path: "/tutte-recensioni/",
    label: "Recensioni",
    title: "Recensioni delle lezioni",
    description: "Leggi le esperienze degli studenti di TutorOnline."
  },
  recensioni: {
    path: "/recensioni/",
    title: "Scrivi una recensione",
    description: "Lascia una valutazione sulle lezioni di TutorOnline.",
    noIndex: true
  },
};

export const mainNavigation = ["home", "info", "prezzi", "tutte-recensioni", "contatti"];

export const subjects = {
  matematica: "Matematica",
  fisica: "Fisica",
  informatica: "Informatica"
};

export const plans = [
  {
    id: "1",
    title: "Lezione singola",
    price: "25",
    unit: "25 € l’ora",
    benefits: ["Un’ora di lezione individuale online", "Utile per un argomento preciso o per iniziare"]
  },
  {
    id: "5",
    title: "Pacchetto da 5 ore",
    price: "112,50",
    unit: "22,50 € l’ora · Risparmi il 10%",
    benefits: ["Cinque ore di lezione individuale online", "Supporto via email"]
  },
  {
    id: "10",
    title: "Pacchetto da 10 ore",
    price: "200",
    unit: "20 € l’ora · Risparmi il 20%",
    benefits: ["Dieci ore di lezione individuale online", "Supporto via email", "Materiale personalizzato"]
  }
];

export const levels = {
  elementari: "Elementari",
  medie: "Medie",
  superiori: "Superiori",
  universita: "Università",
  altro: "Altro"
};

export const mode = import.meta.env.PUBLIC_BACKEND || "demo";
if (!["demo", "emulator", "firebase"].includes(mode)) {
  throw new Error("PUBLIC_BACKEND deve essere demo, emulator o firebase.");
}
