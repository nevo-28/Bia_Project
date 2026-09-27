# Bia — Pan-African Payment Interoperability & Settlement Infrastructure

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg?logo=typescript)]()
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg?logo=react)]()
[![DeepSeek](https://img.shields.io/badge/AI%20Brain-DeepSeek%20V3%20%2F%20R1-635BFF.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

> **Bia** is an enterprise-grade payment interoperability and settlement infrastructure designed to unify Africa's fragmented payment rails. It abstracts 50+ African payment methods (mobile money, instant bank transfers, cards, and regulated stablecoins) behind a single unified API, powered by **DeepSeek AI** for natural language routing and a **deterministic, fail-closed compliance policy engine**.

---

## 🌟 Key Highlights

- **Unified Payment Gateway**: Single integration for **Safaricom M-PESA**, **MTN Mobile Money**, **Airtel Money**, **Moniepoint / NIBSS**, **Cards**, and **Circle USDC** (Solana, Polygon, Base).
- **DeepSeek AI Brain**: Integrates **DeepSeek-Chat (V3)** and **DeepSeek-Reasoner (R1)** for intent extraction and adversarial cross-verification.
- **Two-Call Verification Architecture**: Eliminates LLM hallucination in financial transactions through semantic extraction followed by an adversarial check.
- **Deterministic Policy Safety Gate (PRD §4 & §9)**: Pure deterministic code enforces KYC tier limits, OFAC & African Union sanctions screening, and FATF Recommendation 16 Travel Rule (**Fail-Closed** principle; zero LLM in the money path).
- **Multi-Attribute Routing Engine**: Dynamically scores payment rails based on real-time cost (35%), speed (30%), reliability (20%), liquidity (10%), and compliance (5%).
- **Double-Entry Ledger & Automated Reconciliation**: Immutable, cryptographically verified ledger with balanced debit/credit journals and automated break resolution.
- **Stablecoin Treasury & PAPSS Net Settlement**: Multilateral clearing manifests with central bank escrow reserves and Circle USDC multi-sig vault backstops.
- **Drop-In Checkout Elements**: Stripe-grade embeddable React SDK and vanilla JS payment widget tailored for African mobile money and instant EFT.
- **Model Context Protocol (MCP) Server**: Standard JSON-RPC 2.0 interface enabling autonomous AI agents to check balances, collect funds, and disburse payouts safely.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT SURFACES                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Merchant     │  │ Developer    │  │ Admin/Ops    │  │ MCP Clients  │     │
│  │ Dashboard    │  │ Portal       │  │ Console      │  │ (AI Agents)  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UNIFIED API GATEWAY                                 │
│  • Idempotency Engine  • Rate Limiting  • OAuth 2.0 / API Keys  • Webhooks │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              DEEPSEEK AI BRAIN (Two-Call Verification)                      │
│  • Call 1: Intent Extraction via DeepSeek Chat (V3)                         │
│  • Call 2: Adversarial Verification via DeepSeek Reasoner (R1)              │
│  • Output: Structured PaymentIntent JSON (No Fund Authorization)            │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 DETERMINISTIC POLICY ENGINE (FAIL-CLOSED)                   │
│  • KYC Tier Limits  • OFAC / AU Watchlist Screening  • Velocity Circuits    │
│  • FX Controls  • FATF Rec 16 Travel Rule  • Automated SAR Filing           │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  AI ROUTING      │   │  DOUBLE-ENTRY    │   │  TREASURY &      │
│  RECOMMENDER     │   │  LEDGER SERVICE  │   │  STABLECOIN      │
│  (5-Factor)      │   │  (Balanced Debits│   │  (Circle USDC    │
│                  │   │   & Credits)     │   │   Multichain)    │
└─────────┬────────┘   └──────────────────┘   └──────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PAYMENT EXECUTION LAYER                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ M-PESA      │ │ MTN MoMo    │ │ Moniepoint  │ │ PAPSS       │          │
│  │ Daraja      │ │ Aggregator  │ │ NIP Bank    │ │ Bilateral   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Solana USDC │ │ Polygon PoS │ │ Base Chain  │ │ Card Switch │          │
│  │ Sub-second  │ │ Low Gas Fee │ │ L2 Clearing │ │ 3DS 2.2     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Platform Surfaces

The platform includes 6 dedicated, production-ready surfaces styled with Stripe-grade visual hierarchy:

| Surface | Description | Key Features |
|---|---|---|
| **Merchant Dashboard** | Daily operations hub for Pan-African businesses | Live float metrics, volume trends, corridor health meters, recent transactions with detail timeline drawer, payment collection modal. |
| **Developer Portal** | Interactive developer experience | API reference, dynamic multi-language code generator (TypeScript, Python, Go, cURL), live sandbox playground, rail status & TPS meters, SDK quickstarts. |
| **Admin & Ops Console** | Central banking & operations console | Real-time circuit breaker trips/resets, balanced double-entry ledger journals, reconciliation break resolution, AML/SAR case management (NFIU, FIC, FRC), stablecoin vault treasury. |
| **Institutional Partner Portal** | B2B & regulatory clearing | Corporate KYB due diligence directory, UBO disclosure, multilateral net settlement reports, CBK-NBR & PAPSS passporting, Circle USDC escrow reserves. |
| **Bia Elements & Checkout** | Drop-in embeddable checkout UI | Dual-column layout with 256-bit TLS badge, M-PESA STK Push, MTN MoMo USSD, Moniepoint dynamic virtual account, multi-currency switcher (KES, NGN, GHS, ZAR, USD). |
| **AI Intent & MCP Terminal** | DeepSeek-powered autonomous agent interface | Natural language payment prompt dispatcher, real-time step-by-step audit pipeline, deterministic policy verdicts, registered Model Context Protocol (MCP) tool server. |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- (Optional) **DeepSeek API Key** from [DeepSeek Platform](https://platform.deepseek.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/nevo-28/Bia_Project/tree/main
cd bia

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be live at `http://localhost:3000/`.

### DeepSeek API Configuration

Bia works out of the box with a local deterministic sandbox simulator. To connect live DeepSeek intelligence:

1. Create a `.env` file in the root directory:
   ```env
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```
2. Or configure it directly within the UI by navigating to **AI & MCP Terminal** and clicking **"Set DeepSeek API Key"**.
