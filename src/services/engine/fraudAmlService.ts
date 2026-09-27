import { FraudCase } from '../../types';
import { INITIAL_FRAUD_CASES } from './seedData';

export class FraudAmlService {
  private cases: FraudCase[] = [...INITIAL_FRAUD_CASES];

  public getCases(): FraudCase[] {
    return [...this.cases];
  }

  public updateCaseStatus(caseId: string, status: FraudCase['status'], assignedTo?: string): FraudCase | undefined {
    const item = this.cases.find(c => c.id === caseId);
    if (item) {
      item.status = status;
      if (assignedTo) item.assignedTo = assignedTo;
      if (status === 'SAR_FILED' && !item.sarReference) {
        item.sarReference = `SAR-FIU-${Date.now().toString().slice(-6)}`;
      }
      item.updatedAt = new Date().toISOString();
    }
    return item;
  }

  /**
   * Real-time AML Screening
   */
  public screenTransaction(amount: number, customerName: string, recipientName?: string): {
    flagged: boolean;
    riskScore: number;
    triggers: string[];
    caseCreated?: FraudCase;
  } {
    const triggers: string[] = [];
    let riskScore = 12; // baseline

    if (amount > 10000) {
      triggers.push('High value cross-border threshold (> $10k)');
      riskScore += 35;
    }

    const checkStr = `${customerName} ${recipientName || ''}`.toUpperCase();
    if (checkStr.includes('VENTURES') || checkStr.includes('OFFSHORE') || checkStr.includes('HOLDINGS')) {
      triggers.push('Entity structuring risk check');
      riskScore += 18;
    }

    if (riskScore >= 65) {
      const newCase: FraudCase = {
        id: `case_aml_${Date.now()}`,
        transactionId: `txn_aml_${Math.floor(Math.random() * 90000)}`,
        customerName,
        amount,
        currency: 'USD',
        riskScore,
        triggers,
        status: 'FLAGGED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.cases.unshift(newCase);
      return { flagged: true, riskScore, triggers, caseCreated: newCase };
    }

    return { flagged: false, riskScore, triggers };
  }

  /**
   * Export SAR (Suspicious Activity Report) XML/JSON
   */
  public generateSarXml(caseItem: FraudCase): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<SuspiciousActivityReport xmlns="urn:fiu:aml:sar:2026">
  <Header>
    <ReportingInstitution>Bia Technologies Ltd</ReportingInstitution>
    <LicenseType>PSP / Cross-Border Interoperability</LicenseType>
    <ReportDate>${new Date().toISOString()}</ReportDate>
    <SARReference>${caseItem.sarReference || 'PENDING'}</SARReference>
  </Header>
  <Subject>
    <EntityName>${caseItem.customerName}</EntityName>
    <RiskScore>${caseItem.riskScore}/100</RiskScore>
    <Triggers>
      ${caseItem.triggers.map(t => `<Trigger>${t}</Trigger>`).join('\n      ')}
    </Triggers>
  </Subject>
  <TransactionDetails>
    <TransactionID>${caseItem.transactionId}</TransactionID>
    <Amount>${caseItem.amount}</Amount>
    <Currency>${caseItem.currency}</Currency>
    <InvestigationStatus>${caseItem.status}</InvestigationStatus>
  </TransactionDetails>
</SuspiciousActivityReport>`;
  }
}

export const fraudAmlService = new FraudAmlService();
