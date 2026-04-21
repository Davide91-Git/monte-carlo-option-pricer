/* ============================================================
   messages/en.ts — English UI strings
   ============================================================ */

export const en = {

  app: {
    name:        'MCPricer',
    tagline:     'Monte Carlo Option Pricing Engine',
    version:     'v0.1.0',
    disclaimer:  'For educational use only — not financial advice.',
  },

  nav: {
    pricer:  'Pricer',
    docs:    'Docs',
    about:   'About',
  },

  theme: {
    light:  'Light',
    dark:   'Dark',
    toggle: 'Toggle theme',
  },

  language: {
    label: 'Language',
    en:    'English',
    it:    'Italiano',
    de:    'Deutsch',
  },

  config: {
    title:               'Configuration',
    stock:               'Stock',
    stockPlaceholder:    'Select a ticker…',
    lastPrice:           'Last price',
    historicalVol:       'Historical σ',
    optionStyle:         'Option style',
    european:            'European',
    asian:               'Asian',
    optionType:          'Type',
    call:                'Call',
    put:                 'Put',
    parameters:          'Parameters',
    strike:              'Strike (K)',
    strikePlaceholder:   'e.g. 210.00',
    maturity:            'Maturity (T, yr)',
    maturityPlaceholder: 'e.g. 0.50',
    riskFreeRate:        'Risk-free rate (r)',
    riskFreePlaceholder: 'e.g. 0.05',
    simulations:         'Simulations (N)',
    steps:               'Time steps',
    volatility:          'Volatility (σ)',
    volAuto:             'Auto — historical',
    volManual:           'Manual override',
    volWindow:           'Vol window',
    volWindowMatch:      'Match maturity',
    volWindow1M:         '1 month',
    volWindow3M:         '3 months',
    volWindow6M:         '6 months',
    volWindow1Y:         '1 year',
    volWindow3Y:         '3 years',
    antithetic:          'Antithetic variance reduction',
    antitheticShort:     'Antithetic',
    runButton:           'Run simulation',
    runningButton:       'Running…',
    resetButton:         'Reset',
  },

  results: {
    title:        'Results',
    mcPrice:      'MC Price',
    stdError:     'Std. Error',
    ci95:         '95% CI',
    vsBs:         'vs Black-Scholes',
    bsPrice:      'B&S price',
    elapsed:      'Elapsed',
    paths:        'Paths',
    pathsOf:      '{n} of {total}',
    notAvailable: 'N/A',
    european:     'European',
    asian:        'Asian',
    call:         'Call',
    put:          'Put',
    antithetic:   'Antithetic ON',
  },

  charts: {
    convergenceTitle:    'Convergence',
    convergenceSubtitle: '{n} paths simulated',
    mcLine:              'MC price',
    bsLine:              'B&S benchmark',
    ciBand:              '95% CI',
    xAxisLabel:          'Paths (×1,000)',
    yAxisLabel:          'Option price ($)',
    distributionTitle:   'Payoff distribution',
    distributionXLabel:  'Payoff ($)',
    distributionYLabel:  'Frequency',
    distributionEmpty:   'Run a simulation to see the payoff distribution.',
    historyTitle:        'Price history',
    historySubtitle:     '{ticker} — last {days} trading days',
    historyEmpty:        'Select a stock to see price history.',
    historyS0Label:      'S₀ (today)',
    historyStrikeLabel:  'Strike (K)',
    historySigmaBand:    '±1σ band',
    historyXLabel:       'Date',
    historyYLabel:       'Price ($)',
  },

  progress: {
    idle:        'Configure parameters and run a simulation.',
    connecting:  'Connecting…',
    running:     'Simulating {n} of {total} paths…',
    done:        'Simulation complete.',
    error:       'Simulation failed. Please try again.',
  },

  footer: {
    project:       'Project',
    github:        'GitHub',
    documentation: 'Documentation',
    methodology:   'Methodology',
    engine:        'Engine',
    european:      'European options',
    asian:         'Asian options',
    blackScholes:  'Black-Scholes',
    author:        'Author',
    linkedin:      'LinkedIn',
    copyright:     '© {year} MCPricer',
    disclaimer:    'For educational use only — not financial advice.',
  },

  errors: {
    tickerNotFound:  "Ticker '{ticker}' not found in the database.",
    noVolatility:    'Not enough price history to compute volatility for {ticker}.',
    wsDisconnected:  'Connection lost — retrying…',
    wsError:         'WebSocket error. Please refresh and try again.',
    invalidStrike:   'Strike must be a positive number.',
    invalidMaturity: 'Maturity must be between 0.01 and 10 years.',
    invalidRate:     'Risk-free rate must be between 0 and 1.',
    invalidSims:     'Simulations must be between 1,000 and 1,000,000.',
    requiredField:   'This field is required.',
    genericError:    'Something went wrong. Please try again.',
  },

};

/* ── Type helpers ──────────────────────────────────────────────
   DeepString converts all leaf values to `string` so that
   translated files (it.ts, de.ts) can have different string
   values without TypeScript complaining about literal mismatches.
   ──────────────────────────────────────────────────────────── */
type DeepString<T> = {
  readonly [K in keyof T]: T[K] extends string
    ? string
    : DeepString<T[K]>;
};

export type Messages = DeepString<typeof en>;
