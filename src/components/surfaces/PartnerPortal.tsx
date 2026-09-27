import React, { useState } from 'react';
import { Badge, MetricCard, Tabs, Modal, useToast, CopyBtn, CustomSelect } from '../common/UI';

interface KYBRecord {
  id: string;
  name: string;
  type: string;
  ubo: string;
  tier: number;
  limit: string;
  jurisdiction: string;
  status: 'VERIFIED' | 'PENDING_DOCS' | 'IN_REVIEW';
  since: string;
  regNumber: string;
  directors: string[];
}

const initialKyb: KYBRecord[] = [
  {
    id: 'KYB-001',
    name: 'Jumia Kenya Ltd.',
    type: 'E-commerce Merchant',
    ubo: 'N. Wanjiku (35%), T. Mwangi (31%)',
    tier: 3,
    limit: '$100,000 / day',
    jurisdiction: 'Kenya (CBK)',
    status: 'VERIFIED',
    since: 'Jan 2023',
    regNumber: 'CPR/2012/89401',
    directors: ['Njeri Wanjiku', 'Timothy Mwangi', 'Sarah Al-Amin'],
  },
  {
    id: 'KYB-002',
    name: 'Wave Mobile Money GH',
    type: 'Mobile Money Operator',
    ubo: 'A. Diallo (45%), B. Kouakou (32%)',
    tier: 3,
    limit: '$250,000 / day',
    jurisdiction: 'Ghana (BoG)',
    status: 'VERIFIED',
    since: 'Mar 2023',
    regNumber: 'CS771092019',
    directors: ['Amadou Diallo', 'Bernadette Kouakou'],
  },
  {
    id: 'KYB-003',
    name: 'NovaPay Global Ltd.',
    type: 'PSP Partner Rail',
    ubo: 'K. Osei (60%), M. Balogun (40%)',
    tier: 2,
    limit: '$50,000 / day',
    jurisdiction: 'Nigeria (CBN)',
    status: 'PENDING_DOCS',
    since: 'Pending',
    regNumber: 'RC-1849204',
    directors: ['Kofi Osei', 'Mayowa Balogun'],
  },
  {
    id: 'KYB-004',
    name: 'AZA Finance Corp.',
    type: 'Institutional Treasury Partner',
    ubo: 'E. Osei-Bonsu (51%), Institutional Funds (49%)',
    tier: 3,
    limit: '$500,000 / day',
    jurisdiction: 'Pan-African / UK FCA',
    status: 'VERIFIED',
    since: 'Sep 2022',
    regNumber: 'FC034912',
    directors: ['Elizabeth Rossiello', 'Emmanuel Osei-Bonsu'],
  },
  {
    id: 'KYB-005',
    name: 'Kasha Global Health',
    type: 'Healthcare Enterprise',
    ubo: 'J. Gallant (42%), Health Venture Partners (38%)',
    tier: 3,
    limit: '$100,000 / day',
    jurisdiction: 'Rwanda (NBR)',
    status: 'VERIFIED',
    since: 'Nov 2023',
    regNumber: '107491029',
    directors: ['Joanna Gallant', 'Eric Karasira'],
  },
];

const settlements = [
  { period: '2024-01-14', corridor: '🇰🇪 Kenya ↔ 🇳🇬 Nigeria', gross: '$842,100', feeShare: '$336,840', netSettled: '$505,260', rail: 'PAPSS + USDC', status: 'CLEARED', hash: '0x8f2a...39b1' },
  { period: '2024-01-13', corridor: '🇬🇭 Ghana ↔ 🇿🇦 South Africa', gross: '$519,400', feeShare: '$207,760', netSettled: '$311,640', rail: 'USDC + Ozow EFT', status: 'CLEARED', hash: '0x3c7e...d042' },
  { period: '2024-01-12', corridor: '🇳🇬 Nigeria ↔ 🔵 USDC Multichain', gross: '$1,200,000', feeShare: '$480,000', netSettled: '$720,000', rail: 'Circle CCTP Multi', status: 'CLEARED', hash: '0x1b4f...a982' },
  { period: '2024-01-11', corridor: '🌍 Pan-African Batch', gross: '$2,841,500', feeShare: '$1,136,600', netSettled: '$1,704,900', rail: 'PAPSS + USDC Dual', status: 'CLEARED', hash: '0x5e9d...771c' },
  { period: 'Pending (Today)', corridor: '🌍 Pan-African Batch', gross: '$1,124,200', feeShare: '$449,680', netSettled: '$674,520', rail: 'In Progress (Sweep at 23:59)', status: 'IN_CLEARING', hash: 'pending_batch' },
];

const passports = [
  {
    title: 'PAPSS Integration',
    authority: 'Pan-African Payment & Settlement System (AU / Afreximbank)',
    jurisdictions: '12 AU Member Central Banks',
    licenseType: 'Direct Settlement Participant (DSP)',
    status: 'ACTIVE',
    effectiveDate: 'Jan 2023',
    renewalDate: 'Dec 2026',
    description: 'Enables bilateral local currency instant settlement without third-party correspondent bank routing. Real-time net settlement with FX pricing fixed at execution.',
    metrics: { uptime: '99.98%', avgSettlementSec: '1.4s', monthlyVol: '$14.2M' },
    complianceBadges: ['AfCFTA Compliant', 'AML 4AMLD Audited', 'ISO 20022 Direct'],
  },
  {
    title: 'CBK-NBR Bilateral Payment Corridor',
    authority: 'Central Bank of Kenya & National Bank of Rwanda',
    jurisdictions: 'Kenya (KE) & Rwanda (RW)',
    licenseType: 'Cross-Border Mobile Money Interoperability MOU',
    status: 'ACTIVE',
    effectiveDate: 'Mar 2023',
    renewalDate: 'Mar 2025',
    description: 'Allows Kenyan M-PESA and Rwandan MTN MoMo wallets to settle bidirectionally in under 2 seconds. Central bank liquidity backstop guarantees instant settlement finality.',
    metrics: { uptime: '99.94%', avgSettlementSec: '1.8s', monthlyVol: '$8.6M' },
    complianceBadges: ['EAC Protocol', 'Tier-3 KYB Enforced', 'Instant Finality'],
  },
  {
    title: 'CBN Regulatory Sandbox Approval',
    authority: 'Central Bank of Nigeria (Payments System Policy Dept.)',
    jurisdictions: 'Nigeria (NG)',
    licenseType: 'Sandbox Cohort 3 Participant · Cross-Border Inbound Rails',
    status: 'ACTIVE_SANDBOX',
    effectiveDate: 'Aug 2023',
    renewalDate: 'Nov 2024',
    description: 'Permitted inbound foreign exchange settlement directly to NIBSS/NIP bank accounts and mobile money operators with automated NAFEX/official rate conversion.',
    metrics: { uptime: '99.85%', avgSettlementSec: '2.1s', monthlyVol: '$21.4M' },
    complianceBadges: ['CBN Circular Compliant', 'NAFEX Benchmark', 'BVN/NIN Verified'],
  },
  {
    title: 'Bank of Ghana Payment Systems Clearance',
    authority: 'Bank of Ghana (Fintech and Innovation Directorate)',
    jurisdictions: 'Ghana (GH)',
    licenseType: 'Dedicated Electronic Money Issuer (DEMI) Intermediary',
    status: 'ACTIVE',
    effectiveDate: 'May 2023',
    renewalDate: 'May 2025',
    description: 'Authorized connectivity to Ghana Interbank Payment and Settlement Systems (GhIPSS) and direct disbursement to MTN MoMo, Telecel, and AT Money wallets.',
    metrics: { uptime: '99.91%', avgSettlementSec: '1.6s', monthlyVol: '$6.3M' },
    complianceBadges: ['GhIPSS Connected', 'Ghana Card Verified', 'MoMo Inbound Approved'],
  },
];

export const PartnerPortal: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'kyb' | 'settlement' | 'passporting' | 'escrow'>('kyb');
  const [kybRecords, setKybRecords] = useState<KYBRecord[]>(initialKyb);
  const [selectedKyb, setSelectedKyb] = useState<KYBRecord | null>(null);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState('E-commerce Merchant');
  const [newOrgCountry, setNewOrgCountry] = useState('Kenya (CBK)');
  const [newOrgUbo, setNewOrgUbo] = useState('');

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      addToast({ type: 'error', message: 'Entity name is required.' });
      return;
    }
    const newRecord: KYBRecord = {
      id: `KYB-00${kybRecords.length + 1}`,
      name: newOrgName.trim(),
      type: newOrgType,
      jurisdiction: newOrgCountry,
      ubo: newOrgUbo.trim() || 'Pending declaration',
      tier: 2,
      limit: '$50,000 / day',
      status: 'IN_REVIEW',
      since: 'Just now',
      regNumber: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      directors: ['Primary Officer Listed'],
    };
    setKybRecords([newRecord, ...kybRecords]);
    setOnboardModalOpen(false);
    setNewOrgName('');
    setNewOrgUbo('');
    addToast({ type: 'success', message: `KYB application submitted for ${newRecord.name}. Compliance review initiated.` });
  };

  return (
    <div className="page-shell">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-pretitle">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary-600)', fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              B2B Institutional Infrastructure
            </span>
          </div>
          <h1 className="page-title">Institutional Partner Portal</h1>
          <p className="page-subtitle">
            Corporate KYB onboarding, regulatory passporting under PAPSS & EAC Central Bank MOUs, and multilateral net clearing statements.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => addToast({ type: 'info', message: 'Generating cryptographic clearing audit report...' })}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Clearing Audit
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setOnboardModalOpen(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Onboard Partner Entity
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <MetricCard
          label="Passporting Corridors"
          value="5 Jurisdictions"
          delta="100% active compliance"
          deltaType="positive"
          sparkData={[5, 5, 5, 5, 5, 5]}
        />
        <MetricCard
          label="PAPSS & CBK Status"
          value="Direct Participant"
          delta="Zero settlement disputes"
          deltaType="positive"
          sparkColor="#00A67E"
          sparkData={[99, 99.5, 99.8, 100, 100, 100]}
        />
        <MetricCard
          label="Net Settled (MTD)"
          value="$5,403,000"
          delta="+18.4% vs last cycle"
          deltaType="positive"
          sparkColor="#635BFF"
          sparkData={[3.2, 3.8, 4.1, 4.7, 5.1, 5.4]}
        />
        <MetricCard
          label="Next Multilateral Sweep"
          value="23:59 UTC"
          delta="Automated Circle USDC clearing"
          deltaType="neutral"
          sparkData={[1, 1, 1, 1, 1, 1]}
        />
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <Tabs
          active={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
          tabs={[
            { id: 'kyb', label: 'Corporate KYB Onboarding', count: kybRecords.length },
            { id: 'settlement', label: 'Multilateral Net Settlements', count: settlements.length },
            { id: 'passporting', label: 'Regulatory Framework & Passports', count: passports.length },
            { id: 'escrow', label: 'Collateral & Escrow Reserves' },
          ]}
        />
      </div>

      {/* Tab: KYB Onboarding */}
      {activeTab === 'kyb' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title">Corporate Due Diligence Directory</div>
              <div className="card-subtitle">Verified institutional entities, ultimate beneficial owners (UBO), and operating limits</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge variant="success" dot>Live Regulated Entities</Badge>
            </div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Entity & Registration</th>
                  <th>Entity Type</th>
                  <th>UBO Beneficial Ownership</th>
                  <th>Tier & Limit</th>
                  <th>Supervisory Authority</th>
                  <th>KYB Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {kybRecords.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {item.regNumber} · Est. {item.since}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{item.type}</span>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.ubo}
                      </span>
                    </td>
                    <td>
                      <Badge variant="accent">Tier {item.tier}</Badge>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{item.limit}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{item.jurisdiction}</span>
                    </td>
                    <td>
                      <Badge
                        variant={item.status === 'VERIFIED' ? 'success' : item.status === 'PENDING_DOCS' ? 'warning' : 'info'}
                        dot
                      >
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => setSelectedKyb(item)}
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Net Settlements */}
      {activeTab === 'settlement' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title">Daily Clearing & Settlement Manifests</div>
              <div className="card-subtitle">Gross volume settled, 40% protocol fee rebate, and cryptographic settlement proofs</div>
            </div>
            <button
              className="btn btn-secondary btn-xs"
              onClick={() => addToast({ type: 'success', message: 'Downloaded consolidated multi-corridor statement (.csv).' })}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download All Statements
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Cycle Date</th>
                  <th>Corridor</th>
                  <th>Gross Flow</th>
                  <th>Protocol Fee (40%)</th>
                  <th>Net Disbursed</th>
                  <th>Settlement Rail</th>
                  <th>Status</th>
                  <th>Audit Proof</th>
                  <th style={{ textAlign: 'right' }}>Statement</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {s.period}
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{s.corridor}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.gross}</td>
                    <td style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>{s.feeShare}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-success-text)' }}>{s.netSettled}</td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.rail}</span>
                    </td>
                    <td>
                      <Badge variant={s.status === 'CLEARED' ? 'success' : 'info'} dot>
                        {s.status === 'CLEARED' ? 'CLEARED' : 'CLEARING'}
                      </Badge>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {s.hash}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => addToast({ type: 'success', message: `Downloaded PDF receipt for ${s.period} (${s.corridor})` })}
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Regulatory Passporting */}
      {activeTab === 'passporting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid-2" style={{ gap: 20 }}>
            {passports.map((p, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="card-header" style={{ paddingBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div>
                      <div className="card-title" style={{ fontSize: '1.05rem' }}>{p.title}</div>
                      <div className="card-subtitle" style={{ marginTop: 4 }}>{p.authority}</div>
                    </div>
                    <Badge variant={p.status === 'ACTIVE' ? 'success' : 'warning'} dot>
                      {p.status === 'ACTIVE' ? 'Fully Passported' : 'Sandbox Participant'}
                    </Badge>
                  </div>
                </div>
                <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {p.description}
                  </p>
                  <div style={{ background: 'var(--bg-canvas)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Platform SLA</div>
                      <div style={{ fontWeight: 700, color: 'var(--color-success-text)', fontSize: '0.9rem' }}>{p.metrics.uptime}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Settlement Speed</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{p.metrics.avgSettlementSec}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Monthly Flow</div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary-600)', fontSize: '0.9rem' }}>{p.metrics.monthlyVol}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                    {p.complianceBadges.map((badge, bIdx) => (
                      <Badge key={bIdx} variant="neutral">{badge}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Escrow & Collateral Reserves */}
      {activeTab === 'escrow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid-3" style={{ gap: 20 }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Circle USDC Multi-Sig Vault</div>
                <div className="card-subtitle">On-chain institutional settlement float</div>
              </div>
              <div className="card-body">
                <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  $4,250,000.00
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-success-text)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  100% Backed by Cash & US Short-term Treasuries
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8125rem', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Vault Address</span>
                    <CopyBtn text="0x71C...49b2E" label="0x71C...49b2E" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Multi-sig Scheme</span>
                    <span style={{ fontWeight: 600 }}>3-of-5 Institutional Keys</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Daily Outflow Limit</span>
                    <span style={{ fontWeight: 600 }}>$10,000,000 / 24h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Central Bank Pre-Funded Accounts</div>
                <div className="card-subtitle">Commercial bank escrow accounts in local fiat</div>
              </div>
              <div className="card-body">
                <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  $2,890,400.00
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Spread across Stanbic KE, Access Bank NG, and Ecobank GH
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8125rem', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Kenya (KES)</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>KES 142,500,000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Nigeria (NGN)</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>₦ 1,820,000,000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Ghana (GHS)</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>GH₵ 12,400,000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Settlement Collateral Coverage</div>
                <div className="card-subtitle">Real-time systemic liquidity ratio</div>
              </div>
              <div className="card-body">
                <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-success-text)', marginBottom: 4 }}>
                  108.4%
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Target minimum: 100.0% · Regulated Basel-III compliant
                </div>
                <div style={{ height: 6, background: 'var(--bg-canvas)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
                  <div style={{ width: '100%', height: '100%', background: 'var(--color-success)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                  <span>Current Float: $7.14M</span>
                  <span>Required: $6.58M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspect KYB Dossier Modal */}
      {selectedKyb && (
        <Modal
          title={`KYB Dossier: ${selectedKyb.name}`}
          isOpen={!!selectedKyb}
          onClose={() => setSelectedKyb(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  addToast({ type: 'info', message: `Downloaded KYB dossier for ${selectedKyb.name}` });
                  setSelectedKyb(null);
                }}
              >
                Download Verified Dossier PDF
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedKyb(null)}
              >
                Close Dossier
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--bg-canvas)', padding: 16, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Registration Number</div>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{selectedKyb.regNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Regulatory Tier</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Tier {selectedKyb.tier} · {selectedKyb.limit}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Supervisory Jurisdiction</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedKyb.jurisdiction}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>KYB Verification Status</div>
                <div>
                  <Badge variant={selectedKyb.status === 'VERIFIED' ? 'success' : 'warning'} dot>
                    {selectedKyb.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Ultimate Beneficial Ownership (UBO) Breakdown
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '10px 12px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {selectedKyb.ubo}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Verified Executive Officers & Directors
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedKyb.directors.map((director, dIdx) => (
                  <Badge key={dIdx} variant="neutral">
                    👤 {director}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Onboard Entity Modal */}
      {onboardModalOpen && (
        <Modal
          title="Onboard New Corporate Partner"
          isOpen={onboardModalOpen}
          onClose={() => setOnboardModalOpen(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setOnboardModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleOnboardSubmit}
              >
                Submit for Compliance Review
              </button>
            </div>
          }
        >
          <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600 }}>
                Corporate Legal Entity Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Standard Logistics Africa Ltd."
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600 }}>
                  Institution Type
                </label>
                <CustomSelect
                  value={newOrgType}
                  onChange={setNewOrgType}
                  options={[
                    { value: 'E-commerce Merchant', label: 'E-commerce Merchant' },
                    { value: 'Mobile Money Operator', label: 'Mobile Money Operator' },
                    { value: 'PSP Partner Rail', label: 'PSP Partner Rail' },
                    { value: 'Institutional Treasury Partner', label: 'Institutional Treasury' },
                  ]}
                />
              </div>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600 }}>
                  Primary Central Bank Jurisdiction
                </label>
                <CustomSelect
                  value={newOrgCountry}
                  onChange={setNewOrgCountry}
                  options={[
                    { value: 'Kenya (CBK)', label: 'Kenya (CBK)' },
                    { value: 'Nigeria (CBN)', label: 'Nigeria (CBN)' },
                    { value: 'Ghana (BoG)', label: 'Ghana (BoG)' },
                    { value: 'South Africa (SARB)', label: 'South Africa (SARB)' },
                    { value: 'Rwanda (NBR)', label: 'Rwanda (NBR)' },
                    { value: 'Pan-African / PAPSS', label: 'Pan-African (PAPSS)' },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600 }}>
                Ultimate Beneficial Ownership (UBO) Percentage Declarations
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Jane Doe (55%), John Smith (45%)"
                value={newOrgUbo}
                onChange={(e) => setNewOrgUbo(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                Required under FATF Recommendation 24 & AU Anti-Money Laundering Framework
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
