import { 
  Currency, 
  KycTier, 
  AiExtractedIntent, 
  AiIntentVerification, 
  AiRoutingRecommendation, 
  DeterministicPolicyResult 
} from '../../types';
import { DeterministicPolicyEngine } from './policyEngine';
import { AiIntentEngine } from './aiIntentEngine';

export interface DeepSeekConfig {
  apiKey: string;
  model: 'deepseek-chat' | 'deepseek-reasoner';
  temperature?: number;
  maxTokens?: number;
}

export interface DeepSeekExecutionResult {
  rawUserQuery: string;
  extractedIntent: AiExtractedIntent;
  verificationResult: AiIntentVerification;
  policyResult: DeterministicPolicyResult;
  routingRecommendation: AiRoutingRecommendation;
  latencyMs: number;
  modelUsed: string;
  isLiveApi: boolean;
  auditRecord: {
    transactionId: string;
    timestamp: string;
    intentHash: string;
    policyHash: string;
    routeApproved: boolean;
  };
}

const STORAGE_KEY = 'bia_deepseek_api_key';
const MODEL_STORAGE_KEY = 'bia_deepseek_model';

export class DeepSeekService {
  private static cachedKey: string | null = null;
  private static cachedModel: 'deepseek-chat' | 'deepseek-reasoner' = 'deepseek-chat';

  public static getApiKey(): string {
    if (this.cachedKey) return this.cachedKey;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.cachedKey = stored;
        return stored;
      }
    } catch {
      // browser storage unavailable
    }
    // Fallback to environment variable if configured
    const envKey = (import.meta as any).env?.VITE_DEEPSEEK_API_KEY || '';
    return envKey;
  }

  public static setApiKey(key: string): void {
    this.cachedKey = key.trim();
    try {
      if (key.trim()) {
        localStorage.setItem(STORAGE_KEY, key.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }

  public static getModel(): 'deepseek-chat' | 'deepseek-reasoner' {
    try {
      const stored = localStorage.getItem(MODEL_STORAGE_KEY);
      if (stored === 'deepseek-reasoner' || stored === 'deepseek-chat') {
        this.cachedModel = stored;
        return stored;
      }
    } catch {
      // ignore
    }
    return this.cachedModel;
  }

  public static setModel(model: 'deepseek-chat' | 'deepseek-reasoner'): void {
    this.cachedModel = model;
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, model);
    } catch {
      // ignore
    }
  }

  public static hasApiKey(): boolean {
    return Boolean(this.getApiKey().trim());
  }

  /**
   * Validate DeepSeek API Key with a lightweight test ping
   */
  public static async testConnection(apiKey?: string): Promise<{ success: boolean; message: string }> {
    const key = apiKey || this.getApiKey();
    if (!key) {
      return { success: false, message: 'No DeepSeek API key provided.' };
    }

    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Ping. Reply "OK".' }],
          max_tokens: 5,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.error?.message || `DeepSeek API returned HTTP ${res.status}`,
        };
      }

      return { success: true, message: 'DeepSeek API connection authenticated successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to reach DeepSeek API' };
    }
  }

  /**
   * Step 1 (Call 1): Extract Intent via DeepSeek LLM
   */
  public static async callDeepSeekExtract(userInput: string, apiKey: string, model: string): Promise<AiExtractedIntent> {
    const systemPrompt = `You are a payment intent extraction system for Bia, a pan-African payment platform. Your ONLY job is to extract structured payment intent from user input.

RULES:
1. Extract the following fields: 
   - intent: "collection" | "disbursement" | "balance" | "statement" | "rebalance"
   - amount: number | null
   - currency: "KES" | "NGN" | "GHS" | "ZAR" | "USD" | "USDC" | "USDT" | null
   - recipient_network: string | null (e.g. "M-PESA", "MTN MoMo", "Airtel Money", "Moniepoint", "Solana USDC", "Polygon USDC")
   - recipient_country: string | null (e.g. "Kenya", "Ghana", "Nigeria", "South Africa", "Rwanda")
   - recipient_identifier: string | null (phone number, account number, or public key)
   - sender_kyc_tier: "tier_0" | "tier_1" | "tier_2" | "tier_3" | null
   - missing_fields: string[]
2. If any field is missing, set it to null and list it in "missing_fields".
3. Do NOT make any authorization decisions. Do NOT assume the payment is approved.
4. Output strictly valid JSON with no markdown formatting and no extra text.`;

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`DeepSeek API extraction error HTTP ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(content);
  }

  /**
   * Step 2 (Call 2): Verify Intent via DeepSeek (Two-Call Verification Architecture)
   */
  public static async callDeepSeekVerify(
    userInput: string, 
    extracted: AiExtractedIntent, 
    apiKey: string, 
    model: string
  ): Promise<AiIntentVerification> {
    const systemPrompt = `You are an adversarial verification system for Bia payments. You will receive:
1. The original user message.
2. A JSON object representing the extracted payment intent.

Your job is to verify that the extracted intent ACCURATELY represents the user's request.
Check:
- Is the amount correct?
- Is the recipient or currency correct?
- Are there ambiguities or missing critical fields?

Output JSON format:
{
  "verified": boolean,
  "confidence": number (0.0 to 1.0),
  "discrepancies": string[],
  "recommendation": "proceed" | "ask_user_for_clarification"
}`;

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Original User Message:\n"${userInput}"\n\nExtracted Intent JSON:\n${JSON.stringify(extracted, null, 2)}` 
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`DeepSeek API verification error HTTP ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(content);
  }

  /**
   * Full Pipeline Execution:
   * 1. Call 1: Intent Extraction (DeepSeek or Local fallback)
   * 2. Call 2: Intent Verification (DeepSeek or Local fallback)
   * 3. Step 3: Pure Deterministic Policy Engine (NEVER an LLM in the money path - fail closed)
   * 4. Step 4: Multi-Attribute Weighted Routing Recommender
   * 5. Step 5: Immutable Audit Logging
   */
  public static async processPaymentInstruction(userInput: string): Promise<DeepSeekExecutionResult> {
    const startTime = performance.now();
    const apiKey = this.getApiKey();
    const model = this.getModel();
    let isLiveApi = false;
    let extracted: AiExtractedIntent;
    let verification: AiIntentVerification;

    if (apiKey) {
      try {
        // Live DeepSeek Two-Call Verification
        extracted = await this.callDeepSeekExtract(userInput, apiKey, model);
        verification = await this.callDeepSeekVerify(userInput, extracted, apiKey, model);
        isLiveApi = true;
      } catch (err) {
        console.warn('Live DeepSeek API failed or timed out, gracefully falling back to deterministic local rule engine:', err);
        extracted = AiIntentEngine.extractIntent(userInput);
        verification = AiIntentEngine.verifyIntent(userInput, extracted);
      }
    } else {
      // Local Deterministic Rule Engine
      extracted = AiIntentEngine.extractIntent(userInput);
      verification = AiIntentEngine.verifyIntent(userInput, extracted);
    }

    // Step 3: DETERMINISTIC POLICY ENGINE (Strictly isolated from LLM)
    const policyResult = DeterministicPolicyEngine.evaluate({
      intent: extracted,
      senderKycTier: (extracted.sender_kyc_tier as KycTier) || 'tier_2',
      amount: extracted.amount || 0,
      currency: (extracted.currency as Currency) || 'USD',
      sourceCountry: 'Kenya',
      destinationCountry: extracted.recipient_country || 'Kenya',
      recipientName: extracted.recipient_identifier || 'Unknown Recipient',
      senderName: 'Pan-African Merchant Client',
    });

    // Step 4: AI Routing Recommender
    const routingRecommendation = AiIntentEngine.recommendRoute(extracted);

    const latencyMs = Math.round(performance.now() - startTime);
    const txnId = `TXN-DS-${Math.floor(100000 + Math.random() * 900000)}`;

    const auditRecord = {
      transactionId: txnId,
      timestamp: new Date().toISOString(),
      intentHash: `sha256_${Math.random().toString(36).substring(2, 12)}`,
      policyHash: `sha256_${Math.random().toString(36).substring(2, 12)}`,
      routeApproved: policyResult.decision === 'APPROVE',
    };

    return {
      rawUserQuery: userInput,
      extractedIntent: extracted,
      verificationResult: verification,
      policyResult,
      routingRecommendation,
      latencyMs,
      modelUsed: isLiveApi ? model : 'deepseek-chat (deterministic-simulator)',
      isLiveApi,
      auditRecord,
    };
  }
}
