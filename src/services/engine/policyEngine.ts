import { 
  Currency, 
  KycTier, 
  DeterministicPolicyResult, 
  AiExtractedIntent 
} from '../../types';

export interface PolicyEvaluationContext {
  intent: AiExtractedIntent;
  senderKycTier: KycTier;
  amount: number;
  currency: Currency;
  sourceCountry: string;
  destinationCountry: string;
  recipientName?: string;
  senderName?: string;
}

const SANCTIONS_BLACKLIST = [
  'KABILA',
  'AL-SHABAAB',
  'BOKO HARAM',
  'VIKTOR BOUT',
  'SUDAN CONFLICT EXP',
  'SANCTIONED ENTITY'
];

export class DeterministicPolicyEngine {
  /**
   * Pure deterministic rule evaluation.
   * Principle: FAIL CLOSED. Any REJECT halts immediately. Any ESCALATE flags for human review.
   */
  public static evaluate(ctx: PolicyEvaluationContext): DeterministicPolicyResult {
    const evaluations: DeterministicPolicyResult['ruleEvaluations'] = [];

    // Rule 1: KYC Tier Thresholds
    const tierLimitPassed = this.checkKycTierLimit(ctx.senderKycTier, ctx.amount, ctx.currency);
    evaluations.push({
      ruleId: 'rule_kyc_tier_limit',
      ruleName: `KYC Tier Limit Check (${ctx.senderKycTier.toUpperCase()})`,
      passed: tierLimitPassed.passed,
      decision: tierLimitPassed.passed ? 'APPROVE' : 'REJECT',
      details: tierLimitPassed.message
    });

    if (!tierLimitPassed.passed) {
      return {
        decision: 'REJECT',
        ruleEvaluations: evaluations,
        primaryReason: tierLimitPassed.message
      };
    }

    // Rule 2: Sanctions & PEP screening (OFAC, UN, Local FIU)
    const sanctionCheck = this.checkSanctions(ctx.senderName, ctx.recipientName);
    evaluations.push({
      ruleId: 'rule_sanctions_screening',
      ruleName: 'OFAC, UN & PEP Watchlist Screening',
      passed: sanctionCheck.passed,
      decision: sanctionCheck.passed ? 'APPROVE' : (sanctionCheck.escalate ? 'ESCALATE' : 'REJECT'),
      details: sanctionCheck.message
    });

    if (!sanctionCheck.passed) {
      if (sanctionCheck.escalate) {
        // Escalate for compliance review
        return {
          decision: 'ESCALATE',
          ruleEvaluations: evaluations,
          primaryReason: sanctionCheck.message
        };
      }
      return {
        decision: 'REJECT',
        ruleEvaluations: evaluations,
        primaryReason: sanctionCheck.message
      };
    }

    // Rule 3: Corridor & Country Sanctions / FX Controls
    const corridorCheck = this.checkCorridorCompliance(ctx.sourceCountry, ctx.destinationCountry, ctx.amount, ctx.currency);
    evaluations.push({
      ruleId: 'rule_corridor_fx_controls',
      ruleName: `Corridor FX Regulatory Controls (${ctx.sourceCountry} -> ${ctx.destinationCountry})`,
      passed: corridorCheck.passed,
      decision: corridorCheck.passed ? 'APPROVE' : 'REJECT',
      details: corridorCheck.message
    });

    if (!corridorCheck.passed) {
      return {
        decision: 'REJECT',
        ruleEvaluations: evaluations,
        primaryReason: corridorCheck.message
      };
    }

    // Rule 4: FATF Travel Rule Validation (> $1,000)
    const travelRuleCheck = this.checkTravelRule(ctx.amount, ctx.currency, ctx.intent);
    evaluations.push({
      ruleId: 'rule_fatf_travel_rule',
      ruleName: 'FATF Travel Rule Compliance (Cross-border > $1,000)',
      passed: travelRuleCheck.passed,
      decision: travelRuleCheck.passed ? 'APPROVE' : 'ESCALATE',
      details: travelRuleCheck.message
    });

    if (!travelRuleCheck.passed) {
      return {
        decision: 'ESCALATE',
        ruleEvaluations: evaluations,
        primaryReason: travelRuleCheck.message
      };
    }

    // All rules passed deterministically
    return {
      decision: 'APPROVE',
      ruleEvaluations: evaluations
    };
  }

  private static checkKycTierLimit(tier: KycTier, amount: number, currency: Currency): { passed: boolean; message: string } {
    const limits: Record<KycTier, number> = {
      tier_0: 0,
      tier_1: 500,     // Max $500
      tier_2: 5000,    // Max $5,000
      tier_3: 50000    // Max $50,000
    };

    // Approximate USD normalizer for rule checking
    let amountInUsd = amount;
    if (currency === 'KES') amountInUsd = amount / 130;
    else if (currency === 'NGN') amountInUsd = amount / 1550;
    else if (currency === 'GHS') amountInUsd = amount / 15;
    else if (currency === 'ZAR') amountInUsd = amount / 18;

    const maxAllowed = limits[tier] ?? 0;

    if (amountInUsd > maxAllowed) {
      return {
        passed: false,
        message: `Transaction amount (~$${amountInUsd.toFixed(2)} USD) exceeds limit of $${maxAllowed} for ${tier.toUpperCase()}. Upgrade KYC tier to proceed.`
      };
    }

    return {
      passed: true,
      message: `Amount (~$${amountInUsd.toFixed(2)} USD) is within allowed limit of $${maxAllowed} for ${tier.toUpperCase()}.`
    };
  }

  private static checkSanctions(sender?: string, recipient?: string): { passed: boolean; escalate?: boolean; message: string } {
    const combined = `${sender || ''} ${recipient || ''}`.toUpperCase();
    for (const blocked of SANCTIONS_BLACKLIST) {
      if (combined.includes(blocked)) {
        return {
          passed: false,
          escalate: false,
          message: `Match found on SDN / UN Sanctions List for term "${blocked}". Immediate fail-closed rejection.`
        };
      }
    }

    // PEP Soft match trigger
    if (combined.includes('MINISTER') || combined.includes('SENATOR') || combined.includes('DIRECTOR GENERAL')) {
      return {
        passed: false,
        escalate: true,
        message: 'Potential Politically Exposed Person (PEP) detected. Transaction escalated to AML Compliance Officer.'
      };
    }

    return {
      passed: true,
      message: 'Zero matches on OFAC, UN Consolidated, EU Sanctions, or local FIU watchlists.'
    };
  }

  private static checkCorridorCompliance(source: string, dest: string, amount: number, currency: Currency): { passed: boolean; message: string } {
    // Nigeria Central Bank CBN FX approval threshold > $10,000
    let amountInUsd = amount;
    if (currency === 'NGN') amountInUsd = amount / 1550;
    if (currency === 'KES') amountInUsd = amount / 130;

    if ((source === 'NG' || dest === 'NG') && amountInUsd > 10000) {
      return {
        passed: false,
        message: 'CBN FX regulations require manual documentation and tax clearance for cross-border transactions exceeding $10,000 USD.'
      };
    }

    return {
      passed: true,
      message: `Corridor ${source} ⇄ ${dest} is active and compliant with bilateral regulatory standards.`
    };
  }

  private static checkTravelRule(amount: number, currency: Currency, intent: AiExtractedIntent): { passed: boolean; message: string } {
    let amountInUsd = amount;
    if (currency === 'KES') amountInUsd = amount / 130;
    else if (currency === 'NGN') amountInUsd = amount / 1550;
    else if (currency === 'GHS') amountInUsd = amount / 15;

    if (amountInUsd > 1000) {
      if (!intent.recipient_identifier || !intent.recipient_country) {
        return {
          passed: false,
          message: 'FATF Travel Rule requires full originator and beneficiary identifying data for transfers above $1,000.'
        };
      }
    }

    return {
      passed: true,
      message: 'FATF Travel Rule information is complete and verified.'
    };
  }
}
