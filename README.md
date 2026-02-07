# Sparkhacks 2026 - AEGIS — Algorithmic Evaluation & Governance Intelligence System

AEGIS is an interactive narrative simulation built with Next.js and Tailwind CSS. You play an analyst inside a state-scale decision engine, processing cases and ratifying AI recommendations. Your actions shape both citizen outcomes and your own operator profile, with escalating tension between compliance, audit risk, and moral intervention.

## Features

- 10 narrative cases with escalating complexity and consequences
- Operator metrics: throughput, deviation rate, audit heat, access level
- Actions: Approve, Disagree, Override (with justification)
- Dynamic UI feedback: redaction, audit warnings, system messages
- End-of-game summary and replay

## Getting Started

1. Install dependencies:
   ```
   cd aegis
   npm install
   ```
2. Start the development server:
   ```
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `aegis/src/app/` — Pages and main UI
- `aegis/src/components/` — UI components
- `aegis/src/data/cases.ts` — Case definitions
- `aegis/src/state/operatorStore.ts` — Global state management
---
