import { 
  Transaction, 
  CollectionRequest, 
  DisbursementRequest, 
  AiDecisionAudit, 
  WebhookEndpoint, 
  WebhookDeliveryLog,
  ProviderId 
} from '../../types';
import { INITIAL_TRANSACTIONS, INITIAL_WEBHOOKS, INITIAL_DELIVERY_LOGS } from './seedData';
import { AiIntentEngine } from './aiIntentEngine';
import { DeterministicPolicyEngine } from './policyEngine';
import { ledgerService } from './ledgerService';
import { circuitBreakers } from './circuitBreaker';
import { fraudAmlService } from './fraudAmlService';

export class BiaGateway {
  private transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
  private webhooks: WebhookEndpoint[] = [...INITIAL_WEBHOOKS];
  private deliveryLogs: WebhookDeliveryLog[] = [...INITIAL_DELIVERY_LOGS];
  private idempotencyStore: Map<string, any> = new Map();
  private rateLimitCounter: number = 42;

  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.transactions.find(t => t.id === id || t.reference === id);
  }

  public getWebhooks(): WebhookEndpoint[] {
    return [...this.webhooks];
  }

  public getDeliveryLogs(): WebhookDeliveryLog[] {
    return [...this.deliveryLogs];
  }

  public getRateLimitInfo(): { limit: number; remaining: number; reset: number } {
    return {
      limit: 600,
      remaining: 600 - this.rateLimitCounter,
      reset: Math.floor(Date.now() / 1000) + 45
    };
  }

  /**
   * Module 1: POST /v1/payments/collect
   */
  public async collect(req: CollectionRequest, idempotencyKey?: string): Promise<{
    transaction: Transaction;
    isIdempotentReplay: boolean;
  }> {
    if (idempotencyKey && this.idempotencyStore.has(idempotencyKey)) {
      return {
        transaction: this.idempotencyStore.get(idempotencyKey),
        isIdempotentReplay: true
      };
    }

    this.rateLimitCounter++;
    const fee = req.amount * 0.015; // 1.5% fee
    const txnId = `pay_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Check circuit breaker for provider
    const providerHealth = circuitBreakers.getProvider(req.paymentMethod.provider);
    let selectedProvider = req.paymentMethod.provider;

    if (providerHealth && providerHealth.circuitState === 'OPEN') {
      // Circuit is open! Auto failover to aggregator or stablecoin
      console.warn(`Provider ${req.paymentMethod.provider} circuit is OPEN! Failing over...`);
      selectedProvider = 'pawapay';
    }

    // Instructions based on method
    let instructions: Transaction['instructions'] = undefined;
    if (req.paymentMethod.type === 'mobile_money') {
      instructions = {
        type: 'stk_push',
        message: `M-PESA / Mobile Money prompt sent to ${req.paymentMethod.phoneNumber}. Please enter your PIN.`
      };
    } else if (req.paymentMethod.type === 'stablecoin') {
      instructions = {
        type: 'qr_code',
        message: `Send exact USDC to treasury address: 0x71bE...941a on ${req.paymentMethod.network || 'Polygon'}`
      };
    } else if (req.paymentMethod.type === 'bank_transfer') {
      instructions = {
        type: 'virtual_account',
        message: 'Transfer to Providus Bank Virtual Account: 991204812 (Bia / Merchant)'
      };
    }

    const transaction: Transaction = {
      id: txnId,
      reference: req.reference || `REF-${Date.now()}`,
      type: 'collection',
      status: 'completed',
      amount: req.amount,
      currency: req.currency,
      fee,
      netAmount: req.amount - fee,
      provider: selectedProvider,
      providerReference: `prov_tx_${Math.random().toString(36).substring(2, 9)}`,
      customer: {
        id: req.customer.id,
        name: req.customer.name,
        phone: req.customer.phone,
        email: req.customer.email
      },
      corridor: {
        sourceCountry: 'KE',
        destinationCountry: 'KE',
        sourceCurrency: req.currency,
        destinationCurrency: req.currency
      },
      instructions,
      receipt: {
        receiptNumber: `RCP-${Math.floor(Math.random() * 899999 + 100000)}`,
        timestamp,
        rail: selectedProvider.toUpperCase()
      },
      createdAt: timestamp,
      settledAt: timestamp
    };

    // Record in Double-Entry Ledger
    ledgerService.recordTransactionEntries(transaction);

    // Screen with AML
    fraudAmlService.screenTransaction(req.amount, req.customer.name);

    // Save in transactions list & idempotency
    this.transactions.unshift(transaction);
    if (idempotencyKey) {
      this.idempotencyStore.set(idempotencyKey, transaction);
    }

    // Trigger webhook
    this.dispatchWebhook('payment.completed', transaction);

    return { transaction, isIdempotentReplay: false };
  }

  /**
   * Module 1: POST /v1/payments/disburse
   */
  public async disburse(req: DisbursementRequest, idempotencyKey?: string): Promise<{
    transaction: Transaction;
    isIdempotentReplay: boolean;
  }> {
    if (idempotencyKey && this.idempotencyStore.has(idempotencyKey)) {
      return {
        transaction: this.idempotencyStore.get(idempotencyKey),
        isIdempotentReplay: true
      };
    }

    this.rateLimitCounter++;
    const fee = req.amount * 0.01;
    const txnId = `disb_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const transaction: Transaction = {
      id: txnId,
      reference: req.reference || `DISB-${Date.now()}`,
      type: 'disbursement',
      status: 'completed',
      amount: req.amount,
      currency: req.currency,
      fee,
      netAmount: req.amount - fee,
      provider: req.recipient.provider,
      providerReference: `out_tx_${Math.random().toString(36).substring(2, 9)}`,
      recipient: {
        name: req.recipient.name,
        identifier: req.recipient.phone || req.recipient.accountNumber || req.recipient.walletAddress || 'Account',
        country: req.recipient.country
      },
      corridor: {
        sourceCountry: 'GLOBAL',
        destinationCountry: req.recipient.country,
        sourceCurrency: req.currency,
        destinationCurrency: req.currency
      },
      receipt: {
        receiptNumber: `DISB-RCP-${Math.floor(Math.random() * 899999 + 100000)}`,
        timestamp,
        rail: req.recipient.provider.toUpperCase()
      },
      createdAt: timestamp,
      settledAt: timestamp
    };

    ledgerService.recordTransactionEntries(transaction);
    fraudAmlService.screenTransaction(req.amount, req.recipient.name);

    this.transactions.unshift(transaction);
    if (idempotencyKey) {
      this.idempotencyStore.set(idempotencyKey, transaction);
    }

    this.dispatchWebhook('disbursement.settled', transaction);
    return { transaction, isIdempotentReplay: false };
  }

  /**
   * Full AI Natural Language Processing Pipeline:
   * Prompt -> Call 1 Extract Intent -> Call 2 Verify Intent -> Deterministic Safety Gate -> AI Route -> Execution -> Ledger
   */
  public async processAiPrompt(prompt: string): Promise<{
    audit: AiDecisionAudit;
    transaction?: Transaction;
    error?: string;
  }> {
    const startTime = performance.now();
    const txnId = `ai_tx_${Date.now()}`;

    // Step 1: AI Intent Extraction
    const extracted = AiIntentEngine.extractIntent(prompt);

    // Step 2: AI Intent Verification (Two-call architecture)
    const verification = AiIntentEngine.verifyIntent(prompt, extracted);

    if (!verification.verified && verification.recommendation === 'ask_user_for_clarification') {
      const audit: AiDecisionAudit = {
        transactionId: txnId,
        userInputPrompt: prompt,
        extractedIntent: extracted,
        verificationResult: verification,
        policyValidation: {
          decision: 'REJECT',
          ruleEvaluations: [],
          primaryReason: verification.discrepancies.join('; ')
        },
        routingRecommendation: {
          recommendedRail: 'stablecoin_solana',
          recommendedRailName: 'None',
          reasoning: 'Intent verification failed. Clarification requested.',
          candidateRails: [],
          savingsEstimateVsDirect: 'N/A'
        },
        finalRailExecuted: 'stablecoin_solana',
        timestamp: new Date().toISOString(),
        durationMs: Math.round(performance.now() - startTime)
      };

      return {
        audit,
        error: `Could not verify intent: ${verification.discrepancies.join(', ')}`
      };
    }

    // Step 3: Deterministic Policy Engine (Safety Gate)
    const policyResult = DeterministicPolicyEngine.evaluate({
      intent: extracted,
      senderKycTier: extracted.sender_kyc_tier || 'tier_2',
      amount: extracted.amount || 0,
      currency: extracted.currency || 'USD',
      sourceCountry: 'KE',
      destinationCountry: extracted.recipient_country === 'Ghana' ? 'GH' : (extracted.recipient_country === 'Nigeria' ? 'NG' : 'KE'),
      recipientName: extracted.recipient_identifier || 'Recipient'
    });

    if (policyResult.decision === 'REJECT') {
      const audit: AiDecisionAudit = {
        transactionId: txnId,
        userInputPrompt: prompt,
        extractedIntent: extracted,
        verificationResult: verification,
        policyValidation: policyResult,
        routingRecommendation: {
          recommendedRail: 'stablecoin_solana',
          recommendedRailName: 'Blocked',
          reasoning: 'Policy safety gate rejected transaction before route selection.',
          candidateRails: [],
          savingsEstimateVsDirect: '0%'
        },
        finalRailExecuted: 'stablecoin_solana',
        timestamp: new Date().toISOString(),
        durationMs: Math.round(performance.now() - startTime)
      };

      return {
        audit,
        error: `Policy Gate Blocked: ${policyResult.primaryReason}`
      };
    }

    // Step 4: AI Routing Recommender
    const routing = AiIntentEngine.recommendRoute(extracted);

    // Verify recommended rail isn't tripped
    let finalRail: ProviderId = routing.recommendedRail;
    const railHealth = circuitBreakers.getProvider(finalRail);
    if (railHealth && railHealth.circuitState === 'OPEN') {
      console.warn(`AI recommended rail ${finalRail} is OPEN. Falling back to alternative...`);
      finalRail = finalRail.startsWith('stablecoin') ? 'stablecoin_polygon' : 'pawapay';
    }

    // Step 5: Execute Transaction
    const amount = extracted.amount || 100;
    const currency = extracted.currency || 'USD';
    const fee = amount * 0.008; // 0.8%
    const timestamp = new Date().toISOString();

    const audit: AiDecisionAudit = {
      transactionId: txnId,
      userInputPrompt: prompt,
      extractedIntent: extracted,
      verificationResult: verification,
      policyValidation: policyResult,
      routingRecommendation: routing,
      finalRailExecuted: finalRail,
      timestamp,
      durationMs: Math.round(performance.now() - startTime)
    };

    const transaction: Transaction = {
      id: txnId,
      reference: `BIA-AI-${Date.now().toString().slice(-6)}`,
      type: extracted.intent === 'collection' ? 'collection' : 'disbursement',
      status: policyResult.decision === 'ESCALATE' ? 'pending' : 'completed',
      amount,
      currency,
      fee,
      netAmount: amount - fee,
      provider: finalRail,
      providerReference: `ai_rail_${Math.random().toString(36).substring(2, 9)}`,
      recipient: {
        name: extracted.recipient_identifier || 'Recipient',
        identifier: extracted.recipient_identifier || 'Mobile Money Wallet',
        country: extracted.recipient_country || 'Africa'
      },
      corridor: {
        sourceCountry: 'US',
        destinationCountry: extracted.recipient_country === 'Ghana' ? 'GH' : 'KE',
        sourceCurrency: currency,
        destinationCurrency: currency
      },
      receipt: {
        receiptNumber: `AI-RCP-${Math.floor(Math.random() * 899999 + 100000)}`,
        timestamp,
        rail: finalRail.toUpperCase()
      },
      aiAudit: audit,
      createdAt: timestamp,
      settledAt: policyResult.decision === 'ESCALATE' ? undefined : timestamp
    };

    // Record in ledger
    ledgerService.recordTransactionEntries(transaction);

    // Record fraud screening
    fraudAmlService.screenTransaction(amount, extracted.recipient_identifier || 'AI User');

    this.transactions.unshift(transaction);
    this.dispatchWebhook('disbursement.settled', transaction);

    return { audit, transaction };
  }

  /**
   * Refund a collection
   */
  public async refund(id: string): Promise<Transaction | undefined> {
    const txn = this.getTransactionById(id);
    if (!txn || txn.status !== 'completed') return undefined;

    txn.status = 'refunded';
    this.dispatchWebhook('payment.refunded', txn);
    return txn;
  }

  /**
   * Add a new webhook endpoint
   */
  public registerWebhook(url: string, events: string[]): WebhookEndpoint {
    const wh: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      url,
      events,
      secretKey: `whsec_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      status: 'active',
      totalDeliveries: 0
    };
    this.webhooks.unshift(wh);
    return wh;
  }

  /**
   * Dispatch Webhook
   */
  public dispatchWebhook(eventType: string, payload: any): void {
    const active = this.webhooks.filter(w => w.status === 'active' && (w.events.includes(eventType) || w.events.includes('*')));
    const timestamp = new Date().toISOString();

    active.forEach(w => {
      w.totalDeliveries++;
      w.lastDeliveryStatus = '200 OK';

      const log: WebhookDeliveryLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        webhookId: w.id,
        eventId: `evt_${Date.now()}`,
        eventType,
        responseCode: 200,
        responseDurationMs: Math.floor(Math.random() * 90 + 50),
        payload: {
          event: eventType,
          id: payload.id || `evt_${Date.now()}`,
          createdAt: timestamp,
          data: payload
        },
        sentAt: timestamp,
        signature: `t=${Date.now()},v1=sha256_${Math.random().toString(36).substring(2, 12)}`
      };

      this.deliveryLogs.unshift(log);
    });
  }
}

export const biaGateway = new BiaGateway();
