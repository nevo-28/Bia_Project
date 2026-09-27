import { 
  LedgerAccount, 
  JournalEntry, 
  Transaction, 
  ReconciliationBreak, 
  BreakType,
  Currency
} from '../../types';
import { INITIAL_LEDGER_ACCOUNTS, INITIAL_BREAKS } from './seedData';

export class LedgerService {
  private accounts: Map<string, LedgerAccount> = new Map();
  private journalEntries: JournalEntry[] = [];
  private breaks: ReconciliationBreak[] = [...INITIAL_BREAKS];

  constructor() {
    INITIAL_LEDGER_ACCOUNTS.forEach(acc => {
      this.accounts.set(acc.id, { ...acc });
    });
  }

  public getAccounts(): LedgerAccount[] {
    return Array.from(this.accounts.values());
  }

  public getJournalEntries(): JournalEntry[] {
    return [...this.journalEntries];
  }

  public getBreaks(): ReconciliationBreak[] {
    return [...this.breaks];
  }

  /**
   * Double-Entry Journal Entry Recording
   * Guarantees: Sum(Debits) === Sum(Credits)
   */
  public recordTransactionEntries(txn: Transaction): JournalEntry[] {
    const createdEntries: JournalEntry[] = [];
    const timestamp = new Date().toISOString();
    const fee = txn.fee || (txn.amount * 0.015);
    const net = txn.amount - fee;
    const providerCost = fee * 0.55; // 55% provider cost

    if (txn.type === 'collection') {
      // 1. Debit Settlement Account (Asset increases)
      const debitSettlement: JournalEntry = {
        id: `je_${Date.now()}_1`,
        transactionId: txn.id,
        entryNumber: this.journalEntries.length + 1,
        accountId: 'acc_asset_settlement_kes',
        accountCode: '1010-KES',
        accountName: 'Settlement Account — Rail Asset',
        debitAmount: txn.amount,
        creditAmount: 0,
        currency: txn.currency,
        description: `Incoming collection funds for ${txn.reference}`,
        createdAt: timestamp
      };

      // 2. Credit Merchant Balance (Liability increases)
      const creditMerchant: JournalEntry = {
        id: `je_${Date.now()}_2`,
        transactionId: txn.id,
        entryNumber: this.journalEntries.length + 2,
        accountId: 'acc_liability_merchant_balances',
        accountCode: '2010-USD',
        accountName: 'Merchant Available Balance',
        debitAmount: 0,
        creditAmount: net,
        currency: txn.currency,
        description: `Net payout credit for ${txn.reference}`,
        createdAt: timestamp
      };

      // 3. Credit Fee Revenue (Revenue increases)
      const creditRevenue: JournalEntry = {
        id: `je_${Date.now()}_3`,
        transactionId: txn.id,
        entryNumber: this.journalEntries.length + 3,
        accountId: 'acc_revenue_gateway_fees',
        accountCode: '4010-USD',
        accountName: 'Platform Gateway Fee',
        debitAmount: 0,
        creditAmount: fee,
        currency: txn.currency,
        description: `Platform switching fee for ${txn.reference}`,
        createdAt: timestamp
      };

      createdEntries.push(debitSettlement, creditMerchant, creditRevenue);
    } else {
      // Disbursement:
      // Debit Merchant Balance (Liability decreases)
      const debitMerchant: JournalEntry = {
        id: `je_${Date.now()}_1`,
        transactionId: txn.id,
        entryNumber: this.journalEntries.length + 1,
        accountId: 'acc_liability_merchant_balances',
        accountCode: '2010-USD',
        accountName: 'Merchant Available Balance',
        debitAmount: txn.amount,
        creditAmount: 0,
        currency: txn.currency,
        description: `Disbursement debit for ${txn.reference}`,
        createdAt: timestamp
      };

      // Credit Settlement Account / Treasury Reserves (Asset decreases)
      const creditSettlement: JournalEntry = {
        id: `je_${Date.now()}_2`,
        transactionId: txn.id,
        entryNumber: this.journalEntries.length + 2,
        accountId: 'acc_asset_treasury_usdc',
        accountCode: '1050-USDC',
        accountName: 'Treasury Reserves — Stablecoin/Fiat Rail',
        debitAmount: 0,
        creditAmount: net,
        currency: txn.currency,
        description: `Settlement outflow for ${txn.reference}`,
        createdAt: timestamp
      };

      // Credit Fee Revenue
      const creditFee: JournalEntry = {
        id: `je_${Date.now()}_3`,
        transactionId: txn.id,
        entryNumber: this.journalEntries.length + 3,
        accountId: 'acc_revenue_gateway_fees',
        accountCode: '4010-USD',
        accountName: 'Platform Gateway Fee',
        debitAmount: 0,
        creditAmount: fee,
        currency: txn.currency,
        description: `Payout processing fee for ${txn.reference}`,
        createdAt: timestamp
      };

      createdEntries.push(debitMerchant, creditSettlement, creditFee);
    }

    // Verify debit = credit
    const totalDebit = createdEntries.reduce((acc, curr) => acc + curr.debitAmount, 0);
    const totalCredit = createdEntries.reduce((acc, curr) => acc + curr.creditAmount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      console.error(`Ledger double-entry imbalance! Debits: ${totalDebit}, Credits: ${totalCredit}`);
    }

    this.journalEntries.unshift(...createdEntries);
    return createdEntries;
  }

  /**
   * Trial Balance: Verifies the integrity of the entire ledger.
   */
  public getTrialBalance(): {
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
    accounts: { code: string; name: string; debit: number; credit: number }[];
  } {
    let totalDebits = 0;
    let totalCredits = 0;
    const accountRows = this.getAccounts().map(acc => {
      let debit = 0;
      let credit = 0;
      if (acc.normalBalance === 'debit') {
        debit = acc.balance;
        totalDebits += debit;
      } else {
        credit = acc.balance;
        totalCredits += credit;
      }
      return { code: acc.code, name: acc.name, debit, credit };
    });

    return {
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 1,
      accounts: accountRows
    };
  }

  /**
   * Resolve a reconciliation break
   */
  public resolveBreak(breakId: string, resolutionNote: string): ReconciliationBreak | undefined {
    const item = this.breaks.find(b => b.id === breakId);
    if (item) {
      item.status = 'resolved';
      item.resolutionNote = resolutionNote;
    }
    return item;
  }

  /**
   * Simulate a T+1 settlement file parse that detects an amount break or missing tx
   */
  public triggerDailyReconciliation(): { breaksFound: number; totalMatched: number } {
    const newBreak: ReconciliationBreak = {
      id: `brk_${Date.now()}`,
      type: 'timing_break',
      provider: 'pawapay',
      transactionReference: `PAWA-RECON-${Math.floor(Math.random() * 9000 + 1000)}`,
      ledgerAmount: 18500,
      providerAmount: 18500,
      currency: 'KES',
      difference: 0,
      status: 'unresolved',
      detectedAt: new Date().toISOString(),
      resolutionNote: 'Awaiting end-of-day bank statement match'
    };
    this.breaks.unshift(newBreak);
    return { breaksFound: 1, totalMatched: 1420 };
  }
}

export const ledgerService = new LedgerService();
