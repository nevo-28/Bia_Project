import React, { useState, useEffect } from 'react';
import { Badge, MetricCard, Tabs, useToast, CopyBtn, Modal, CustomSelect } from '../common/UI';
import { DeepSeekService, DeepSeekExecutionResult } from '../../services/engine/deepseekService';

const samplePrompts = [
  {
    title: 'Kenya M-PESA Collection',
    text: 'Collect KES 15,000 from customer +254 712 345 678 for order ORD-KE-8821. Auto-route via Daraja STK Push.',
  },
  {
    title: 'Ghana MTN MoMo Payout',
    text: 'Send $450 to supplier in Accra via MTN Mobile Money. Phone: +233 24 123 4567. Purpose: Agricultural wholesale invoice INV-881.',
  },
  {
    title: 'High-Value Nigeria Transfer (Escalation)',
    text: 'Disburse ₦8,500,000 to Moniepoint account 0123456789 for corporate equipment delivery.',
  },
  {
    title: 'OFAC Sanctions Block (Fail-Closed)',
    text: 'Transfer $25,000 to entity "AL-BARAKAAT EXCHANGE" in Mogadishu via international wire.',
  },
];

const mcpTools = [
  {
    name: 'bia.collect',
    description: 'Initiate an inbound payment collection via African mobile money (M-PESA, MoMo) or instant EFT.',
    parameters: {
      amount: 'number (required)',
      currency: 'string [KES, NGN, GHS, ZAR, USDC] (required)',
      customer_phone: 'string (required)',
      payment_rail: 'string (optional)',
      idempotency_key: 'string (required)',
    },
    sampleReturn: {
      status: 'pending_authorization',
      charge_id: 'ch_live_9921_ke',
      stk_push_sent: true,
      expires_in_seconds: 120,
    },
  },
  {
    name: 'bia.disburse',
    description: 'Execute instant cross-border payout to recipient mobile money wallet or commercial bank account.',
    parameters: {
      amount: 'number (required)',
      currency: 'string (required)',
      recipient_phone: 'string (required)',
      corridor: 'string (required)',
      purpose_code: 'string [COMMERCIAL, REMITTANCE, PAYROLL]',
    },
    sampleReturn: {
      status: 'settled',
      disbursement_id: 'disb_8829_gh',
      clearing_rail: 'PAPSS_MINT_INSTANT',
      fee_deducted: '1.4%',
    },
  },
  {
    name: 'bia.aml.screen',
    description: 'Deterministic AML & sanctions compliance screening against OFAC, AU, and local central bank watchlists.',
    parameters: {
      entity_name: 'string (required)',
      phone_number: 'string (optional)',
      transaction_amount_usd: 'number (required)',
      jurisdiction: 'string (required)',
    },
    sampleReturn: {
      screening_verdict: 'CLEAR',
      risk_score: 4,
      watchlist_hits: 0,
      pep_status: false,
    },
  },
  {
    name: 'bia.ledger.balance',
    description: 'Inspect real-time pre-funded float and escrow balances across central bank settlement corridors.',
    parameters: {
      currency: 'string (optional)',
      escrow_type: 'string [CIRCULAR_USDC, FIAT_PREFUNDED, NET_CLEARING]',
    },
    sampleReturn: {
      available_float_usd: 7140000.0,
      reserved_collateral_usd: 6580000.0,
      collateral_ratio: 1.084,
      status: 'ADEQUATE',
    },
  },
];

export const AiTerminal: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'terminal' | 'mcp' | 'rules'>('terminal');
  const [promptText, setPromptText] = useState(samplePrompts[0].text);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<DeepSeekExecutionResult | null>(null);
  const [selectedMcpTool, setSelectedMcpTool] = useState(mcpTools[0].name);

  // DeepSeek Settings State
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<'deepseek-chat' | 'deepseek-reasoner'>('deepseek-chat');
  const [hasLiveKey, setHasLiveKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const key = DeepSeekService.getApiKey();
    setHasLiveKey(Boolean(key));
    setApiKeyInput(key);
    setSelectedModel(DeepSeekService.getModel());
  }, []);

  const handleSaveApiKey = () => {
    DeepSeekService.setApiKey(apiKeyInput);
    DeepSeekService.setModel(selectedModel);
    setHasLiveKey(Boolean(apiKeyInput.trim()));
    setApiKeyModalOpen(false);
    addToast({
      type: 'success',
      message: apiKeyInput.trim()
        ? `DeepSeek API key configured (${selectedModel})`
        : 'DeepSeek API key cleared; running in deterministic sandbox mode',
    });
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key to test.' });
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);
    const test = await DeepSeekService.testConnection(apiKeyInput.trim());
    setIsTestingKey(false);
    setTestResult(test);
  };

  const handleRunEvaluation = async (overrideText?: string) => {
    const query = overrideText || promptText;
    if (!query.trim()) return;

    setIsEvaluating(true);
    setResult(null);

    try {
      const outcome = await DeepSeekService.processPaymentInstruction(query);
      setResult(outcome);
      if (outcome.policyResult.decision === 'APPROVE') {
        addToast({
          type: 'success',
          message: `DeepSeek Brain approved transaction (${outcome.latencyMs}ms). Txn: ${outcome.auditRecord.transactionId}`,
        });
      } else if (outcome.policyResult.decision === 'REJECT') {
        addToast({
          type: 'error',
          message: 'Deterministic Policy Gate triggered: Transaction FAIL-CLOSED.',
        });
      } else {
        addToast({
          type: 'warning',
          message: 'Transaction ESCALATED to human compliance review.',
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        message: err.message || 'Execution error in AI Intent Engine',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const currentTool = mcpTools.find((t) => t.name === selectedMcpTool) || mcpTools[0];

  return (
    <div className="page-shell">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-pretitle">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary-600)', fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              DeepSeek AI Brain · Two-Call Verification Architecture
            </span>
          </div>
          <h1 className="page-title">AI Intent & MCP Agent Terminal</h1>
          <p className="page-subtitle">
            Natural language payment routing powered by <strong>DeepSeek API</strong> ({hasLiveKey ? 'Live Mode' : 'Sandbox Fallback'}), enforced by deterministic fail-closed policy gates.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setApiKeyModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: hasLiveKey ? 'var(--color-success)' : 'var(--color-warning)',
              }}
            />
            {hasLiveKey ? 'DeepSeek Key Active' : 'Set DeepSeek API Key'}
          </button>
          <Tabs
            active={activeTab}
            onChange={(t) => setActiveTab(t as any)}
            style="pill"
            tabs={[
              { id: 'terminal', label: 'NL Agent Terminal' },
              { id: 'mcp', label: 'MCP Protocol Server' },
              { id: 'rules', label: 'Deterministic Gates' },
            ]}
          />
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <MetricCard
          label="AI Engine Brain"
          value={hasLiveKey ? 'DeepSeek Live API' : 'DeepSeek Sandbox'}
          delta={hasLiveKey ? selectedModel : 'Deterministic Fallback Active'}
          deltaType={hasLiveKey ? 'positive' : 'neutral'}
          sparkColor="#635BFF"
          sparkData={[95, 96, 98, 99, 99.5, 100]}
        />
        <MetricCard
          label="Deterministic Safety Gate"
          value="Fail-Closed Enforced"
          delta="No LLM in execution path (PRD §8)"
          deltaType="positive"
          sparkColor="#00A67E"
          sparkData={[100, 100, 100, 100, 100, 100]}
        />
        <MetricCard
          label="Two-Call Verification"
          value="Adversarial Audit"
          delta="Extraction + Verification"
          deltaType="positive"
          sparkColor="#00A67E"
          sparkData={[99, 99, 99.5, 99.8, 100, 100]}
        />
        <MetricCard
          label="MCP Tools Live"
          value="6 Verified Protocols"
          delta="JSON-RPC 2.0 Standard"
          deltaType="neutral"
          sparkData={[6, 6, 6, 6, 6, 6]}
        />
      </div>

      {activeTab === 'terminal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Natural Language Prompt Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">DeepSeek Natural Language Payment Dispatcher</div>
                <div className="card-subtitle">
                  Input payment instructions in plain text. DeepSeek extracts structured parameters and validates them against local deterministic compliance gates.
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* Presets Chips */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                  Sample Pan-African Scenarios:
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {samplePrompts.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => {
                        setPromptText(preset.text);
                        handleRunEvaluation(preset.text);
                      }}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input & Submit */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <textarea
                  className="input"
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="e.g. Send KES 20,000 to +254 700 123 456 via M-PESA for supplier invoice..."
                  style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', lineHeight: 1.5, resize: 'vertical' }}
                />
                <button
                  className="btn btn-primary btn-md"
                  style={{ minWidth: 160, height: 74, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}
                  disabled={isEvaluating || !promptText.trim()}
                  onClick={() => handleRunEvaluation()}
                >
                  {isEvaluating ? (
                    <>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ fontSize: '0.75rem' }}>DeepSeek Reasoning...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      <span>Execute DeepSeek</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* DeepSeek Results Grid */}
          {result && (
            <div className="grid-12" style={{ gap: 24, alignItems: 'start' }}>
              {/* Left Column: Extraction & Two-Call Verification */}
              <div className="col-5">
                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="card-title">Two-Call Verification Audit</div>
                      <div className="card-subtitle">{result.modelUsed} · {result.latencyMs}ms</div>
                    </div>
                    <Badge variant={result.verificationResult.verified ? 'success' : 'warning'} dot>
                      {result.verificationResult.verified ? 'Verified (Call 2 Pass)' : 'Discrepancy Detected'}
                    </Badge>
                  </div>
                  <div className="card-body">
                    {/* Call 1: Extracted JSON */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Call 1: Extracted Intent Slots
                      </div>
                      <pre
                        style={{
                          background: '#0A2540',
                          color: '#00D4B2',
                          padding: 12,
                          borderRadius: 6,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          margin: 0,
                          lineHeight: 1.5,
                          maxHeight: 200,
                          overflowY: 'auto',
                        }}
                      >
                        <code>{JSON.stringify(result.extractedIntent, null, 2)}</code>
                      </pre>
                    </div>

                    {/* Call 2: Adversarial Verification */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Call 2: Adversarial Cross-Check
                      </div>
                      <div style={{ background: 'var(--bg-canvas)', padding: 12, borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Confidence Score:</span>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary-600)' }}>
                            {(result.verificationResult.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Recommendation:</span>
                          <Badge variant={result.verificationResult.recommendation === 'proceed' ? 'success' : 'warning'}>
                            {result.verificationResult.recommendation}
                          </Badge>
                        </div>
                        {result.verificationResult.discrepancies.length > 0 && (
                          <div style={{ marginTop: 8, color: 'var(--color-warning-text)', fontSize: '0.75rem' }}>
                            {result.verificationResult.discrepancies.map((d, i) => (
                              <div key={i}>⚠ {d}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Deterministic Policy Engine & Optimal Routing */}
              <div className="col-7">
                <div
                  className="card"
                  style={{
                    borderTop: `4px solid ${
                      result.policyResult.decision === 'APPROVE'
                        ? 'var(--color-success)'
                        : result.policyResult.decision === 'REJECT'
                        ? 'var(--color-danger)'
                        : 'var(--color-warning)'
                    }`,
                  }}
                >
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="card-title">Deterministic Policy Decision</div>
                      <div className="card-subtitle">Zero-Trust Isolation · No Probabilistic AI in Settlement</div>
                    </div>
                    <Badge
                      variant={
                        result.policyResult.decision === 'APPROVE'
                          ? 'success'
                          : result.policyResult.decision === 'REJECT'
                          ? 'error'
                          : 'warning'
                      }
                      dot
                    >
                      GATE: {result.policyResult.decision}
                    </Badge>
                  </div>
                  <div className="card-body">
                    {/* Reason Box */}
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: 6,
                        marginBottom: 16,
                        background:
                          result.policyResult.decision === 'APPROVE'
                            ? 'rgba(0, 166, 126, 0.08)'
                            : result.policyResult.decision === 'REJECT'
                            ? 'rgba(223, 27, 65, 0.08)'
                            : 'rgba(239, 130, 20, 0.08)',
                        color:
                          result.policyResult.decision === 'APPROVE'
                            ? 'var(--color-success-text)'
                            : result.policyResult.decision === 'REJECT'
                            ? 'var(--color-danger-text)'
                            : 'var(--color-warning-text)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        lineHeight: 1.5,
                      }}
                    >
                      {result.policyResult.primaryReason || 'All deterministic compliance gates passed.'}
                    </div>

                    {/* Rule Evaluation Breakdown */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                        Automated Compliance Rules Checked:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {result.policyResult.ruleEvaluations.map((rule) => (
                          <div
                            key={rule.ruleId}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 10px',
                              background: 'var(--bg-canvas)',
                              borderRadius: 6,
                              fontSize: '0.8125rem',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 600 }}>{rule.ruleName}</span>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{rule.details}</div>
                            </div>
                            <Badge variant={rule.decision === 'APPROVE' ? 'success' : rule.decision === 'REJECT' ? 'error' : 'warning'}>
                              {rule.decision}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Routing Recommendation */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                        Recommended Payment Rail (Weighted 5-Factor Score)
                      </div>
                      <div style={{ background: 'var(--bg-canvas)', padding: 12, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary-600)', fontSize: '0.875rem' }}>
                            {result.routingRecommendation.recommendedRailName}
                          </span>
                          <Badge variant="accent">Top Ranked</Badge>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                          {result.routingRecommendation.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: MCP Protocol Server */}
      {activeTab === 'mcp' && (
        <div className="grid-12" style={{ gap: 24, alignItems: 'start' }}>
          {/* Tool Directory */}
          <div className="col-4">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Registered MCP Tools</div>
                <div className="card-subtitle">Exposed via standard JSON-RPC 2.0</div>
              </div>
              <div className="card-body" style={{ padding: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {mcpTools.map((tool) => (
                    <div
                      key={tool.name}
                      onClick={() => setSelectedMcpTool(tool.name)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        background: selectedMcpTool === tool.name ? 'rgba(99, 91, 255, 0.08)' : 'transparent',
                        border: `1px solid ${selectedMcpTool === tool.name ? 'var(--color-primary-600)' : 'transparent'}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary-600)' }}>
                          {tool.name}
                        </span>
                        <Badge variant="neutral">MCP v1</Badge>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                        {tool.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Schema & Simulated Response */}
          <div className="col-8">
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="card-title" style={{ fontFamily: 'var(--font-mono)' }}>{currentTool.name}</div>
                  <div className="card-subtitle">{currentTool.description}</div>
                </div>
                <CopyBtn text={JSON.stringify(currentTool, null, 2)} label="Copy Tool Schema" />
              </div>
              <div className="card-body">
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                    Input Parameters Schema
                  </div>
                  <div style={{ background: 'var(--bg-canvas)', borderRadius: 8, padding: 12, border: '1px solid var(--border-subtle)' }}>
                    {Object.entries(currentTool.parameters).map(([param, type]) => (
                      <div key={param} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.8125rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{param}</span>
                        <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                    Simulated Tool Return Payload
                  </div>
                  <pre
                    style={{
                      background: '#0A2540',
                      color: '#00D4B2',
                      padding: 16,
                      borderRadius: 8,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      lineHeight: 1.5,
                      margin: 0,
                      overflowX: 'auto',
                    }}
                  >
                    <code>{JSON.stringify(currentTool.sampleReturn, null, 2)}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Deterministic Policy Rules */}
      {activeTab === 'rules' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Deterministic Safety Isolation Matrix</div>
            <div className="card-subtitle">Zero LLM inference in the critical money settlement loop (PRD §8)</div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Constraint Domain</th>
                  <th>Deterministic Logic</th>
                  <th>Action Triggered</th>
                  <th>Enforcement Tier</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>RULE-AML-001</td>
                  <td>Sanctions & Watchlists</td>
                  <td>Match string against OFAC SDN, AU list, or local terrorist asset freezes</td>
                  <td>
                    <Badge variant="error">FAIL-CLOSED (Block & SAR)</Badge>
                  </td>
                  <td>Systemic Hard Stop</td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>RULE-LIMIT-002</td>
                  <td>Tier-2 Payout Limits</td>
                  <td>Amount &gt; $5,000 equivalent without dual-director cryptographic authorization</td>
                  <td>
                    <Badge variant="warning">ESCALATE (4-Eyes Approval)</Badge>
                  </td>
                  <td>Operational Gate</td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>RULE-FLOAT-003</td>
                  <td>Escrow Pre-funding</td>
                  <td>Destination corridor reserve &lt; transaction settlement commitment</td>
                  <td>
                    <Badge variant="error">FAIL-CLOSED (Sweep Required)</Badge>
                  </td>
                  <td>Liquidity Solvency</td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>RULE-VELOCITY-004</td>
                  <td>Account Velocity</td>
                  <td>&gt; 5 transactions to same mobile money MSISDN within 60 seconds</td>
                  <td>
                    <Badge variant="warning">RATE-LIMIT (Backoff 120s)</Badge>
                  </td>
                  <td>Anti-Fraud Circuit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DeepSeek API Key Configuration Modal */}
      {apiKeyModalOpen && (
        <Modal
          title="Configure DeepSeek AI Brain"
          isOpen={apiKeyModalOpen}
          onClose={() => setApiKeyModalOpen(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleTestConnection}
                disabled={isTestingKey}
              >
                {isTestingKey ? 'Pinging DeepSeek...' : 'Test Connection'}
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setApiKeyModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveApiKey}
                >
                  Save Configuration
                </button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600 }}>
                DeepSeek API Key
              </label>
              <input
                type="password"
                className="input"
                placeholder="sk-..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                Stored locally in your browser. Leave blank to run with local deterministic simulator.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600 }}>
                Model Selection
              </label>
              <CustomSelect
                value={selectedModel}
                onChange={(val) => setSelectedModel(val as any)}
                options={[
                  { value: 'deepseek-chat', label: 'deepseek-chat (V3 - Fast & Highly Accurate)' },
                  { value: 'deepseek-reasoner', label: 'deepseek-reasoner (R1 - Deep Chain of Thought)' },
                ]}
              />
            </div>

            {testResult && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: '0.8125rem',
                  background: testResult.success ? 'rgba(0, 166, 126, 0.08)' : 'rgba(223, 27, 65, 0.08)',
                  color: testResult.success ? 'var(--color-success-text)' : 'var(--color-danger-text)',
                  border: `1px solid ${testResult.success ? 'rgba(0, 166, 126, 0.2)' : 'rgba(223, 27, 65, 0.2)'}`,
                }}
              >
                {testResult.message}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
