import { 
  Transaction, 
  LedgerAccount, 
  JournalEntry, 
  ProviderHealth, 
  CorridorLiquidity, 
  ReconciliationBreak, 
  FraudCase, 
  WebhookEndpoint, 
  WebhookDeliveryLog 
} from '../../types';

export const INITIAL_PROVIDERS: ProviderHealth[] = [
  {
    id: 'mpesa',
    name: 'M-PESA (Safaricom Daraja)',
    type: 'Mobile Money',
    countries: ['KE', 'TZ', 'CD', 'GH'],
    status: 'healthy',
    circuitState: 'CLOSED',
    successRate: 99.4,
    latencyMs: 380,
    failureRate5m: 0.006,
    totalRequests24h: 184520,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    type: 'Mobile Money',
    countries: ['GH', 'UG', 'RW', 'NG', 'CM', 'CI', 'ZM'],
    status: 'healthy',
    circuitState: 'CLOSED',
    successRate: 98.8,
    latencyMs: 440,
    failureRate5m: 0.012,
    totalRequests24h: 142100,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money Africa',
    type: 'Mobile Money',
    countries: ['KE', 'UG', 'TZ', 'NG', 'ZM', 'MW'],
    status: 'healthy',
    circuitState: 'CLOSED',
    successRate: 97.9,
    latencyMs: 510,
    failureRate5m: 0.021,
    totalRequests24h: 68900,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'pawapay',
    name: 'PawaPay Aggregator',
    type: 'Aggregator',
    countries: ['KE', 'GH', 'UG', 'TZ', 'RW', 'SN', 'CI', 'CD'],
    status: 'healthy',
    circuitState: 'CLOSED',
    successRate: 99.1,
    latencyMs: 410,
    failureRate5m: 0.009,
    totalRequests24h: 96300,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'paystack',
    name: 'Paystack (Stripe)',
    type: 'Cards & Bank',
    countries: ['NG', 'GH', 'ZA', 'KE'],
    status: 'healthy',
    circuitState: 'CLOSED',
    successRate: 99.6,
    latencyMs: 290,
    failureRate5m: 0.004,
    totalRequests24h: 215000,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave Enterprise',
    type: 'Cards & Bank',
    countries: ['NG', 'KE', 'GH', 'ZA', 'UG', 'RW'],
    status: 'healthy',
    circuitState: 'CLOSED',
    successRate: 98.2,
    latencyMs: 470,
    failureRate5m: 0.018,
    totalRequests24h: 110400,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'bank_nip',
    name: 'NIBSS NIP Bank Rail',
    type: 'Cards & Bank',
    countries: ['NG'],
    status: 'healthy',
    circuitState: 'CLOSED',
    successRate: 97.5,
    latencyMs: 620,
    failureRate5m: 0.025,
    totalRequests24h: 89000,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'stablecoin_polygon',
    name: 'USDC Settlement (Polygon PoS)',
    type: 'Stablecoin L1/L2',
    countries: ['GLOBAL', 'KE', 'NG', 'GH', 'ZA'],
    status: 'healthy',
    circuitState: 'CLOSED',
    successRate: 99.9,
    latencyMs: 2200,
    failureRate5m: 0.001,
    totalRequests24h: 42100,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'stablecoin_solana',
    name: 'USDC Settlement (Solana)',
    type: 'Stablecoin L1/L2',
    countries: ['GLOBAL', 'KE', 'NG', 'GH', 'ZA'],
    status: 'healthy',
    circuitState: 'CLOSED',
    successRate: 99.8,
    latencyMs: 420,
    failureRate5m: 0.002,
    totalRequests24h: 53200,
    lastChecked: new Date().toISOString()
  },
  {
    id: 'stablecoin_ethereum',
    name: 'USDC/USDT (Ethereum Mainnet)',
    type: 'Stablecoin L1/L2',
    countries: ['GLOBAL'],
    status: 'healthy',
    circuitState: 'CLOSED',
    successRate: 99.9,
    latencyMs: 12400,
    failureRate5m: 0.001,
    totalRequests24h: 8900,
    lastChecked: new Date().toISOString()
  }
];

export const INITIAL_CORRIDORS: CorridorLiquidity[] = [
  {
    corridorId: 'cor_ke_ng',
    name: 'Kenya ⇄ Nigeria Corridor (KES / NGN)',
    sourceCountry: 'KE',
    destCountry: 'NG',
    currency: 'NGN',
    currentLiquidityUsd: 1240500,
    targetLiquidityUsd: 1000000,
    minimumBufferUsd: 400000,
    rebalanceThresholdUsd: 600000,
    status: 'healthy',
    stablecoinBackbone: ['Polygon', 'Solana']
  },
  {
    corridorId: 'cor_ke_gh',
    name: 'Kenya ⇄ Ghana Corridor (KES / GHS)',
    sourceCountry: 'KE',
    destCountry: 'GH',
    currency: 'GHS',
    currentLiquidityUsd: 385000,
    targetLiquidityUsd: 300000,
    minimumBufferUsd: 100000,
    rebalanceThresholdUsd: 200000,
    status: 'healthy',
    stablecoinBackbone: ['Polygon', 'Solana']
  },
  {
    corridorId: 'cor_ng_za',
    name: 'Nigeria ⇄ South Africa (NGN / ZAR)',
    sourceCountry: 'NG',
    destCountry: 'ZA',
    currency: 'ZAR',
    currentLiquidityUsd: 610000,
    targetLiquidityUsd: 500000,
    minimumBufferUsd: 200000,
    rebalanceThresholdUsd: 300000,
    status: 'healthy',
    stablecoinBackbone: ['Polygon', 'Ethereum']
  },
  {
    corridorId: 'cor_us_ke',
    name: 'Global US/EU ⇄ Kenya (USD / KES)',
    sourceCountry: 'US',
    destCountry: 'KE',
    currency: 'KES',
    currentLiquidityUsd: 780000,
    targetLiquidityUsd: 500000,
    minimumBufferUsd: 200000,
    rebalanceThresholdUsd: 300000,
    status: 'healthy',
    stablecoinBackbone: ['Solana', 'Polygon']
  }
];

export const INITIAL_LEDGER_ACCOUNTS: LedgerAccount[] = [
  {
    id: 'acc_asset_settlement_kes',
    code: '1010-KES',
    name: 'Settlement Account — KES Safaricom Trust',
    type: 'asset',
    currency: 'KES',
    balance: 78540200,
    normalBalance: 'debit',
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_asset_settlement_ngn',
    code: '1020-NGN',
    name: 'Settlement Account — NGN NIBSS / Paystack',
    type: 'asset',
    currency: 'NGN',
    balance: 1950400000,
    normalBalance: 'debit',
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_asset_treasury_usdc',
    code: '1050-USDC',
    name: 'Treasury Reserves — Circle USDC Vault',
    type: 'asset',
    currency: 'USDC',
    balance: 2840000,
    normalBalance: 'debit',
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_liability_merchant_balances',
    code: '2010-USD',
    name: 'Merchant Available Balances',
    type: 'liability',
    currency: 'USD',
    balance: 2310500,
    normalBalance: 'credit',
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_revenue_gateway_fees',
    code: '4010-USD',
    name: 'Platform Gateway & Switching Fees',
    type: 'revenue',
    currency: 'USD',
    balance: 184500,
    normalBalance: 'credit',
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_expense_provider_costs',
    code: '5010-USD',
    name: 'Provider Rail & Gas Processing Expenses',
    type: 'expense',
    currency: 'USD',
    balance: 92400,
    normalBalance: 'debit',
    isActive: true,
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'pay_ke_901248102',
    reference: 'INV-2026-NBO-001',
    type: 'collection',
    status: 'completed',
    amount: 14500,
    currency: 'KES',
    fee: 217.5,
    netAmount: 14282.5,
    provider: 'mpesa',
    providerReference: 'WS_CO_26092026_98124',
    customer: {
      id: 'cust_ke_001',
      name: 'Wangari Kamau',
      phone: '+254712345678',
      email: 'wangari@africatrade.ke'
    },
    corridor: {
      sourceCountry: 'KE',
      destinationCountry: 'KE',
      sourceCurrency: 'KES',
      destinationCurrency: 'KES'
    },
    instructions: {
      type: 'stk_push',
      message: 'M-PESA PIN prompt sent to +254712345678'
    },
    receipt: {
      receiptNumber: 'QWE19482KA',
      timestamp: '2026-09-27T10:14:22Z',
      rail: 'M-PESA Lipa Na M-PESA Online'
    },
    createdAt: '2026-09-27T10:14:02Z',
    settledAt: '2026-09-27T10:14:22Z'
  },
  {
    id: 'disb_xb_gh_8192031',
    reference: 'PAYOUT-FREELANCE-GH-044',
    type: 'disbursement',
    status: 'completed',
    amount: 450,
    currency: 'USD',
    fee: 4.5,
    netAmount: 445.5,
    provider: 'stablecoin_solana',
    providerReference: 'sol_tx_9f81a7d620e',
    recipient: {
      name: 'Kwesi Mensah',
      identifier: '+233241234567 (MTN MoMo Ghana)',
      country: 'GH'
    },
    corridor: {
      sourceCountry: 'US',
      destinationCountry: 'GH',
      sourceCurrency: 'USD',
      destinationCurrency: 'GHS'
    },
    aiAudit: {
      transactionId: 'disb_xb_gh_8192031',
      userInputPrompt: 'Send $450 to Kwesi Mensah in Ghana on MTN MoMo +233241234567 for design work',
      extractedIntent: {
        intent: 'disbursement',
        amount: 450,
        currency: 'USD',
        recipient_network: 'MTN MoMo',
        recipient_country: 'GH',
        recipient_identifier: '+233241234567',
        sender_kyc_tier: 'tier_2',
        missing_fields: []
      },
      verificationResult: {
        verified: true,
        confidence: 0.99,
        discrepancies: [],
        recommendation: 'proceed'
      },
      policyValidation: {
        decision: 'APPROVE',
        ruleEvaluations: [
          { ruleId: 'rule_kyc_tier_limit', ruleName: 'Tier 2 Max Limit ($5,000)', passed: true, decision: 'APPROVE', details: '$450 is within limit' },
          { ruleId: 'rule_sanctions_ofac', ruleName: 'OFAC & UN Watchlist', passed: true, decision: 'APPROVE', details: 'No matches found' },
          { ruleId: 'rule_corridor_active', ruleName: 'US-GH Corridor Status', passed: true, decision: 'APPROVE', details: 'Corridor active with healthy liquidity' }
        ]
      },
      routingRecommendation: {
        recommendedRail: 'stablecoin_solana',
        recommendedRailName: 'Solana USDC Settlement -> Local Off-Ramp',
        reasoning: 'Stablecoin routing via Solana selected: 1.0% fee vs 3.5% correspondent bank; settlement speed 4.2 seconds; destination treasury has $385k GHS liquidity.',
        candidateRails: [],
        savingsEstimateVsDirect: 'Saved $12.50 (62% fee reduction)'
      },
      finalRailExecuted: 'stablecoin_solana',
      timestamp: '2026-09-27T11:02:18Z',
      durationMs: 412
    },
    createdAt: '2026-09-27T11:02:15Z',
    settledAt: '2026-09-27T11:02:20Z'
  },
  {
    id: 'pay_ng_401928312',
    reference: 'SUB-ENTERPRISE-LAG-99',
    type: 'collection',
    status: 'completed',
    amount: 1250000,
    currency: 'NGN',
    fee: 18750,
    netAmount: 1231250,
    provider: 'paystack',
    providerReference: 'pstk_ch_8219481924',
    customer: {
      id: 'cust_ng_88',
      name: 'Chukwuma Obi',
      email: 'c.obi@nexuslogistics.ng',
      phone: '+2348031234567'
    },
    corridor: {
      sourceCountry: 'NG',
      destinationCountry: 'NG',
      sourceCurrency: 'NGN',
      destinationCurrency: 'NGN'
    },
    createdAt: '2026-09-27T12:20:11Z',
    settledAt: '2026-09-27T12:20:45Z'
  },
  {
    id: 'pay_za_19284712',
    reference: 'CART-CPT-8192',
    type: 'collection',
    status: 'pending',
    amount: 3200,
    currency: 'ZAR',
    fee: 48,
    netAmount: 3152,
    provider: 'pawapay',
    customer: {
      id: 'cust_za_31',
      name: 'Thabo Mokoena',
      phone: '+27821234567'
    },
    corridor: {
      sourceCountry: 'ZA',
      destinationCountry: 'ZA',
      sourceCurrency: 'ZAR',
      destinationCurrency: 'ZAR'
    },
    createdAt: '2026-09-27T14:10:00Z'
  }
];

export const INITIAL_BREAKS: ReconciliationBreak[] = [
  {
    id: 'brk_101',
    type: 'timing_break',
    provider: 'mtn_momo',
    transactionReference: 'PAYOUT-GH-9912',
    ledgerAmount: 2400,
    providerAmount: 2400,
    currency: 'GHS',
    difference: 0,
    status: 'investigating',
    detectedAt: '2026-09-27T13:00:00Z',
    resolutionNote: 'Waiting for T+0 settlement callback confirmation from MTN gateway'
  },
  {
    id: 'brk_102',
    type: 'amount_break',
    provider: 'bank_nip',
    transactionReference: 'NIP-DISB-NG-402',
    ledgerAmount: 50000,
    providerAmount: 49950,
    currency: 'NGN',
    difference: 50,
    status: 'unresolved',
    detectedAt: '2026-09-27T11:45:00Z',
    resolutionNote: 'Provider charged unforeseen N50 stamp duty fee deducted at source'
  }
];

export const INITIAL_FRAUD_CASES: FraudCase[] = [
  {
    id: 'case_aml_901',
    transactionId: 'pay_xb_flagged_01',
    customerName: 'Al-Hassan Traders LLC',
    amount: 14500,
    currency: 'USD',
    riskScore: 78,
    triggers: ['Velocity spike (>4tx in 1hr)', 'Cross-border round amount', 'First time corridor'],
    status: 'UNDER_REVIEW',
    assignedTo: 'Fatima Balogun (Compliance Officer)',
    createdAt: '2026-09-27T09:30:00Z',
    updatedAt: '2026-09-27T11:00:00Z'
  },
  {
    id: 'case_aml_902',
    transactionId: 'pay_xb_flagged_02',
    customerName: 'Kiprotich Ventures',
    amount: 32000,
    currency: 'USD',
    riskScore: 89,
    triggers: ['Exceeds Tier 2 limit without EDD', 'Adverse media keyword match'],
    status: 'FLAGGED',
    createdAt: '2026-09-27T14:02:00Z',
    updatedAt: '2026-09-27T14:02:00Z'
  }
];

export const INITIAL_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'wh_prod_01',
    url: 'https://api.merchant-platform.africa/webhooks/bia',
    events: ['payment.completed', 'payment.failed', 'disbursement.settled'],
    secretKey: 'whsec_a91f88e2194b02c8172da781c0',
    status: 'active',
    lastDeliveryStatus: '200 OK',
    totalDeliveries: 12480
  },
  {
    id: 'wh_prod_02',
    url: 'https://freelancepayouts.global/integrations/bia-events',
    events: ['disbursement.settled', 'reconciliation.break_flagged'],
    secretKey: 'whsec_5b9914c810dfa77329188e990a',
    status: 'active',
    lastDeliveryStatus: '200 OK',
    totalDeliveries: 4182
  }
];

export const INITIAL_DELIVERY_LOGS: WebhookDeliveryLog[] = [
  {
    id: 'log_wh_901',
    webhookId: 'wh_prod_01',
    eventId: 'evt_pay_ke_901248102',
    eventType: 'payment.completed',
    responseCode: 200,
    responseDurationMs: 142,
    payload: {
      event: 'payment.completed',
      id: 'pay_ke_901248102',
      amount: 14500,
      currency: 'KES',
      reference: 'INV-2026-NBO-001'
    },
    sentAt: '2026-09-27T10:14:23Z',
    signature: 't=1758968063,v1=9f8a17c...'
  }
];
