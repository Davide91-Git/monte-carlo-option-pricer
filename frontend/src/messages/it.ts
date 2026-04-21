/* ============================================================
   messages/it.ts — Italiano UI strings (placeholder)
   ============================================================
   Rules:
     • Every string visible in the UI lives here.
     • No hardcoded text in JSX — always import from messages.
   ============================================================ */

export const it = {

  /* ── App shell ─────────────────────────────────────────── */
  app: {
    name:        'MCPricer',
    tagline:     'Motore di Pricing con Monte Carlo',
    version:     'v0.1.0',
    disclaimer:  'Solo per uso didattico — non costituisce consulenza finanziaria.',
  },

  /* ── Navigation ────────────────────────────────────────── */
  nav: {
    pricer:  'Pricer',
    docs:    'Docs',
    about:   'Chi siamo',
  },

  /* ── Theme toggle ──────────────────────────────────────── */
  theme: {
    light:  'Chiaro',
    dark:   'Scuro',
    toggle: 'Cambia tema',
  },

  /* ── Language selector ─────────────────────────────────── */
  language: {
    label:   'Lingua',
    en:      'English',
    it:      'Italiano',
    de:      'Deutsch',
  },

  /* ── Configuration panel ───────────────────────────────── */
  config: {
    title:           'Configurazione',

    /* Stock */
    stock:           'Azione',
    stockPlaceholder:'Seleziona un ticker…',
    lastPrice:       'Ultimo prezzo',
    historicalVol:   'Volatilità storica σ',

    /* Option style & type */
    optionStyle:     'Stile opzione',
    european:        'Europea',
    asian:           'Asiatica',
    optionType:      'Tipo',
    call:            'Call',
    put:             'Put',

    /* Parameters */
    parameters:          'Parametri',
    strike:              'Prezzo esercizio (K)',
    strikePlaceholder:   'es. 210.00',
    maturity:            'Scadenza (T, anni)',
    maturityPlaceholder: 'es. 0.50',
    riskFreeRate:        'Tasso privo di rischio (r)',
    riskFreePlaceholder: 'es. 0.05',
    simulations:         'Simulazioni (N)',
    steps:               'Passi temporali',

    /* Volatility */
    volatility:     'Volatilità (σ)',
    volAuto:        'Auto — storica',
    volManual:      'Override manuale',
    volWindow:      'Finestra vol.',
    volWindowMatch: 'Adatta alla scadenza',
    volWindow1M:    '1 mese',
    volWindow3M:    '3 mesi',
    volWindow6M:    '6 mesi',
    volWindow1Y:    '1 anno',
    volWindow3Y:    '3 anni',

    /* Variance reduction */
    antithetic:      'Riduzione varianza antitetica',
    antitheticShort: 'Antitetica',

    /* Actions */
    runButton:     'Avvia simulazione',
    runningButton: 'In esecuzione…',
    resetButton:   'Reimposta',
  },

  /* ── Results ───────────────────────────────────────────── */
  results: {
    title:       'Risultati',

    mcPrice:     'Prezzo MC',
    stdError:    'Err. std.',
    ci95:        'IC 95%',
    vsBs:        'vs Black-Scholes',
    bsPrice:     'Prezzo B&S',
    elapsed:     'Durata',
    paths:       'Percorsi',
    pathsOf:     '{n} di {total}',
    notAvailable:'N/D',

    /* Badges */
    european:   'Europea',
    asian:      'Asiatica',
    call:       'Call',
    put:        'Put',
    antithetic: 'Antitetica ON',
  },

  /* ── Charts ────────────────────────────────────────────── */
  charts: {
    /* Convergence */
    convergenceTitle:    'Convergenza',
    convergenceSubtitle: '{n} percorsi simulati',
    mcLine:              'Prezzo MC',
    bsLine:              'Benchmark B&S',
    ciBand:              'IC 95%',
    xAxisLabel:          'Percorsi (×1.000)',
    yAxisLabel:          'Prezzo opzione ($)',

    /* Payoff distribution */
    distributionTitle:   'Distribuzione dei payoff',
    distributionXLabel:  'Payoff ($)',
    distributionYLabel:  'Frequenza',
    distributionEmpty:   'Avvia una simulazione per vedere la distribuzione dei payoff.',

    /* Price history */
    historyTitle:       'Storico prezzi',
    historySubtitle:    '{ticker} — ultimi {days} giorni di borsa',
    historyEmpty:       "Seleziona un'azione per vedere lo storico prezzi.",
    historyS0Label:     'S₀ (oggi)',
    historyStrikeLabel: 'Prezzo esercizio (K)',
    historySigmaBand:   '±1σ banda',
    historyXLabel:      'Data',
    historyYLabel:      'Prezzo ($)',
  },

  /* ── Progress ──────────────────────────────────────────── */
  progress: {
    idle:       'Configura i parametri e avvia una simulazione.',
    connecting: 'Connessione in corso…',
    running:    'Simulazione: {n} di {total} percorsi…',
    done:       'Simulazione completata.',
    error:      'Simulazione fallita. Riprova.',
  },

  /* ── Footer ────────────────────────────────────────────── */
  footer: {
    project:       'Progetto',
    github:        'GitHub',
    documentation: 'Documentazione',
    methodology:   'Metodologia',

    engine:      'Motore',
    european:    'Opzioni europee',
    asian:       'Opzioni asiatiche',
    blackScholes:'Black-Scholes',

    author:   'Autore',
    linkedin: 'LinkedIn',

    copyright:  '© {year} MCPricer',
    disclaimer: 'Solo per uso didattico — non costituisce consulenza finanziaria.',
  },

  /* ── Errors ────────────────────────────────────────────── */
  errors: {
    tickerNotFound:  "Ticker '{ticker}' non trovato nel database.",
    noVolatility:    'Storico prezzi insufficiente per calcolare la volatilità di {ticker}.',
    wsDisconnected:  'Connessione persa — nuovo tentativo…',
    wsError:         'Errore WebSocket. Aggiorna la pagina e riprova.',
    invalidStrike:   'Il prezzo di esercizio deve essere un numero positivo.',
    invalidMaturity: 'La scadenza deve essere compresa tra 0,01 e 10 anni.',
    invalidRate:     'Il tasso privo di rischio deve essere compreso tra 0 e 1.',
    invalidSims:     'Le simulazioni devono essere comprese tra 1.000 e 1.000.000.',
    requiredField:   'Questo campo è obbligatorio.',
    genericError:    'Si è verificato un errore. Riprova.',
  },

} as const;
