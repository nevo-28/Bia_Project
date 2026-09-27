import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  ArrowRight, 
  Layers, 
  Play, 
  Code2,
  XCircle,
  Clock
} from 'lucide-react';
import { biaGateway } from '../../services/engine/gateway';
import { mcpServer } from '../../services/engine/mcpServer';
import { AiDecisionAudit, McpToolDefinition } from '../../types';

export const AiAgentTerminal: React.FC = () => {
  const [promptInput, setPromptInput] = useState(
    'Send $500 to my sister in Ghana via MTN MoMo. Her number is +233241234567. I have verified KYC.'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<AiDecisionAudit | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // MCP Tab
  const [activeTab, setActiveTab] = useState<'terminal' | 'mcp'>('terminal');
  const [selectedMcpTool, setSelectedMcpTool] = useState<string>('get_fee_estimate');
  const [mcpArgsText, setMcpArgsText] = useState(JSON.stringify({
    amount: 500,
    currency: 'USD',
    destinationCountry: 'GH'
  }, null, 2));
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [isMcpRunning, setIsMcpRunning] = useState(false);

  const samplePrompts = [
    {
      label: 'Cross-Border Payout (Ghana MTN MoMo)',
      prompt: 'Send $500 to my sister in Ghana via MTN MoMo. Her number is +233241234567. I have verified KYC.'
    },
    {
      label: 'Local Collection (Kenya M-PESA)',
      prompt: 'Collect 12,500 KES from Wangari Kamau at +254712345678 for invoice INV-NBO-991.'
    },
    {
      label: 'High-Value Nigeria Transfer',
      prompt: 'Transfer $2,500 USD to Chukwuma Obi in Nigeria for supply chain clearance.'
    },
    {
      label: 'Fail-Closed Sanctions Test (Watchlist)',
      prompt: 'Send $15,000 to Viktor Bout in Sudan conflict zone.'
    }
  ];

  const handleRunAiPipeline = async () => {
    if (!promptInput.trim()) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await biaGateway.processAiPrompt(promptInput);
      setCurrentAudit(result.audit);
      if (result.error) {
        setErrorMessage(result.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Execution error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunMcpTool = async () => {
    setIsMcpRunning(true);
    try {
      const parsedArgs = JSON.parse(mcpArgsText);
      const res = await mcpServer.executeTool(selectedMcpTool, parsedArgs, biaGateway);
      setMcpResult(res);
    } catch (err: any) {
      setMcpResult({ error: err.message });
    } finally {
      setIsMcpRunning(false);
    }
  };

  const mcpTools = mcpServer.getAvailableTools();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bot size={28} style={{ color: '#c084fc' }} />
            AI Intent & MCP Agent Terminal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Two-Call AI verification architecture, deterministic fail-closed safety gate, and Model Context Protocol (MCP) server.
          </p>
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '3px' }}>
          <button
            className={`btn btn-sm ${activeTab === 'terminal' ? 'btn-primary-purple' : 'btn-secondary'}`}
            style={{ border: 'none' }}
            onClick={() => setActiveTab('terminal')}
          >
            <Sparkles size={14} /> Natural Language Terminal
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'mcp' ? 'btn-primary-blue' : 'btn-secondary'}`}
            style={{ border: 'none' }}
            onClick={() => setActiveTab('mcp')}
          >
            <Code2 size={14} /> MCP Server Protocol
          </button>
        </div>
      </div>

      {activeTab === 'terminal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Prompt Input Card */}
          <div className="fintech-card glow-purple">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} style={{ color: '#c084fc' }} />
              Natural Language Payment Prompt
            </h3>

            {/* Quick Samples Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                  onClick={() => setPromptInput(s.prompt)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                placeholder="e.g. Send $500 to my sister in Ghana via MTN MoMo +233241234567"
                style={{ flex: 1, padding: '0.8rem 1rem' }}
              />
              <button
                className="btn btn-primary-purple"
                onClick={handleRunAiPipeline}
                disabled={isProcessing}
                style={{ padding: '0.8rem 1.4rem' }}
              >
                {isProcessing ? 'Processing Pipeline...' : 'Process Payment'}
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Error Banner if any */}
          {errorMessage && (
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '8px', color: '#fda4af', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={20} />
              <div>
                <strong>Policy Gate Blocked:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* Visual Two-Call AI Pipeline Display */}
          {currentAudit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Audit Trail & Decision Execution Breakdown
                </h3>
                <span className="badge badge-purple">
                  Pipeline Latency: {currentAudit.durationMs}ms
                </span>
              </div>

              <div className="grid-2">
                {/* Step 1: Extracted Intent */}
                <div className="fintech-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <Cpu size={16} style={{ color: '#60a5fa' }} />
                      Step 1: AI Intent Extraction
                    </div>
                    <span className="badge badge-info">JSON Extracted</span>
                  </div>
                  <pre className="code-block" style={{ fontSize: '0.78rem', minHeight: '160px' }}>
                    {JSON.stringify(currentAudit.extractedIntent, null, 2)}
                  </pre>
                </div>

                {/* Step 2: Intent Verification (Call 2) */}
                <div className="fintech-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} style={{ color: '#34d399' }} />
                      Step 2: Intent Verification (Call 2)
                    </div>
                    <span className={`badge ${currentAudit.verificationResult.verified ? 'badge-success' : 'badge-danger'}`}>
                      Confidence: {(currentAudit.verificationResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <pre className="code-block" style={{ fontSize: '0.78rem', minHeight: '160px' }}>
                    {JSON.stringify(currentAudit.verificationResult, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Step 3: Deterministic Policy Gate (No LLM) */}
              <div className="fintech-card" style={{ borderLeft: currentAudit.policyValidation.decision === 'APPROVE' ? '4px solid #10b981' : '4px solid #f43f5e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldCheck size={20} style={{ color: currentAudit.policyValidation.decision === 'APPROVE' ? '#34d399' : '#f43f5e' }} />
                    <h4 style={{ fontSize: '1rem' }}>Step 3: Deterministic Policy Safety Gate (IMF Recommended / Fail-Closed)</h4>
                  </div>
                  <span className={`badge ${currentAudit.policyValidation.decision === 'APPROVE' ? 'badge-success' : 'badge-danger'}`}>
                    Decision: {currentAudit.policyValidation.decision}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {currentAudit.policyValidation.ruleEvaluations.map((rule, idx) => (
                    <div key={idx} style={{ padding: '0.65rem 0.85rem', background: 'rgba(7, 11, 20, 0.5)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{rule.ruleName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rule.details}</div>
                      </div>
                      <span className={`badge ${rule.passed ? 'badge-success' : 'badge-danger'}`}>
                        {rule.passed ? 'PASSED' : 'BLOCKED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4: AI Routing Recommender */}
              <div className="fintech-card glow-green">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <Sparkles size={18} style={{ color: '#34d399' }} />
                    Step 4: AI Route Optimization & Settlement
                  </div>
                  <span className="badge badge-success">
                    Selected: {currentAudit.finalRailExecuted.toUpperCase()}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {currentAudit.routingRecommendation.reasoning}
                </p>

                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', color: '#34d399', fontSize: '0.82rem', fontWeight: 600 }}>
                  Cost Efficiency: {currentAudit.routingRecommendation.savingsEstimateVsDirect}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MCP Protocol Tool Inspector Tab */}
      {activeTab === 'mcp' && (
        <div className="grid-2">
          {/* Tool Selector & Arguments */}
          <div className="fintech-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Model Context Protocol (MCP) Tools</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Exposing Bia payment tools to external AI agents (Claude, Cursor, ChatGPT) via standardized JSON-RPC tools.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Select Tool</label>
              <select 
                className="form-select" 
                value={selectedMcpTool} 
                onChange={e => {
                  setSelectedMcpTool(e.target.value);
                  if (e.target.value === 'initiate_payment') {
                    setMcpArgsText(JSON.stringify({ amount: 100, currency: 'USD', recipientIdentifier: '+233241234567', recipientCountry: 'GH' }, null, 2));
                  } else if (e.target.value === 'get_exchange_rate') {
                    setMcpArgsText(JSON.stringify({ from: 'USD', to: 'KES' }, null, 2));
                  } else if (e.target.value === 'validate_recipient') {
                    setMcpArgsText(JSON.stringify({ phoneNumber: '+254712345678', provider: 'mpesa' }, null, 2));
                  } else {
                    setMcpArgsText(JSON.stringify({ amount: 500, currency: 'USD', destinationCountry: 'GH' }, null, 2));
                  }
                }}
              >
                {mcpTools.map(t => (
                  <option key={t.name} value={t.name}>{t.name} — {t.description}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tool Input Parameters (JSON)</label>
              <textarea
                value={mcpArgsText}
                onChange={e => setMcpArgsText(e.target.value)}
                rows={8}
                className="code-block"
                style={{ width: '100%', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button 
              className="btn btn-primary-blue"
              onClick={handleRunMcpTool}
              disabled={isMcpRunning}
            >
              <Play size={16} /> Execute MCP Tool Call
            </button>
          </div>

          {/* MCP Output */}
          <div className="fintech-card" style={{ background: '#070b14' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                MCP Protocol Result
              </span>
              <span className="badge badge-purple">JSON-RPC 2.0</span>
            </div>

            {mcpResult ? (
              <pre className="code-block" style={{ minHeight: '300px' }}>
                {JSON.stringify(mcpResult, null, 2)}
              </pre>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '4rem 0' }}>
                Select an MCP tool and click "Execute" to run.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
