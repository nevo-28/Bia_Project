export type ActiveSurface = 'merchant' | 'developer' | 'admin' | 'partner' | 'checkout' | 'ai';

export type Currency = 'KES' | 'NGN' | 'GHS' | 'ZAR' | 'USD' | 'USDC' | 'USDT';

export type PaymentMethodType = 'mobile_money' | 'card' | 'bank_transfer' | 'stablecoin';

export type ProviderId = 
  | 'mpesa' 
  | 'mtn_momo' 
  | 'airtel_money' 
  | 'pawapay' 
  | 'paystack' 
  | 'flutterwave' 
  | 'bank_nip' 
  | 'stablecoin_polygon' 
  | 'stablecoin_solana' 
  | 'stablecoin_ethereum' 
  | 'stablecoin_aptos';

export type BlockchainNetwork = 'Polygon' | 'Solana' | 'Ethereum' | 'Aptos';

export type KycTier = 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3';

export type KycStatus = 'pending' | 'verified' | 'rejected' | 'escalated';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export type PaymentIntentType = 'collection' | 'disbursement' | 'balance' | 'statement' | 'rebalance';

export interface PaymentMethod {
  type: PaymentMethodType;
  provider: ProviderId;
  phoneNumber?: string;
  accountNumber?: string;
  bankCode?: string;
  cardNumberMasked?: string;
  walletAddress?: string;
  network?: BlockchainNetwork;
}

export interface CollectionRequest {
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  reference: string;
  description: string;
  callbackUrl?: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone: string;
    kycTier: KycTier;
  };
  metadata?: Record<string, any>;
}

export interface DisbursementRequest {
  amount: number;
  currency: Currency;
  recipient: {
    name: string;
    phone?: string;
    accountNumber?: string;
    bankCode?: string;
    walletAddress?: string;
    country: string;
    provider: ProviderId;
  };
  reference: string;
  description: string;
  senderKycTier: KycTier;
  metadata?: Record<string, any>;
}

export interface Transaction {
  id: string;
  reference: string;
  type: 'collection' | 'disbursement' | 'refund' | 'treasury_rebalance';
  status: TransactionStatus;
  amount: number;
  currency: Currency;
  fee: number;
  netAmount: number;
  provider: ProviderId;
  providerReference?: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  recipient?: {
    name: string;
    identifier: string;
    country: string;
  };
  corridor: {
    sourceCountry: string;
    destinationCountry: string;
    sourceCurrency: Currency;
    destinationCurrency: Currency;
  };
  instructions?: {
    type: 'stk_push' | 'qr_code' | 'virtual_account' | 'redirect';
    message: string;
    actionData?: any;
  };
  receipt?: {
    receiptNumber: string;
    timestamp: string;
    rail: string;
  };
  aiAudit?: AiDecisionAudit;
  createdAt: string;
  settledAt?: string;
}

export interface AiExtractedIntent {
  intent: PaymentIntentType;
  amount: number | null;
  currency: Currency | null;
  recipient_network: string | null;
  recipient_country: string | null;
  recipient_identifier: string | null;
  sender_kyc_tier: KycTier | null;
  missing_fields: string[];
}

export interface AiIntentVerification {
  verified: boolean;
  confidence: number; // 0.0 - 1.0
  discrepancies: string[];
  recommendation: 'proceed' | 'ask_user_for_clarification' | 'escalate';
}

export interface RailDecisionFactor {
  rail: ProviderId;
  railName: string;
  costFeePercentage: number;
  costTotal: number;
  estimatedSettlementSeconds: number;
  reliabilityScore: number; // 0 - 100
  availableLiquidityUsd: number;
  complianceRating: 'green' | 'yellow' | 'red';
  weightedScore: number;
  reasoning: string;
}

export interface AiRoutingRecommendation {
  recommendedRail: ProviderId;
  recommendedRailName: string;
  reasoning: string;
  candidateRails: RailDecisionFactor[];
  fxRateUsed?: {
    from: Currency;
    to: Currency;
    rate: number;
  };
  savingsEstimateVsDirect: string;
}

export interface DeterministicPolicyResult {
  decision: 'APPROVE' | 'REJECT' | 'ESCALATE';
  ruleEvaluations: {
    ruleId: string;
    ruleName: string;
    passed: boolean;
    decision: 'APPROVE' | 'REJECT' | 'ESCALATE';
    details: string;
  }[];
  primaryReason?: string;
}

export interface AiDecisionAudit {
  transactionId: string;
  userInputPrompt: string;
  extractedIntent: AiExtractedIntent;
  verificationResult: AiIntentVerification;
  policyValidation: DeterministicPolicyResult;
  routingRecommendation: AiRoutingRecommendation;
  finalRailExecuted: ProviderId;
  timestamp: string;
  durationMs: number;
}

// Double-Entry Ledger
export type AccountType = 'asset' | 'liability' | 'revenue' | 'expense' | 'equity';

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  normalBalance: 'debit' | 'credit';
  isActive: boolean;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  transactionId: string;
  entryNumber: number;
  accountId: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  currency: Currency;
  description: string;
  createdAt: string;
}

// Reconciliation
export type BreakType = 'timing_break' | 'amount_break' | 'missing_transaction';
export type BreakStatus = 'unresolved' | 'investigating' | 'resolved';

export interface ReconciliationBreak {
  id: string;
  type: BreakType;
  provider: ProviderId;
  transactionReference: string;
  ledgerAmount: number;
  providerAmount: number;
  currency: Currency;
  difference: number;
  status: BreakStatus;
  detectedAt: string;
  resolutionNote?: string;
}

// Treasury & Corridor Liquidity
export interface CorridorLiquidity {
  corridorId: string;
  name: string;
  sourceCountry: string;
  destCountry: string;
  currency: Currency;
  currentLiquidityUsd: number;
  targetLiquidityUsd: number;
  minimumBufferUsd: number;
  rebalanceThresholdUsd: number;
  status: 'healthy' | 'warning' | 'critical';
  stablecoinBackbone: BlockchainNetwork[];
}

// Circuit Breakers
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ProviderHealth {
  id: ProviderId;
  name: string;
  type: 'Mobile Money' | 'Aggregator' | 'Cards & Bank' | 'Stablecoin L1/L2';
  countries: string[];
  status: 'healthy' | 'degraded' | 'down';
  circuitState: CircuitState;
  successRate: number; // e.g. 99.4%
  latencyMs: number;
  failureRate5m: number; // e.g. 0.02
  totalRequests24h: number;
  lastChecked: string;
}

// Fraud & AML
export interface FraudCase {
  id: string;
  transactionId: string;
  customerName: string;
  amount: number;
  currency: Currency;
  riskScore: number; // 0-100
  triggers: string[];
  status: 'FLAGGED' | 'ASSIGNED' | 'UNDER_REVIEW' | 'RESOLVED' | 'SAR_FILED';
  assignedTo?: string;
  sarReference?: string;
  createdAt: string;
  updatedAt: string;
}

// Webhooks
export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secretKey: string;
  status: 'active' | 'failing' | 'disabled';
  lastDeliveryStatus?: '200 OK' | '500 Server Error' | 'Timeout';
  totalDeliveries: number;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  eventId: string;
  eventType: string;
  responseCode: number;
  responseDurationMs: number;
  payload: any;
  sentAt: string;
  signature: string;
}

// MCP Protocol
export interface McpToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}
