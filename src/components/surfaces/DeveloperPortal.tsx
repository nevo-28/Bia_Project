import React, { useState } from 'react';
import { Badge, CustomSelect, Tabs, CopyBtn, useToast } from '../common/UI';

const endpointGroups = [
  {
    group: 'Collections',
    endpoints: [
      { method: 'POST', path: '/v1/payments/collect', desc: 'Initiate a payment collection from a customer', body: `{
  "amount": 5000,
  "currency": "KES",
  "paymentMethod": {
    "type": "mobile_money",
    "provider": "mpesa",
    "phoneNumber": "+254712345678"
  },
  "reference": "INV-2026-001",
  "callbackUrl": "https://yoursite.com/webhooks"
}`, response: `{
  "id": "pay_abc123def456",
  "status": "pending",
  "amount": 5000,
  "currency": "KES",
  "fee": 75,
  "netAmount": 4925,
  "instructions": {
    "type": "stk_push",
    "message": "Enter your M-PESA PIN"
  }
}` },
      { method: 'GET',  path: '/v1/payments/collect/{id}', desc: 'Retrieve payment status by ID', body: '', response: `{ "id": "pay_abc123def456", "status": "completed", "settledAt": "2026-09-25T10:32:00Z" }` },
      { method: 'POST', path: '/v1/payments/collect/{id}/refund', desc: 'Initiate a refund', body: `{ "amount": 5000, "reason": "customer_request" }`, response: `{ "refundId": "ref_xyz789", "status": "pending" }` },
    ],
  },
  {
    group: 'Disbursements',
    endpoints: [
      { method: 'POST', path: '/v1/payments/disburse', desc: 'Send funds to a recipient mobile wallet or bank', body: `{
  "amount": 500,
  "currency": "USD",
  "recipient": {
    "phoneNumber": "+233241234567",
    "provider": "mtn_momo",
    "country": "GH"
  },
  "reference": "PAYOUT-001"
}`, response: `{ "id": "dis_987abc", "status": "submitted", "rail": "MTN MoMo GH", "expectedSettlement": "~2 minutes" }` },
      { method: 'POST', path: '/v1/payments/disburse/batch', desc: 'Batch disbursements (up to 1,000/request)', body: `{ "disbursements": [ {...}, {...} ], "batchReference": "BATCH-2024-01" }`, response: `{ "batchId": "bat_123", "accepted": 1000, "rejected": 0 }` },
    ],
  },
  {
    group: 'Accounts & Balances',
    endpoints: [
      { method: 'GET', path: '/v1/accounts/balance', desc: 'Get wallet balance across all currencies', body: '', response: `{ "balances": [ { "currency": "KES", "amount": 487200 }, { "currency": "NGN", "amount": 923800 } ] }` },
      { method: 'GET', path: '/v1/accounts/transactions', desc: 'List transactions with filters', body: '', response: `{ "data": [...], "pagination": { "total": 1042, "page": 1 } }` },
    ],
  },
  {
    group: 'Webhooks',
    endpoints: [
      { method: 'POST',   path: '/v1/webhooks', desc: 'Register a webhook endpoint', body: `{ "url": "https://yoursite.com/webhooks", "events": ["payment.completed", "payment.failed"] }`, response: `{ "id": "wh_abc", "secret": "whsec_..." }` },
      { method: 'DELETE', path: '/v1/webhooks/{id}', desc: 'Delete a webhook', body: '', response: `{ "deleted": true }` },
      { method: 'POST',   path: '/v1/webhooks/{id}/test', desc: 'Send a test webhook event', body: `{ "event": "payment.completed" }`, response: `{ "delivered": true, "statusCode": 200, "latencyMs": 142 }` },
    ],
  },
];

const rails = [
  { name: 'M-PESA Daraja', type: 'Mobile Money', countries: 'KE, TZ, DRC, GH', status: 'operational', latency: '3.8s', uptime: 99.98, tps: 120, circuit: 'CLOSED' },
  { name: 'MTN MoMo', type: 'Mobile Money', countries: '15 countries', status: 'operational', latency: '2.1s', uptime: 99.91, tps: 95, circuit: 'CLOSED' },
  { name: 'Airtel Money', type: 'Mobile Money', countries: '14 countries', status: 'degraded', latency: '8.2s', uptime: 97.3, tps: 40, circuit: 'HALF_OPEN' },
  { name: 'PawaPay', type: 'Aggregator', countries: '20 countries', status: 'operational', latency: '4.4s', uptime: 99.82, tps: 80, circuit: 'CLOSED' },
  { name: 'Paystack', type: 'Card + Bank', countries: 'NG, GH, SA, KE', status: 'operational', latency: '1.6s', uptime: 99.95, tps: 200, circuit: 'CLOSED' },
  { name: 'Flutterwave', type: 'Card + Bank', countries: '30+ countries', status: 'outage', latency: '—', uptime: 92.1, tps: 0, circuit: 'OPEN' },
  { name: 'NIBSS NIP', type: 'Bank Transfer', countries: 'NG', status: 'operational', latency: '1.4s', uptime: 99.89, tps: 150, circuit: 'CLOSED' },
  { name: 'Polygon USDC', type: 'Stablecoin', countries: 'Global', status: 'operational', latency: '2.3s', uptime: 99.99, tps: 500, circuit: 'CLOSED' },
  { name: 'Solana USDC', type: 'Stablecoin', countries: 'Global', status: 'operational', latency: '0.9s', uptime: 99.97, tps: 2000, circuit: 'CLOSED' },
  { name: 'Ethereum USDC', type: 'Stablecoin', countries: 'Global', status: 'operational', latency: '14s', uptime: 99.99, tps: 50, circuit: 'CLOSED' },
];

const sdks = [
  { lang: 'TypeScript', pkg: '@bia/node', install: 'npm install @bia/node', color: '#3178C6', example: `import { BiaClient } from '@bia/node';\n\nconst bia = new BiaClient({\n  apiKey: process.env.BIA_API_KEY,\n});\n\nconst payment = await bia.payments.collect({\n  amount: 5000,\n  currency: 'KES',\n  paymentMethod: { type: 'mobile_money', provider: 'mpesa', phoneNumber: '+254712345678' },\n  reference: 'INV-2024-001',\n});` },
  { lang: 'Python', pkg: 'bia-python', install: 'pip install bia-python', color: '#3776AB', example: `import bia\n\nbia.api_key = os.environ.get('BIA_API_KEY')\n\npayment = bia.Payment.collect(\n    amount=5000,\n    currency='KES',\n    payment_method={\n        'type': 'mobile_money',\n        'provider': 'mpesa',\n        'phone_number': '+254712345678',\n    },\n    reference='INV-2024-001',\n)` },
  { lang: 'Go', pkg: 'github.com/bia/go-sdk', install: 'go get github.com/bia/go-sdk', color: '#00ADD8', example: `import "github.com/bia/go-sdk"\n\nclient := bia.NewClient(os.Getenv("BIA_API_KEY"))\n\npayment, err := client.Payments.Collect(ctx, &bia.CollectParams{\n    Amount:   5000,\n    Currency: "KES",\n    PaymentMethod: &bia.PaymentMethod{\n        Type:     "mobile_money",\n        Provider: "mpesa",\n        Phone:    "+254712345678",\n    },\n})` },
  { lang: 'Flutter', pkg: 'bia_flutter', install: 'flutter pub add bia_flutter', color: '#54C5F8', example: `final client = BiaClient(apiKey: 'ap_live_...');\n\nfinal payment = await client.payments.collect(\n  BiaCollectParams(\n    amount: 5000,\n    currency: 'KES',\n    paymentMethod: MobileMoneyMethod(\n      provider: 'mpesa',\n      phoneNumber: '+254712345678',\n    ),\n  ),\n);` },
  { lang: 'PHP', pkg: 'bia/php-sdk', install: 'composer require bia/php-sdk', color: '#777BB3', example: `$client = new \\Bia\\Client(getenv('BIA_API_KEY'));\n\n$payment = $client->payments->collect([\n    'amount' => 5000,\n    'currency' => 'KES',\n    'payment_method' => [\n        'type' => 'mobile_money',\n        'provider' => 'mpesa',\n        'phone_number' => '+254712345678',\n    ],\n]);` },
];

const langOptions = [
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'curl', label: 'cURL', icon: '🔧' },
];

const tabs = [
  { id: 'reference', label: 'API Reference' },
  { id: 'playground', label: 'Playground' },
  { id: 'status', label: 'Rail Status' },
  { id: 'sdks', label: 'SDKs' },
];

function generateSnippet(lang: string, ep: { method: string; path: string; body: string }): string {
  if (lang === 'curl') {
    if (ep.method === 'GET') {
      return `curl -X GET https://api.biapay.io${ep.path} \\\n  -H "Authorization: Bearer sk_live_9921_prod_token"`;
    }
    return `curl -X ${ep.method} https://api.biapay.io${ep.path} \\\n  -H "Authorization: Bearer sk_live_9921_prod_token" \\\n  -H "Content-Type: application/json" \\\n  -H "Idempotency-Key: idem_live_91823" \\\n  -d '${ep.body}'`;
  }
  if (lang === 'python') {
    return `import bia\nimport os\n\nbia.api_key = os.environ.get("BIA_API_KEY")\n\n# ${ep.method} ${ep.path}\nresponse = bia.request(\n    method="${ep.method}",\n    endpoint="${ep.path}"${ep.body ? `,\n    data=${ep.body}` : ''}\n)\nprint(response)`;
  }
  if (lang === 'go') {
    return `package main\n\nimport (\n\t"context"\n\t"fmt"\n\t"os"\n\t"github.com/bia/go-sdk"\n)\n\nfunc main() {\n\tclient := bia.NewClient(os.Getenv("BIA_API_KEY"))\n\t// ${ep.method} ${ep.path}\n\tres, err := client.Execute(context.Background(), "${ep.method}", "${ep.path}", payload)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tfmt.Printf("%+v\\n", res)\n}`;
  }
  // default typescript
  return `import { BiaClient } from '@bia/node';\n\nconst bia = new BiaClient({\n  apiKey: process.env.BIA_API_KEY!,\n});\n\n// ${ep.method} ${ep.path}\nconst response = await bia.request('${ep.method}', '${ep.path}'${ep.body ? `, ${ep.body}` : ''});\nconsole.log(response);`;
}

export const DeveloperPortal: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('reference');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [codeLang, setCodeLang] = useState('typescript');
  const [playEndpoint, setPlayEndpoint] = useState('/v1/payments/collect');
  const [playResponse, setPlayResponse] = useState<any>(null);
  const [playing, setPlaying] = useState(false);

  const executePlayground = () => {
    setPlaying(true);
    setTimeout(() => {
      setPlaying(false);
      setPlayResponse({
        status: 201,
        latency: '142ms',
        body: JSON.parse(endpointGroups[0].endpoints[0].response || '{}'),
      });
      addToast({ type: 'success', message: 'API call successful — 201 Created' });
    }, 1200);
  };

  const circuitBadge = (c: string) => c === 'CLOSED' ? 'success' : c === 'HALF_OPEN' ? 'warning' : 'error';

  return (
    <div className="bia-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Developer Portal</h1>
          <p className="page-subtitle">API reference, interactive playground, rail status monitoring, and SDKs.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-md" onClick={() => addToast({ type: 'info', message: 'OpenAPI spec downloading...' })}>
            Download OpenAPI Spec
          </button>
          <button className="btn btn-secondary btn-md" onClick={() => addToast({ type: 'info', message: 'Postman collection downloading...' })}>
            Postman Collection
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* API REFERENCE */}
      {activeTab === 'reference' && (
        <div style={{ display: 'flex', gap: 'var(--sp-6)', alignItems: 'flex-start' }}>
          {/* Left: endpoint list */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div className="card" style={{ padding: 'var(--sp-3)' }}>
              {endpointGroups.map(group => (
                <div key={group.group} style={{ marginBottom: 'var(--sp-3)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px var(--sp-2)', marginBottom: 2 }}>{group.group}</div>
                  {group.endpoints.map(ep => (
                    <button
                      key={ep.path}
                      className={`sidebar-nav-item ${expandedEndpoint === ep.path ? 'active' : ''}`}
                      onClick={() => setExpandedEndpoint(ep.path === expandedEndpoint ? null : ep.path)}
                      style={{ fontSize: '0.78rem', width: '100%', textAlign: 'left', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span className={`badge-method badge-method-${ep.method.toLowerCase()}`}>{ep.method}</span>
                      <span className="truncate" style={{ fontFamily: 'var(--font-mono)' }}>{ep.path.replace('/v1/', '/')}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right: endpoint detail */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {endpointGroups.flatMap(g => g.endpoints).map(ep => (
              (expandedEndpoint === ep.path || (!expandedEndpoint && ep.path === '/v1/payments/collect')) && (
                <div key={ep.path} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                  {/* Header */}
                  <div className="card" style={{ padding: 'var(--sp-5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
                      <span className={`badge-method badge-method-${ep.method.toLowerCase()}`}>{ep.method}</span>
                      <code style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>{ep.path}</code>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ep.desc}</p>
                  </div>

                  {/* Code tabs */}
                  <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="card-header">
                      <div className="card-title">Code Example ({codeLang})</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                        <div style={{ width: 160 }}>
                          <CustomSelect value={codeLang} onChange={setCodeLang} options={langOptions} />
                        </div>
                        <CopyBtn text={generateSnippet(codeLang, ep)} label="Copy Snippet" />
                      </div>
                    </div>
                    <div style={{ padding: 'var(--sp-5)' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        Integration Snippet
                      </div>
                      <pre className="code-block" style={{ background: '#0A2540', color: '#E3E8EE' }}>
                        <code>{generateSnippet(codeLang, ep)}</code>
                      </pre>
                    </div>
                    {ep.response && (
                      <div style={{ padding: '0 var(--sp-5) var(--sp-5)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                          Sample JSON Response
                        </div>
                        <pre className="code-block" style={{ background: '#0F172A', color: '#00D4B2' }}>
                          <code>{ep.response}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* PLAYGROUND */}
      {activeTab === 'playground' && (
        <div className="grid-12" style={{ gap: 'var(--sp-6)', alignItems: 'flex-start' }}>
          {/* Request builder */}
          <div className="card col-6" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <div className="card-title">Request Builder</div>
              <Badge variant="info">Sandbox</Badge>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div className="form-group">
                <label className="form-label">Endpoint</label>
                <CustomSelect
                  value={playEndpoint}
                  onChange={setPlayEndpoint}
                  options={endpointGroups.flatMap(g => g.endpoints.map(e => ({ value: e.path, label: `${e.method} ${e.path}` })))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Request Body (JSON)</label>
                <textarea className="form-input form-textarea" style={{ minHeight: 180, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} defaultValue={JSON.stringify({
                  amount: 5000, currency: 'KES',
                  paymentMethod: { type: 'mobile_money', provider: 'mpesa', phoneNumber: '+254712345678' },
                  reference: 'INV-2024-001'
                }, null, 2)} />
              </div>
              <div className="form-group">
                <label className="form-label">Headers</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
                  <input className="form-input" value="Authorization" readOnly style={{ background: 'var(--bg-subtle)' }} />
                  <input className="form-input" placeholder="Bearer ap_test_..." style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
                  <input className="form-input" value="Idempotency-Key" readOnly style={{ background: 'var(--bg-subtle)' }} />
                  <input className="form-input" placeholder="idem_xxx" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
                </div>
              </div>
              <button className="btn btn-primary btn-md" onClick={executePlayground} disabled={playing}>
                {playing ? (
                  <><span className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Executing…</>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>
                    Execute Request
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response */}
          <div className="card col-6" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <div className="card-title">Response</div>
              {playResponse && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <Badge variant="success">{playResponse.status}</Badge>
                  <Badge variant="neutral">{playResponse.latency}</Badge>
                </div>
              )}
            </div>
            <div className="card-body">
              {playResponse ? (
                <pre className="code-block" style={{ minHeight: 360 }}>{JSON.stringify(playResponse.body, null, 2)}</pre>
              ) : (
                <div className="empty-state" style={{ minHeight: 360 }}>
                  <div className="empty-state-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <div className="empty-state-title">Ready to Execute</div>
                  <div className="empty-state-desc">Configure your request and click Execute to see the response from the Bia sandbox.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RAIL STATUS */}
      {activeTab === 'status' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          {/* Summary row */}
          <div className="grid-4">
            {[
              { label: 'Operational', value: `${rails.filter(r => r.status === 'operational').length}`, color: 'var(--green)', icon: '✅' },
              { label: 'Degraded', value: `${rails.filter(r => r.status === 'degraded').length}`, color: 'var(--amber)', icon: '⚠️' },
              { label: 'Outage', value: `${rails.filter(r => r.status === 'outage').length}`, color: 'var(--red)', icon: '🔴' },
              { label: 'Overall Uptime (30d)', value: '99.64%', color: 'var(--green)', icon: '📈' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: 'var(--sp-5)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rails table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <div className="card-title">Payment Rail Health</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="status-dot green pulse" />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Live monitoring</span>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Rail</th><th>Type</th><th>Countries</th><th>Status</th><th>Avg Latency</th><th>30d Uptime</th><th>TPS</th><th>Circuit</th></tr>
              </thead>
              <tbody>
                {rails.map((r, i) => (
                  <tr key={i} style={{ cursor: 'default' }}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td style={{ fontSize: '0.8rem' }}><Badge variant="neutral">{r.type}</Badge></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.countries}</td>
                    <td>
                      <Badge variant={r.status === 'operational' ? 'success' : r.status === 'degraded' ? 'warning' : 'error'} dot>
                        {r.status}
                      </Badge>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: r.status === 'outage' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{r.latency}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div className="progress-track" style={{ height: 4, width: 80 }}>
                          <div className={`progress-fill ${r.uptime >= 99 ? 'green' : r.uptime >= 95 ? 'amber' : 'red'}`} style={{ width: `${r.uptime}%` }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.uptime}%</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{r.tps === 0 ? '—' : r.tps}</td>
                    <td>
                      <Badge variant={circuitBadge(r.circuit)}>
                        {r.circuit}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SDKs */}
      {activeTab === 'sdks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div className="grid-3">
            {sdks.slice(0, 3).map((sdk, i) => (
              <div key={i} className="card" style={{ padding: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: sdk.color + '18', border: `1px solid ${sdk.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: sdk.color, fontSize: '0.85rem' }}>
                    {sdk.lang.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sdk.lang}</div>
                    <code style={{ fontSize: '0.75rem' }}>{sdk.pkg}</code>
                  </div>
                </div>
                <div className="code-block" style={{ marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>$ {sdk.install}</span>
                  <CopyBtn text={sdk.install} />
                </div>
                <pre className="code-block" style={{ fontSize: '0.75rem', height: 180, overflowY: 'auto' }}>{sdk.example}</pre>
                <button className="btn btn-secondary btn-md btn-full" style={{ marginTop: 'var(--sp-4)' }} onClick={() => addToast({ type: 'info', message: `${sdk.lang} SDK documentation opened.` })}>
                  View Docs →
                </button>
              </div>
            ))}
          </div>
          <div className="grid-2">
            {sdks.slice(3).map((sdk, i) => (
              <div key={i} className="card" style={{ padding: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: sdk.color + '18', border: `1px solid ${sdk.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: sdk.color, flexShrink: 0 }}>
                  {sdk.lang.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sdk.lang}</div>
                  <code style={{ fontSize: '0.75rem' }}>{sdk.pkg}</code>
                </div>
                <div className="code-block" style={{ fontSize: '0.8rem', padding: '6px 12px', flex: 2 }}>$ {sdk.install}</div>
                <CopyBtn text={sdk.install} />
                <button className="btn btn-secondary btn-sm" onClick={() => addToast({ type: 'info', message: `${sdk.lang} SDK docs opened.` })}>Docs</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
