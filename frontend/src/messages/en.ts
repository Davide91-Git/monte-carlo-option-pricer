/* ============================================================
   messages/en.ts — English UI strings
   ============================================================ */

export const en = {

  app: {
    name:       'MCPricer',
    tagline:    'Monte Carlo Option Pricing Engine',
    version:    'v0.1.0',
    disclaimer: 'For educational use only — not financial advice.',
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
  },

  /* ── Disclaimer modal — shown on first visit ── */
  modal: {
    title:       'Terms of Use & Disclaimer',
    subtitle:    'Please read carefully before using MCPricer',
    body:        'This application is built for learning and demonstration purposes only. All pricing models, simulations, and results produced by this tool are theoretical and do not constitute financial advice, investment recommendations, or solicitation of any kind.',
    termsTitle:  'Terms of use',
    terms: [
      'This tool does not use real-time market data. Prices and volatility figures may be outdated.',
      'Monte Carlo simulations are probabilistic estimates. Results carry statistical uncertainty.',
      'The author assumes no responsibility for any decisions made based on outputs from this tool.',
      'By proceeding, you confirm that you are using this tool solely for educational purposes.',
    ],
    accept: 'Accept and continue',
  },

  config: {
    title:               'Run Configuration',
    stock:               'Stock',
    stockPlaceholder:    'Select a ticker…',
    lastPrice:           'Last price',
    historicalVol:       'Historical σ',
    optionType:          'Option type',
    european:            'European',
    asian:               'Asian',
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
    parallel:            'Parallel simulation (multi-core)',
    runButton:           'Run',
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
    historySubtitle:     'last {days} trading days',
    historyEmpty:        'Select a stock to see price history.',
    historyS0Label:      'S₀ (last price)',
    historyStrikeLabel:  'Strike (K)',
    historyXLabel:       'Date',
    historyYLabel:       'Price ($)',
  },

  progress: {
    idle:       'Configure parameters and run a simulation.',
    connecting: 'Connecting…',
    running:    'Simulating {n} of {total} paths…',
    done:       'Simulation complete.',
    error:      'Simulation failed. Please try again.',
  },

  footer: {
    project:    'Project',
    github:     'GitHub',
    author:     'Author',
    linkedin:   'LinkedIn',
    copyright:  '© {year} MCPricer',
    disclaimer: 'For educational use only — not financial advice.',
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

type DeepString<T> = {
  readonly [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends readonly string[]
      ? readonly string[]
      : DeepString<T[K]>;
};

export type Messages = DeepString<typeof en>;