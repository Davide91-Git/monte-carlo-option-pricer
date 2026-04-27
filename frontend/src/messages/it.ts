/* ============================================================
   messages/it.ts — Italian UI strings
   ============================================================ */

import type { Messages } from './en';

export const it: Messages = {

  app: {
    name:       'MCPricer',
    tagline:    'Motore di Pricing con Monte Carlo',
    version:    'v0.1.0',
    disclaimer: 'Solo per uso didattico — non costituisce consulenza finanziaria.',
  },

  theme: {
    light:  'Chiaro',
    dark:   'Scuro',
    toggle: 'Cambia tema',
  },

  language: {
    label: 'Lingua',
    en:    'English',
    it:    'Italiano',
  },

  modal: {
    title:      'Termini di Utilizzo e Disclaimer',
    subtitle:   'Si prega di leggere attentamente prima di utilizzare MCPricer',
    body:       'Questa applicazione è sviluppata esclusivamente a scopo didattico e dimostrativo. Tutti i modelli di pricing, le simulazioni e i risultati prodotti da questo strumento sono di natura teorica e non costituiscono consulenza finanziaria, raccomandazioni di investimento o sollecitazione di alcun tipo.',
    termsTitle: 'Termini di utilizzo',
    terms: [
      'Questo strumento non utilizza dati di mercato in tempo reale. Prezzi e dati di volatilità potrebbero non essere aggiornati.',
      'Le simulazioni Monte Carlo sono stime probabilistiche. I risultati sono soggetti a incertezza statistica.',
      "L'autore declina ogni responsabilità per decisioni prese sulla base dei risultati prodotti da questo strumento.",
      'Procedendo, confermi di utilizzare questo strumento esclusivamente a fini didattici.',
    ],
    accept: 'Accetta e continua',
  },

  config: {
    title:               'Configurazione Run',
    stock:               'Azione',
    stockPlaceholder:    'Seleziona un titolo…',
    lastPrice:           'Ultimo prezzo',
    historicalVol:       'σ storica',
    optionType:          'Tipo opzione',
    european:            'Europea',
    asian:               'Asiatica',
    call:                'Call',
    put:                 'Put',
    parameters:          'Parametri',
    strike:              'Prezzo esercizio (K)',
    strikePlaceholder:   'es. 210.00',
    maturity:            'Scadenza (T, anni)',
    maturityPlaceholder: 'es. 0.50',
    riskFreeRate:        'Tasso privo di rischio (r)',
    riskFreePlaceholder: 'es. 0.05',
    simulations:         'Simulazioni (N)',
    volatility:          'Volatilità (σ)',
    volAuto:             'Auto — storica',
    volManual:           'Override manuale',
    volWindow:           'Finestra vol.',
    volWindowMatch:      'Adatta alla scadenza',
    volWindow1M:         '1 mese',
    volWindow3M:         '3 mesi',
    volWindow6M:         '6 mesi',
    volWindow1Y:         '1 anno',
    volWindow3Y:         '3 anni',
    antithetic:          'Riduzione varianza antitetica',
    parallel:            'Simulazione parallela (multi-core)',
    runButton:           'Calcola',
    runningButton:       'Calcolo…',
    resetButton:         'Reimposta',
  },

  results: {
    title:        'Risultati',
    mcPrice:      'Prezzo MC',
    stdError:     'Errore std.',
    ci95:         'IC 95%',
    vsBs:         'vs Black-Scholes',
    bsPrice:      'Prezzo B&S',
    elapsed:      'Tempo',
    paths:        'Simulazioni',
    pathsOf:      '{n} di {total}',
    notAvailable: 'N/D',
  },

  charts: {
    convergenceTitle:    'Convergenza',
    convergenceSubtitle: '{n} simulazioni completate',
    mcLine:              'Prezzo MC',
    bsLine:              'Riferimento B&S',
    ciBand:              'IC 95%',
    xAxisLabel:          'Simulazioni (×1.000)',
    yAxisLabel:          'Prezzo opzione ($)',
    distributionTitle:   'Distribuzione payoff',
    distributionXLabel:  'Payoff ($)',
    distributionYLabel:  'Frequenza',
    distributionEmpty:   'Avvia una simulazione per vedere la distribuzione dei payoff.',
    historyTitle:        'Storico prezzi',
    historySubtitle:     'ultimi {days} giorni di trading',
    historyEmpty:        'Seleziona un titolo per vedere lo storico prezzi.',
    historyS0Label:      'S₀ (ultimo prezzo)',
    historyStrikeLabel:  'Strike (K)',
    historyXLabel:       'Data',
    historyYLabel:       'Prezzo ($)',
  },

  progress: {
    idle:       'Configura i parametri e avvia una simulazione.',
    connecting: 'Connessione…',
    running:    'Simulazione {n} di {total} percorsi…',
    done:       'Simulazione completata.',
    error:      'Simulazione fallita. Riprova.',
  },

  footer: {
    project:    'Progetto',
    github:     'GitHub',
    author:     'Autore',
    linkedin:   'LinkedIn',
    copyright:  '© {year} MCPricer',
    disclaimer: 'Solo per uso didattico — non costituisce consulenza finanziaria.',
  },

  errors: {
    tickerNotFound:  "Ticker '{ticker}' non trovato nel database.",
    noVolatility:    'Dati storici insufficienti per calcolare la volatilità di {ticker}.',
    wsDisconnected:  'Connessione persa — nuovo tentativo…',
    wsError:         'Errore WebSocket. Aggiorna la pagina e riprova.',
    invalidStrike:   'Lo strike deve essere un numero positivo.',
    invalidMaturity: 'La scadenza deve essere compresa tra 0.01 e 10 anni.',
    invalidRate:     'Il tasso deve essere compreso tra 0 e 1.',
    invalidSims:     'Le simulazioni devono essere comprese tra 1.000 e 1.000.000.',
    requiredField:   'Campo obbligatorio.',
    genericError:    'Qualcosa è andato storto. Riprova.',
  },

};