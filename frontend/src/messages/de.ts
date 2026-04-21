/* ============================================================
   messages/de.ts — Deutsch UI strings (placeholder)
   ============================================================
   Rules:
     • Every string visible in the UI lives here.
     • No hardcoded text in JSX — always import from messages.
   ============================================================ */

export const de = {

  /* ── App shell ─────────────────────────────────────────── */
  app: {
    name:        'MCPricer',
    tagline:     'Monte-Carlo-Optionspreisrechner',
    version:     'v0.1.0',
    disclaimer:  'Nur für Bildungszwecke — keine Anlageberatung.',
  },

  /* ── Navigation ────────────────────────────────────────── */
  nav: {
    pricer:  'Pricer',
    docs:    'Docs',
    about:   'Über uns',
  },

  /* ── Theme toggle ──────────────────────────────────────── */
  theme: {
    light:  'Hell',
    dark:   'Dunkel',
    toggle: 'Design wechseln',
  },

  /* ── Language selector ─────────────────────────────────── */
  language: {
    label:   'Sprache',
    en:      'English',
    it:      'Italiano',
    de:      'Deutsch',
  },

  /* ── Configuration panel ───────────────────────────────── */
  config: {
    title:           'Konfiguration',

    /* Stock */
    stock:           'Aktie',
    stockPlaceholder:'Ticker auswählen…',
    lastPrice:       'Letzter Preis',
    historicalVol:   'Historische Vola σ',

    /* Option style & type */
    optionStyle:     'Optionsstil',
    european:        'Europäisch',
    asian:           'Asiatisch',
    optionType:      'Art',
    call:            'Call',
    put:             'Put',

    /* Parameters */
    parameters:          'Parameter',
    strike:              'Ausübungspreis (K)',
    strikePlaceholder:   'z. B. 210.00',
    maturity:            'Laufzeit (T, Jahre)',
    maturityPlaceholder: 'z. B. 0.50',
    riskFreeRate:        'Risikofreier Zins (r)',
    riskFreePlaceholder: 'z. B. 0.05',
    simulations:         'Simulationen (N)',
    steps:               'Zeitschritte',

    /* Volatility */
    volatility:     'Volatilität (σ)',
    volAuto:        'Auto — historisch',
    volManual:      'Manuell überschreiben',
    volWindow:      'Vola-Fenster',
    volWindowMatch: 'An Laufzeit anpassen',
    volWindow1M:    '1 Monat',
    volWindow3M:    '3 Monate',
    volWindow6M:    '6 Monate',
    volWindow1Y:    '1 Jahr',
    volWindow3Y:    '3 Jahre',

    /* Variance reduction */
    antithetic:      'Antithetische Varianzreduktion',
    antitheticShort: 'Antithetisch',

    /* Actions */
    runButton:     'Simulation starten',
    runningButton: 'Läuft…',
    resetButton:   'Zurücksetzen',
  },

  /* ── Results ───────────────────────────────────────────── */
  results: {
    title:       'Ergebnisse',

    mcPrice:     'MC-Preis',
    stdError:    'Std.-Fehler',
    ci95:        '95%-KI',
    vsBs:        'vs. Black-Scholes',
    bsPrice:     'B&S-Preis',
    elapsed:     'Dauer',
    paths:       'Pfade',
    pathsOf:     '{n} von {total}',
    notAvailable:'N/V',

    /* Badges */
    european:   'Europäisch',
    asian:      'Asiatisch',
    call:       'Call',
    put:        'Put',
    antithetic: 'Antithetisch AN',
  },

  /* ── Charts ────────────────────────────────────────────── */
  charts: {
    /* Convergence */
    convergenceTitle:    'Konvergenz',
    convergenceSubtitle: '{n} Pfade simuliert',
    mcLine:              'MC-Preis',
    bsLine:              'B&S-Referenz',
    ciBand:              '95%-KI',
    xAxisLabel:          'Pfade (×1.000)',
    yAxisLabel:          'Optionspreis ($)',

    /* Payoff distribution */
    distributionTitle:   'Payoff-Verteilung',
    distributionXLabel:  'Payoff ($)',
    distributionYLabel:  'Häufigkeit',
    distributionEmpty:   'Simulation starten, um die Payoff-Verteilung anzuzeigen.',

    /* Price history */
    historyTitle:       'Kursverlauf',
    historySubtitle:    '{ticker} — letzte {days} Handelstage',
    historyEmpty:       'Aktie auswählen, um den Kursverlauf anzuzeigen.',
    historyS0Label:     'S₀ (heute)',
    historyStrikeLabel: 'Ausübungspreis (K)',
    historySigmaBand:   '±1σ Band',
    historyXLabel:      'Datum',
    historyYLabel:      'Preis ($)',
  },

  /* ── Progress ──────────────────────────────────────────── */
  progress: {
    idle:       'Parameter konfigurieren und Simulation starten.',
    connecting: 'Verbinde…',
    running:    'Simuliere {n} von {total} Pfaden…',
    done:       'Simulation abgeschlossen.',
    error:      'Simulation fehlgeschlagen. Bitte erneut versuchen.',
  },

  /* ── Footer ────────────────────────────────────────────── */
  footer: {
    project:       'Projekt',
    github:        'GitHub',
    documentation: 'Dokumentation',
    methodology:   'Methodik',

    engine:      'Engine',
    european:    'Europäische Optionen',
    asian:       'Asiatische Optionen',
    blackScholes:'Black-Scholes',

    author:   'Autor',
    linkedin: 'LinkedIn',

    copyright:  '© {year} MCPricer',
    disclaimer: 'Nur für Bildungszwecke — keine Anlageberatung.',
  },

  /* ── Errors ────────────────────────────────────────────── */
  errors: {
    tickerNotFound:  "Ticker '{ticker}' nicht in der Datenbank gefunden.",
    noVolatility:    'Nicht genügend Kursdaten zur Berechnung der Volatilität für {ticker}.',
    wsDisconnected:  'Verbindung verloren — neuer Versuch…',
    wsError:         'WebSocket-Fehler. Bitte Seite neu laden und erneut versuchen.',
    invalidStrike:   'Der Ausübungspreis muss eine positive Zahl sein.',
    invalidMaturity: 'Die Laufzeit muss zwischen 0,01 und 10 Jahren liegen.',
    invalidRate:     'Der risikofreie Zinssatz muss zwischen 0 und 1 liegen.',
    invalidSims:     'Die Simulationszahl muss zwischen 1.000 und 1.000.000 liegen.',
    requiredField:   'Dieses Feld ist erforderlich.',
    genericError:    'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
  },

} as const;
