import React, { useState } from 'react';
import { Badge, Tabs, Modal, ProgressBar, useToast, TimelineItem } from '../common/UI';

const circuitBreakers = [
  { provider: 'M-PESA Daraja', category: 'Mobile Money', errorRate: 0.8, reqMin: 124, state: 'CLOSED', health: 99.2, lastTrip: 'Never', trips5m: 0 },
  { provider: 'MTN MoMo', category: 'Mobile Money', errorRate: 3.2, reqMin: 87, state: 'CLOSED', health: 96.8, lastTrip: '3 days ago', trips5m: 0 },
  { provider: 'Airtel Money', category: 'Mobile Money', errorRate: 8.2, reqMin: 23, state: 'HALF_OPEN', health: 91.8, lastTrip: '12 min ago', trips5m: 4 },
  { provider: 'PawaPay', category: 'Aggregator', errorRate: 1.5, reqMin: 68, state: 'CLOSED', health: 98.5, lastTrip: '2 weeks ago', trips5m: 0 },
  { provider: 'Paystack', category: 'Card + Bank', errorRate: 0.4, reqMin: 195, state: 'CLOSED', health: 99.6, lastTrip: 'Never', trips5m: 0 },
  { provider: 'Flutterwave', category: 'Card + Bank', errorRate: 12.8, reqMin: 0, state: 'OPEN', health: 87.2, lastTrip: '38 min ago', trips5m: 18 },
  { provider: 'NIBSS NIP', category: 'Bank Transfer', errorRate: 1.1, reqMin: 142, state: 'CLOSED', health: 98.9, lastTrip: '5 days ago', trips5m: 0 },
  { provider: 'Polygon USDC', category: 'Stablecoin', errorRate: 0.2, reqMin: 312, state: 'CLOSED', health: 99.8, lastTrip: 'Never', trips5m: 0 },
];

const journalEntries = [
  { id: 'JNL-0881-A', debit: 'Customer Wallet (KES)', credit: 'Settlement Account (KES)', amount: 'KES 150,000', fx: '—', rail: 'PAPSS', txn: 'PAY-881', balanced: true },
  { id: 'JNL-0881-B', debit: 'Platform Revenue', credit: 'Settlement Account (KES)', amount: 'KES 2,250', fx: '—', rail: 'PAPSS', txn: 'PAY-881', balanced: true },
  { id: 'JNL-0881-C', debit: 'Settlement Account (USD)', credit: 'USDC Polygon Vault', amount: 'USDC 1,155', fx: '0.0077', rail: 'Polygon', txn: 'PAY-881', balanced: true },
  { id: 'JNL-0880-A', debit: 'Customer Wallet (GHS)', credit: 'Settlement Account (GHS)', amount: 'GHS 8,400', fx: '—', rail: 'MTN MoMo', txn: 'PAY-880', balanced: true },
  { id: 'JNL-0879-A', debit: 'Customer Wallet (NGN)', credit: 'Settlement Account (NGN)', amount: '₦2,250,000', fx: '—', rail: 'NIP', txn: 'PAY-879', balanced: true },
  { id: 'JNL-0879-B', debit: 'Platform Revenue', credit: 'Settlement Account (NGN)', amount: '₦33,750', fx: '—', rail: 'NIP', txn: 'PAY-879', balanced: true },
];

const amlCases = [
  { id: 'AML-2024-441', txn: 'PAY-774', amount: 'KES 3,200,000', amountUsd: '$24,600', customer: 'Emmanuel Okonkwo', status: 'UNDER_REVIEW', priority: 'CRITICAL', risk: 89, flags: ['Large Amount', 'PEP Match', 'Velocity'], assigned: 'Amara Diallo', jurisdiction: 'NG', fiuName: 'NFIU', deadline: '6h 22m' },
  { id: 'AML-2024-438', txn: 'PAY-761', amount: 'GHS 88,000', amountUsd: '$7,040', customer: 'Grace Mensah', status: 'SAR_FILED', priority: 'HIGH', risk: 72, flags: ['Adverse Media', 'Sanctions List'], assigned: 'Kofi Asante', jurisdiction: 'GH', fiuName: 'FIC Ghana', deadline: 'Filed' },
  { id: 'AML-2024-435', txn: 'PAY-754', amount: 'KES 850,000', amountUsd: '$6,535', customer: 'Aisha Mwangi', status: 'ASSIGNED', priority: 'HIGH', risk: 61, flags: ['Velocity Anomaly', 'Geographic'], assigned: 'Amara Diallo', jurisdiction: 'KE', fiuName: 'FRC Kenya', deadline: '18h 14m' },
  { id: 'AML-2024-428', txn: 'PAY-741', amount: 'ZAR 45,000', amountUsd: '$2,430', customer: 'Sipho Dlamini', status: 'RESOLVED', priority: 'MEDIUM', risk: 35, flags: ['Unusual Hours'], assigned: 'Naledi Mokoena', jurisdiction: 'ZA', fiuName: 'FIC SA', deadline: 'Cleared' },
];

const treasury = [
  { network: 'Polygon', asset: 'USDC', balance: '$1,241,800', target: '$1,000,000', pct: 124, yield: '5.2% APY', color: '#8247E5' },
  { network: 'Ethereum', asset: 'USDC', balance: '$487,200', target: '$500,000', pct: 97, yield: '4.8% APY', color: '#627EEA' },
  { network: 'Solana', asset: 'USDC', balance: '$312,400', target: '$300,000', pct: 104, yield: '6.1% APY', color: '#9945FF' },
  { network: 'Aptos', asset: 'USDC', balance: '$101,500', target: '$150,000', pct: 68, yield: '4.5% APY', color: '#22D3A8' },
];

const corridorLiquidity = [
  { flag: '🇰🇪', corridor: 'Kenya (KES)', actual: 487200, target: 500000, min: 200000 },
  { flag: '🇳🇬', corridor: 'Nigeria (NGN)', actual: 923800, target: 1000000, min: 400000 },
  { flag: '🇬🇭', corridor: 'Ghana (GHS)', actual: 281400, target: 300000, min: 100000 },
  { flag: '🇿🇦', corridor: 'South Africa (ZAR)', actual: 412100, target: 500000, min: 200000 },
];

const reconcBreaks = [
  { id: 'BRK-041', txn: 'PAY-877', type: 'Amount Mismatch', delta: '+$0.23', age: '14 min', severity: 'low' },
  { id: 'BRK-040', txn: 'PAY-812', type: 'Missing Confirmation', delta: '—', age: '2 hr', severity: 'medium' },
];

const tabs = [
  { id: 'breakers', label: 'Circuit Breakers' },
  { id: 'ledger', label: 'Ledger Audit' },
  { id: 'reconciliation', label: 'Reconciliation' },
  { id: 'aml', label: 'AML & Compliance', count: 3 },
  { id: 'treasury', label: 'Stablecoin Treasury' },
];

export const AdminConsole: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('breakers');
  const [tripModal, setTripModal] = useState<string | null>(null);
  const [sarModal, setSarModal] = useState<typeof amlCases[0] | null>(null);
  const [resolveBreak, setResolveBreak] = useState<string | null>(null);

  const stateVariant = (s: string) => s === 'CLOSED' ? 'success' : s === 'HALF_OPEN' ? 'warning' : 'error';
  const priorityVariant = (p: string) => p === 'CRITICAL' ? 'error' : p === 'HIGH' ? 'warning' : p === 'MEDIUM' ? 'info' : 'neutral';
  const caseVariant = (s: string) => s === 'RESOLVED' ? 'success' : s === 'SAR_FILED' ? 'accent' : s === 'UNDER_REVIEW' ? 'warning' : 'neutral';

  return (
    <div className="bia-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin & Ops Console</h1>
          <p className="page-subtitle">Real-time system monitoring, compliance management, and treasury operations.</p>
        </div>
        <div className="page-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--green-light)', border: '1px solid var(--green-border)', borderRadius: 'var(--r-full)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--green)' }}>
            <span className="status-dot green pulse" />
            8/10 rails operational
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* CIRCUIT BREAKERS */}
      {activeTab === 'breakers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div className="alert alert-warning" style={{ marginBottom: 0 }}>
            <span className="alert-icon">⚠️</span>
            <div>
              <div className="alert-title">2 Providers Require Attention</div>
              <div className="alert-body">Flutterwave circuit breaker is OPEN (12.8% error rate). Airtel Money is in HALF-OPEN state (8.2%). Traffic is being automatically routed to backup rails.</div>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <div className="card-title">Provider Circuit Breakers</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="status-dot green pulse" />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>5-minute rolling window</span>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Provider</th><th>Category</th><th>Error Rate (5m)</th><th>Req/min</th><th>Circuit State</th><th>Health</th><th>Last Trip</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {circuitBreakers.map((cb, i) => (
                  <tr key={i} style={{ cursor: 'default' }}>
                    <td style={{ fontWeight: 600 }}>{cb.provider}</td>
                    <td><Badge variant="neutral">{cb.category}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60 }}><ProgressBar value={cb.errorRate} max={100} color={cb.errorRate < 5 ? 'green' : cb.errorRate < 10 ? 'amber' : 'red'} /></div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: cb.errorRate >= 10 ? 'var(--red)' : cb.errorRate >= 5 ? 'var(--amber)' : 'var(--green)', fontWeight: 700 }}>{cb.errorRate}%</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{cb.reqMin}</td>
                    <td><Badge variant={stateVariant(cb.state)} dot>{cb.state}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <ProgressBar value={cb.health} max={100} color={cb.health >= 95 ? 'green' : cb.health >= 85 ? 'amber' : 'red'} />
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{cb.health}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cb.lastTrip}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {cb.state !== 'OPEN' && <button className="btn btn-ghost btn-xs" style={{ color: 'var(--amber)' }} onClick={() => setTripModal(cb.provider)}>Trip</button>}
                        {cb.state !== 'CLOSED' && <button className="btn btn-ghost btn-xs" style={{ color: 'var(--green)' }} onClick={() => addToast({ type: 'success', message: `${cb.provider} circuit reset.` })}>Reset</button>}
                        <button className="btn btn-ghost btn-xs" onClick={() => addToast({ type: 'info', message: `Viewing API logs for ${cb.provider}…` })}>Logs</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ℹ️ Circuit breakers auto-trip when the 5-minute rolling error rate exceeds <strong>10%</strong> (PRD §7.5). In OPEN state, all traffic is routed to the next available rail per the AI Routing Recommender.
          </div>
        </div>
      )}

      {/* LEDGER AUDIT */}
      {activeTab === 'ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <div>
              <div className="alert-title">Trial Balance: Balanced</div>
              <div className="alert-body">All {journalEntries.length} journal entries are balanced. Total debits equal total credits. Last verified: 30 seconds ago.</div>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <div className="card-title">Double-Entry Journal</div>
              <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => addToast({ type: 'info', message: 'Journal exported as CSV.' })}>Export CSV</button>
                <button className="btn btn-secondary btn-sm" onClick={() => addToast({ type: 'info', message: 'Ledger PDF generated.' })}>Export PDF</button>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Entry ID</th><th>Transaction</th><th>Debit Account</th><th>Credit Account</th><th>Amount</th><th>FX Rate</th><th>Rail</th><th>Balanced</th></tr>
              </thead>
              <tbody>
                {journalEntries.map((j, i) => (
                  <tr key={i} style={{ cursor: 'default' }}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{j.id}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>{j.txn}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{j.debit}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{j.credit}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{j.amount}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{j.fx}</td>
                    <td><Badge variant="neutral">{j.rail}</Badge></td>
                    <td>
                      {j.balanced
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="var(--green-light)"/><polyline points="9 12 11 14 15 10" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="var(--red-light)"/><line x1="15" y1="9" x2="9" y2="15" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"/></svg>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECONCILIATION */}
      {activeTab === 'reconciliation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div className={`alert ${reconcBreaks.length ? 'alert-warning' : 'alert-success'}`}>
            <span className="alert-icon">{reconcBreaks.length ? '⚠️' : '✅'}</span>
            <div>
              <div className="alert-title">{reconcBreaks.length ? `${reconcBreaks.length} Reconciliation Breaks Detected` : 'All Balanced — No Breaks'}</div>
              <div className="alert-body">T+0 streaming reconciliation is running. Last check: 15 seconds ago. Checking webhook confirmations vs ledger entries.</div>
            </div>
          </div>

          {reconcBreaks.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header"><div className="card-title">Open Reconciliation Breaks</div></div>
              <table className="data-table">
                <thead>
                  <tr><th>Break ID</th><th>Transaction</th><th>Type</th><th>Delta</th><th>Age</th><th>Severity</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {reconcBreaks.map((b, i) => (
                    <tr key={i} style={{ cursor: 'default' }}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{b.id}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>{b.txn}</td>
                      <td style={{ fontSize: '0.82rem' }}>{b.type}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: b.delta !== '—' ? 'var(--amber)' : 'var(--text-muted)' }}>{b.delta}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{b.age}</td>
                      <td><Badge variant={b.severity === 'low' ? 'neutral' : 'warning'}>{b.severity}</Badge></td>
                      <td><button className="btn btn-ghost btn-xs" onClick={() => setResolveBreak(b.id)}>Resolve</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* AML & COMPLIANCE */}
      {activeTab === 'aml' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          {amlCases.map((c, i) => (
            <div key={i} className="card" style={{ padding: 'var(--sp-5) var(--sp-6)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-4)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.id}</span>
                    <Badge variant={caseVariant(c.status)}>{c.status.replace('_', ' ')}</Badge>
                    <Badge variant={priorityVariant(c.priority)}>{c.priority}</Badge>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
                    <div><div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer</div><div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{c.customer}</div></div>
                    <div><div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount</div><div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{c.amount}</div></div>
                    <div><div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assigned</div><div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{c.assigned}</div></div>
                    <div><div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>FIU Deadline</div><div style={{ fontSize: '0.875rem', fontWeight: 600, color: c.deadline.includes('h') ? 'var(--red)' : 'var(--text-primary)', marginTop: 2 }}>{c.deadline}</div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                    {c.flags.map((f, j) => <Badge key={j} variant="error">{f}</Badge>)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--sp-3)', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.risk >= 80 ? 'var(--red)' : c.risk >= 60 ? 'var(--amber)' : 'var(--green)', letterSpacing: '-0.04em' }}>{c.risk}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>RISK SCORE</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {c.status !== 'SAR_FILED' && c.status !== 'RESOLVED' && (
                      <button className="btn btn-danger btn-sm" onClick={() => setSarModal(c)}>File SAR</button>
                    )}
                    {c.status === 'SAR_FILED' && <Badge variant="accent">SAR Filed — {c.fiuName}</Badge>}
                    {c.status === 'RESOLVED' && <Badge variant="success">Cleared</Badge>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STABLECOIN TREASURY */}
      {activeTab === 'treasury' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          {/* Vault positions */}
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--sp-4)' }}>USDC Vault Positions</h2>
            <div className="grid-4">
              {treasury.map((t, i) => (
                <div key={i} className="card" style={{ padding: 'var(--sp-5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--sp-4)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color }} />
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.network}</div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.asset}</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4 }}>{t.balance}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>Target: {t.target}</div>
                  <div className="progress-track" style={{ height: 6, marginBottom: 6 }}>
                    <div style={{ height: '100%', width: `${Math.min(t.pct, 100)}%`, background: t.color, borderRadius: 'var(--r-full)', opacity: 0.8 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t.pct}% of target</span>
                    <span style={{ color: 'var(--green)', fontWeight: 600 }}>{t.yield}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Corridor liquidity */}
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--sp-4)' }}>Corridor Liquidity vs Targets (PRD §11.3)</h2>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Corridor</th><th>Actual Balance</th><th>Target</th><th>Minimum Buffer</th><th>Coverage</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {corridorLiquidity.map((c, i) => {
                    const pct = (c.actual / c.target) * 100;
                    const status = c.actual < c.min ? 'CRITICAL' : c.actual < c.target * 0.8 ? 'LOW' : 'OK';
                    return (
                      <tr key={i} style={{ cursor: 'default' }}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>{c.flag}</span><strong>{c.corridor}</strong></div></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${c.actual.toLocaleString()}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>${c.target.toLocaleString()}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>${c.min.toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <ProgressBar value={pct} max={100} color={pct >= 80 ? 'green' : pct >= 60 ? 'amber' : 'red'} />
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td><Badge variant={status === 'OK' ? 'success' : status === 'LOW' ? 'warning' : 'error'} dot>{status}</Badge></td>
                        <td>
                          <button className="btn btn-ghost btn-xs" onClick={() => addToast({ type: 'success', message: `Rebalance initiated for ${c.corridor}.` })}>Rebalance</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trip confirmation modal */}
      <Modal
        open={!!tripModal}
        onClose={() => setTripModal(null)}
        title={`Trip Circuit Breaker — ${tripModal}`}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setTripModal(null)}>Cancel</button>
            <button className="btn btn-danger btn-sm" onClick={() => { addToast({ type: 'warning', title: 'Circuit Tripped', message: `${tripModal} circuit breaker manually OPEN. Traffic re-routed.` }); setTripModal(null); }}>Confirm Trip</button>
          </div>
        }
      >
        <div className="alert alert-warning" style={{ marginBottom: 0 }}>
          <span className="alert-icon">⚠️</span>
          <div>
            <div className="alert-title">Manual Circuit Trip</div>
            <div className="alert-body">Manually tripping the circuit breaker will immediately stop all traffic to <strong>{tripModal}</strong>. The AI Routing Recommender will automatically route all transactions to backup rails. This action is logged in the audit trail.</div>
          </div>
        </div>
      </Modal>

      {/* SAR Filing Modal */}
      <Modal
        open={!!sarModal}
        onClose={() => setSarModal(null)}
        title={`File SAR — ${sarModal?.id}`}
        maxWidth={580}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSarModal(null)}>Cancel</button>
            <button className="btn btn-danger btn-sm" onClick={() => { addToast({ type: 'success', title: 'SAR Filed', message: `Report filed with ${sarModal?.fiuName}. Reference: SAR-2024-${Math.floor(Math.random() * 9999)}` }); setSarModal(null); }}>Submit SAR to {sarModal?.fiuName}</button>
          </div>
        }
      >
        {sarModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)', background: 'var(--bg-subtle)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-4)' }}>
              <div><div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subject</div><div style={{ fontWeight: 600, marginTop: 2 }}>{sarModal.customer}</div></div>
              <div><div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transaction</div><code style={{ fontWeight: 600, marginTop: 2, display: 'block' }}>{sarModal.txn}</code></div>
              <div><div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</div><div style={{ fontWeight: 600, marginTop: 2 }}>{sarModal.amount}</div></div>
              <div><div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jurisdiction</div><div style={{ fontWeight: 600, marginTop: 2 }}>{sarModal.jurisdiction} — {sarModal.fiuName}</div></div>
            </div>
            <div className="form-group">
              <label className="form-label">Suspicious Activity Description</label>
              <textarea className="form-input form-textarea" style={{ minHeight: 100 }} placeholder="Describe the suspicious activity in detail…" />
            </div>
            <div className="form-group">
              <label className="form-label">Analyst Conclusion</label>
              <textarea className="form-input form-textarea" placeholder="Analyst determination and recommended action…" />
            </div>
            <div className="alert alert-info">
              <span className="alert-icon">ℹ️</span>
              <div className="alert-body">SAR will be submitted to <strong>{sarModal.fiuName}</strong> in XML format within the 24-hour regulatory deadline. Filing is logged in the audit trail.</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Resolve break modal */}
      <Modal
        open={!!resolveBreak}
        onClose={() => setResolveBreak(null)}
        title={`Resolve Break ${resolveBreak}`}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setResolveBreak(null)}>Cancel</button>
            <button className="btn btn-success btn-sm" onClick={() => { addToast({ type: 'success', message: `Break ${resolveBreak} marked as resolved.` }); setResolveBreak(null); }}>Mark Resolved</button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Resolution Notes</label>
          <textarea className="form-input form-textarea" placeholder="Describe how this reconciliation break was resolved…" />
        </div>
      </Modal>
    </div>
  );
};
