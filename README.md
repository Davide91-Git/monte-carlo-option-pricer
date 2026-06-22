---
title: Monte Carlo Option Pricer
emoji: 📈
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
license: mit
---

# Monte Carlo Option Pricer

A Monte Carlo engine for pricing **European** and **Asian** options, built with FastAPI, React and PostgreSQL.

Simulates up to **200,000 price paths** on 7 DJIA underlyings using real historical market data. The convergence chart updates live via WebSocket as each batch of paths completes. For European options the result is validated in real time against the Black-Scholes closed-form benchmark.

> **Note:** Path count is capped at 200,000 on this free-tier demo. For the full 1,000,000-path experience, clone and run locally — see the link below.

> ⚠️ For educational and research purposes only. Nothing here constitutes financial or investment advice.

**Full documentation, validation results and methodology:**
[github.com/Davide91-Git/monte-carlo-option-pricer](https://github.com/Davide91-Git/monte-carlo-option-pricer)