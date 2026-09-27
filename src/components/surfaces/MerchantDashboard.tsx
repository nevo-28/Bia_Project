import React, { useState } from 'react';
import { Badge, MetricCard, CustomSelect, Modal, Tabs, TimelineItem, useToast } from '../common/UI';

const corridorFloats = [
  { flag: '🇰🇪', currency: 'KES', corridor: 'Kenya', balance: '$487,200', target: '$500,000', pct: 97, status: 'healthy' },
  { flag: '🇳🇬', currency: 'NGN', corridor: 'Nigeria', balance: '$923,800', target: '$1,000,000', pct: 92, status: 'healthy' },
  { flag: '🇬🇭', currency: 'GHS', corridor: 'Ghana', balance: '$281,400', target: '$300,000', pct: 94, status: 'healthy' },
  { flag: '🇿🇦', currency: 'ZAR', corridor: 'South Africa', balance: '$412,100', target: '$500,000', pct: 82, status: 'warning' },
  { flag: '🔵', currency: 'USDC', corridor: 'Stablecoin', balance: '$2,142,300', target: '$2,000,000', pct: 107, status: 'excess' },
];

const transactions = [
  { id: 'PAY-881', amount: 'KES 150,000', amountUsd: '$1,155', method: 'M-PESA', corridor: 'KE → NG', rail: 'PAPSS', status: 'completed', settlement: '3.8s', time: '2 min ago', merchant: 'Jumia Kenya' },
  { id: 'PAY-880', amount: 'GHS 8,400', amountUsd: '$672', method: 'MTN MoMo', corridor: 'GH → ZA', rail: 'Polygon USDC', status: 'pending', settlement: '—', time: '8 min ago', merchant: 'Wave GH' },
  { id: 'PAY-879', amount: '₦2,250,000', amountUsd: '$1,500', method: 'Moniepoint', corridor: 'NG local', rail: 'NIBSS NIP', status: 'completed', settlement: '1.4s', time: '14 min ago', merchant: 'Kuda NG' },
  { id: 'PAY-878', amount: 'KES 75,000', amountUsd: '$577', method: 'M-PESA', corridor: 'KE → GH', rail: 'Solana USDC', status: 'failed', settlement: '—', time: '22 min ago', merchant: 'Chipper Cash' },
  { id: 'PAY-877', amount: 'ZAR 14,200', amountUsd: '$765', method: 'Ozow', corridor: 'ZA local', rail: 'Ozow', status: 'completed', settlement: '4.1s', time: '31 min ago', merchant: 'AZA Finance' },
  { id: 'PAY-876', amount: 'USDC 4,800', amountUsd: '$4,800', method: 'Polygon USDC', corridor: 'Multi', rail: 'Polygon', status: 'completed', settlement: '2.1s', time: '45 min ago', merchant: 'NovaPay' },
  { id: 'PAY-875', amount: 'KES 320,000', amountUsd: '$2,461', method: 'M-PESA', corridor: 'KE → RW', rail: 'PAPSS', status: 'completed', settlement: '5.2s', time: '1 hr ago', merchant: 'Safeboda KE' },
];

const apiKeys = [
  { name: 'Production API Key', key: 'ap_live_9a1b2c3d4e5f', env: 'live', lastUsed: '2 min ago', created: 'Jan 8, 2024', perms: ['payments', 'accounts', 'webhooks'] },
  { name: 'Backend Worker Key', key: 'ap_live_7g8h9i0j1k2l', env: 'live', lastUsed: '14 min ago', created: 'Jan 2, 2024', perms: ['payments', 'accounts'] },
  { name: 'Sandbox Test Key', key: 'ap_test_3m4n5o6p7q8r', env: 'sandbox', lastUsed: '3 days ago', created: 'Dec 15, 2023', perms: ['all'] },
];

const webhooks = [
  { url: 'https://api.jumia.co.ke/payments/webhook', events: ['payment.completed', 'payment.failed'], lastDelivery: '2 min ago', status: 'active', successRate: '99.8%' },
  { url: 'https://api.jumia.co.ke/refunds/webhook', events: ['payment.refunded'], lastDelivery: '3 days ago', status: 'active', successRate: '100%' },
  { url: 'https://staging.jumia.co.ke/webhook', events: ['all'], lastDelivery: '12 days ago', status: 'inactive', successRate: '87.2%' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

const corridorOptions = [
  { value: 'all', label: 'All Corridors' },
  { value: 'ke_ng', label: '🇰🇪 Kenya → 🇳🇬 Nigeria' },
  { value: 'gh_za', label: '🇬🇭 Ghana → 🇿🇦 South Africa' },
  { value: 'ng_local', label: '🇳🇬 Nigeria Local' },
  { value: 'ke_gh', label: '🇰🇪 Kenya → 🇬🇭 Ghana' },
];

const sparkVol   = [420, 480, 510, 490, 560, 610, 580, 650, 720, 690, 750, 810, 890];
const sparkSucc  = [94, 95, 97, 96, 98, 97, 99, 98, 97, 98, 99, 98, 99];
const sparkFloat = [2.1, 2.15, 2.08, 2.22, 2.18, 2.25, 2.14, 2.2, 2.28, 2.24, 2.3, 2.21, 2.31];
const sparkSettle= [6.2, 5.8, 5.5, 6.0, 4.9, 5.1, 4.8, 4.6, 4.9, 4.7, 4.4, 4.6, 4.2];

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'payments', label: 'Payments', count: 7 },
  { id: 'balances', label: 'Balances' },
  { id: 'api-keys', label: 'API Keys' },
  { id: 'webhooks', label: 'Webhooks' },
];

export const MerchantDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('all');
  const [corridorFilter, setCorridorFilter] = useState('all');
  const [selectedTxn, setSelectedTxn] = useState<typeof transactions[0] | null>(null);
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [addWebhookOpen, setAddWebhookOpen] = useState(false);
  const [collectOpen, setCollectOpen] = useState(false);

  const filtered = transactions.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const statusVariant = (s: string) => s === 'completed' ? 'success' : s === 'pending' ? 'warning' : 'error';

  return (
    <div className="bia-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="page-title">Good afternoon, Nia 👋</h1>
          <p className="page-subtitle">Here's what's happening across your payment corridors today.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-md" onClick={() => addToast({ type: 'info', message: 'Report generating...' })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Report
          </button>
          <button className="btn btn-primary btn-md" onClick={() => setCollectOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Collect Payment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          {/* KPI Metrics */}
          <div className="grid-4">
            <MetricCard label="24h Volume" value="$48,900" delta="18.4%" deltaDir="up" deltaSub="vs yesterday" sparkData={sparkVol} sparkColor="#635BFF" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#635BFF" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} iconBg="#EEF0FF" />
            <MetricCard label="Total Float" value="$4.25M" delta="2.1%" deltaDir="up" deltaSub="funded" sparkData={sparkFloat} sparkColor="#0570DE" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0570DE" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>} iconBg="#EBF5FF" />
            <MetricCard label="Success Rate" value="98.7%" delta="0.4%" deltaDir="up" deltaSub="vs last 7 days" sparkData={sparkSucc} sparkColor="#00A67E" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A67E" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>} iconBg="#E6F7F3" />
            <MetricCard label="Avg Settlement" value="4.2s" delta="0.8s" deltaDir="down" deltaSub="faster" sparkData={sparkSettle.map(v => 10 - v)} sparkColor="#DB7D12" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DB7D12" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} iconBg="#FEF7EC" />
          </div>

          {/* Corridor Float + Recent Transactions */}
          <div className="grid-12" style={{ gap: 'var(--sp-6)' }}>
            {/* Float Table */}
            <div className="card col-5" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Corridor Float Positions</div>
                  <div className="card-subtitle">Real-time treasury balances</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('balances')}>Manage</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Corridor</th>
                    <th>Balance</th>
                    <th>Coverage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {corridorFloats.map((c, i) => (
                    <tr key={i} style={{ cursor: 'default' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{c.flag}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{c.currency}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.corridor}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{c.balance}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div className="progress-track" style={{ height: 4 }}>
                            <div className={`progress-fill ${c.pct >= 100 ? 'accent' : c.pct >= 85 ? 'green' : 'amber'}`} style={{ width: `${Math.min(c.pct, 100)}%` }} />
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{c.pct}%</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={c.status === 'healthy' ? 'success' : c.status === 'excess' ? 'accent' : 'warning'} dot>
                          {c.status === 'excess' ? 'Above Target' : c.status === 'warning' ? 'Low' : 'OK'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Transactions */}
            <div className="card col-7" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Recent Transactions</div>
                  <div className="card-subtitle">Live feed across all corridors</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('payments')}>View All</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Amount</th><th>Method</th><th>Rail</th><th>Status</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 6).map((t, i) => (
                    <tr key={i} onClick={() => setSelectedTxn(t)}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>{t.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{t.amount}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.amountUsd}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t.method}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.rail}</td>
                      <td><Badge variant={statusVariant(t.status)} dot>{t.status}</Badge></td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="filter-search" style={{ maxWidth: 280 }}>
              <span className="filter-search-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              <input className="filter-search-input" placeholder="Search transaction ID, merchant…" />
            </div>
            <div style={{ width: 160 }}>
              <CustomSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
            </div>
            <div style={{ width: 220 }}>
              <CustomSelect value={corridorFilter} onChange={setCorridorFilter} options={corridorOptions} />
            </div>
            <button className="btn btn-secondary btn-md" style={{ marginLeft: 'auto' }} onClick={() => addToast({ type: 'info', message: 'CSV export started.' })}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>Transaction ID</th><th>Amount</th><th>Method</th><th>Corridor</th><th>Rail</th><th>Status</th><th>Settlement</th><th>Time</th></tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={i} onClick={() => setSelectedTxn(t)}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>{t.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.amount}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.amountUsd}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{t.method}</td>
                    <td style={{ fontSize: '0.82rem' }}>{t.corridor}</td>
                    <td><code style={{ fontSize: '0.75rem' }}>{t.rail}</code></td>
                    <td><Badge variant={statusVariant(t.status)} dot>{t.status}</Badge></td>
                    <td style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: t.status === 'completed' ? 'var(--green)' : 'var(--text-muted)' }}>{t.settlement}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BALANCES TAB */}
      {activeTab === 'balances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div className="grid-3">
            {corridorFloats.map((c, i) => (
              <div key={i} className="card" style={{ padding: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.8rem' }}>{c.flag}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{c.currency}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.corridor}</div>
                    </div>
                  </div>
                  <Badge variant={c.status === 'healthy' ? 'success' : c.status === 'excess' ? 'accent' : 'warning'} dot>
                    {c.status === 'excess' ? 'Above Target' : c.status === 'warning' ? 'Low' : 'Healthy'}
                  </Badge>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4 }}>{c.balance}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>Target: {c.target}</div>
                <div className="progress-track" style={{ height: 6 }}>
                  <div className={`progress-fill ${c.pct >= 100 ? 'accent' : c.pct >= 85 ? 'green' : 'amber'}`} style={{ width: `${Math.min(c.pct, 100)}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>{c.pct}% funded</span>
                  <button className="btn-link" style={{ fontSize: '0.72rem' }} onClick={() => addToast({ type: 'info', message: `Rebalance for ${c.currency} initiated.` })}>Rebalance →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API KEYS TAB */}
      {activeTab === 'api-keys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Manage your live and test API keys. Keep your live keys secret.</p>
            <button className="btn btn-primary btn-md" onClick={() => setCreateKeyOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Key
            </button>
          </div>
          {apiKeys.map((key, i) => (
            <div key={i} className="card" style={{ padding: 'var(--sp-5) var(--sp-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: key.env === 'live' ? 'var(--green-light)' : 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={key.env === 'live' ? 'var(--green)' : 'var(--blue)'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{key.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <code style={{ fontSize: '0.78rem' }}>{key.key.replace(/[a-z0-9]{16}$/, '••••••••••••••••')}</code>
                      <Badge variant={key.env === 'live' ? 'success' : 'info'}>{key.env}</Badge>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last used</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>{key.lastUsed}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => addToast({ type: 'info', message: 'API key copied to clipboard.' })}>Copy</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => addToast({ type: 'warning', message: `${key.name} rotated.` })}>Rotate</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => addToast({ type: 'error', message: `${key.name} revoked.` })}>Revoke</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WEBHOOKS TAB */}
      {activeTab === 'webhooks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Configure HTTPS endpoints to receive real-time payment event notifications.</p>
            <button className="btn btn-primary btn-md" onClick={() => setAddWebhookOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Endpoint
            </button>
          </div>
          {webhooks.map((w, i) => (
            <div key={i} className="card" style={{ padding: 'var(--sp-5) var(--sp-6)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-4)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>{w.url}</span>
                    <Badge variant={w.status === 'active' ? 'success' : 'neutral'} dot>{w.status}</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                    {w.events.map((e, j) => <Badge key={j} variant="neutral">{e}</Badge>)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Success rate</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: parseFloat(w.successRate) >= 95 ? 'var(--green)' : 'var(--amber)' }}>{w.successRate}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Last delivery</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{w.lastDelivery}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => addToast({ type: 'success', message: `Test event sent to ${w.url}` })}>Test</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Detail Modal */}
      <Modal
        open={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        title={`Transaction ${selectedTxn?.id}`}
        maxWidth={560}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { addToast({ type: 'info', message: 'Receipt downloaded.' }); setSelectedTxn(null); }}>Download Receipt</button>
            {selectedTxn?.status === 'completed' && <button className="btn btn-danger btn-sm" onClick={() => { addToast({ type: 'warning', message: 'Refund initiated.' }); setSelectedTxn(null); }}>Refund</button>}
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTxn(null)}>Close</button>
          </div>
        }
      >
        {selectedTxn && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            {/* Amount hero */}
            <div style={{ textAlign: 'center', padding: 'var(--sp-5)', background: 'var(--bg-subtle)', borderRadius: 'var(--r-lg)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>{selectedTxn.amount}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{selectedTxn.amountUsd} · {selectedTxn.corridor}</div>
              <div style={{ marginTop: 8 }}><Badge variant={statusVariant(selectedTxn.status)} dot>{selectedTxn.status}</Badge></div>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
              {[
                { label: 'Transaction ID', value: selectedTxn.id },
                { label: 'Payment Method', value: selectedTxn.method },
                { label: 'Merchant', value: selectedTxn.merchant },
                { label: 'Rail', value: selectedTxn.rail },
                { label: 'Settlement Time', value: selectedTxn.settlement },
                { label: 'Timestamp', value: selectedTxn.time },
              ].map((f, i) => (
                <div key={i} style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', padding: 'var(--sp-3)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: ['Transaction ID', 'Rail'].includes(f.label) ? 'var(--font-mono)' : undefined }}>{f.value}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--sp-4)' }}>Payment Timeline</div>
              <div className="timeline">
                <TimelineItem status="done" title="Payment Initiated" subtitle="API request received with idempotency key" meta="IDEM-abc123def456" />
                <TimelineItem status="done" title="Policy Gate: APPROVED" subtitle="KYC Tier 3 · Amount within limits · No sanctions match" meta="Risk score: 12/100" />
                <TimelineItem status={selectedTxn.status === 'failed' ? 'error' : 'done'} title={selectedTxn.status === 'failed' ? 'Rail Submission Failed' : 'Submitted to Rail'} subtitle={`Provider: ${selectedTxn.rail}`} meta={`Route: ${selectedTxn.corridor}`} />
                <TimelineItem status={selectedTxn.status === 'completed' ? 'done' : selectedTxn.status === 'pending' ? 'active' : 'error'} title={selectedTxn.status === 'completed' ? 'Settlement Complete' : selectedTxn.status === 'pending' ? 'Awaiting Confirmation' : 'Failed'} subtitle={selectedTxn.status === 'completed' ? `Settled in ${selectedTxn.settlement}` : undefined} isLast />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Key Modal */}
      <Modal
        open={createKeyOpen}
        onClose={() => setCreateKeyOpen(false)}
        title="Create New API Key"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setCreateKeyOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => { addToast({ type: 'success', title: 'API Key Created', message: 'ap_live_new••••••••••••' }); setCreateKeyOpen(false); }}>Create Key</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="form-group">
            <label className="form-label">Key Name</label>
            <input className="form-input" placeholder="e.g. Production Server Key" />
          </div>
          <div className="form-group">
            <label className="form-label">Environment</label>
            <CustomSelect value="live" onChange={() => {}} options={[{ value: 'live', label: 'Live', icon: '🟢' }, { value: 'sandbox', label: 'Sandbox', icon: '🔵' }]} />
          </div>
          <div className="form-group">
            <label className="form-label">Permissions</label>
            {['payments', 'accounts', 'webhooks', 'disputes'].map(p => (
              <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={['payments', 'accounts'].includes(p)} style={{ accentColor: 'var(--accent)' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{p}</span>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal
        open={collectOpen}
        onClose={() => setCollectOpen(false)}
        title="Collect Payment"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setCollectOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => { addToast({ type: 'success', title: 'Payment Initiated', message: 'STK push sent to customer.' }); setCollectOpen(false); }}>Send STK Push</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <CustomSelect value="mpesa" onChange={() => {}} options={[
              { value: 'mpesa', label: 'M-PESA', icon: '📱', meta: 'KE' },
              { value: 'mtn', label: 'MTN MoMo', icon: '📱', meta: 'GH/RW' },
              { value: 'airtel', label: 'Airtel Money', icon: '📱', meta: 'Multi' },
              { value: 'usdc', label: 'USDC Polygon', icon: '🔵', meta: 'DeFi' },
            ]} />
          </div>
          <div className="form-group">
            <label className="form-label">Customer Phone Number</label>
            <input className="form-input" placeholder="+254 712 345 678" />
          </div>
          <div className="form-group">
            <label className="form-label">Amount (KES)</label>
            <div className="input-group">
              <span className="input-prefix" style={{ left: 10 }}>KES</span>
              <input className="form-input input-has-prefix" type="number" placeholder="5,000" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reference</label>
            <input className="form-input" placeholder="INV-2024-001" />
          </div>
        </div>
      </Modal>

      {/* Add Webhook Modal */}
      <Modal
        open={addWebhookOpen}
        onClose={() => setAddWebhookOpen(false)}
        title="Add Webhook Endpoint"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setAddWebhookOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => { addToast({ type: 'success', message: 'Webhook endpoint registered.' }); setAddWebhookOpen(false); }}>Register Endpoint</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="form-group">
            <label className="form-label">Endpoint URL</label>
            <input className="form-input" placeholder="https://yoursite.com/webhooks/bia" />
          </div>
          <div className="form-group">
            <label className="form-label">Events to Subscribe</label>
            {['payment.completed', 'payment.failed', 'payment.refunded', 'dispute.opened'].map(ev => (
              <label key={ev} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={ev.includes('completed') || ev.includes('failed')} style={{ accentColor: 'var(--accent)' }} />
                <code style={{ fontSize: '0.8rem' }}>{ev}</code>
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
