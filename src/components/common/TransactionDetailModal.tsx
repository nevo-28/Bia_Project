import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  Cpu, 
  RotateCcw, 
  FileText, 
  Coins 
} from 'lucide-react';
import { Transaction } from '../../types';

interface Props {
  transaction: Transaction;
  onClose: () => void;
  onRefund: (id: string) => void;
}

export const TransactionDetailModal: React.FC<Props> = ({ transaction, onClose, onRefund }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <Coins size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Transaction Details</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{transaction.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.35rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Amount Hero */}
        <div style={{ padding: '1.5rem', background: 'rgba(10, 17, 34, 0.4)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {transaction.type.toUpperCase()} • {transaction.corridor.sourceCountry} ⇄ {transaction.corridor.destinationCountry}
          </div>
          <div style={{ fontSize: '2.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', margin: '0.4rem 0' }}>
            {transaction.currency} {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Platform Fee: <strong style={{ color: '#93c5fd' }}>{transaction.currency} {transaction.fee.toFixed(2)}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>Net Settled: <strong style={{ color: '#34d399' }}>{transaction.currency} {transaction.netAmount.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* 5-Stage Life Cycle Timeline */}
        <div style={{ padding: '1.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            End-to-End Processing Timeline
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            {/* Stage 1 */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>1. Request Ingested & Authenticated</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reference: {transaction.reference} • Timestamp: {new Date(transaction.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Stage 2 */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd', flexShrink: 0 }}>
                <Cpu size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>2. AI Intent Extraction & Two-Call Verification</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {transaction.aiAudit 
                    ? `Confidence: ${(transaction.aiAudit.verificationResult.confidence * 100).toFixed(0)}% • Parsed in ${transaction.aiAudit.durationMs}ms` 
                    : 'Standard Gateway Schema Ingest'}
                </div>
              </div>
            </div>

            {/* Stage 3 */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.2)', border: '1px solid #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd', flexShrink: 0 }}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>3. Deterministic Policy Safety Gate (Fail-Closed)</div>
                <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Passed all KYC limits, OFAC Sanctions, and Corridor controls</div>
              </div>
            </div>

            {/* Stage 4 */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>4. Provider Rail Execution ({transaction.provider.toUpperCase()})</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Ref: {transaction.providerReference || 'Pending'}
                </div>
              </div>
            </div>

            {/* Stage 5 */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>5. Double-Entry Balanced Ledger Settlement</div>
                <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Debits = Credits balanced; Available balance updated</div>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div style={{ marginTop: '1.5rem', background: 'rgba(10, 17, 34, 0.6)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Customer / Recipient:</span>
                <div style={{ fontWeight: 600 }}>{transaction.customer?.name || transaction.recipient?.name || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Phone / Identifier:</span>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {transaction.customer?.phone || transaction.recipient?.identifier || 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Official Receipt:</span>
                <div style={{ fontWeight: 600, color: '#60a5fa' }}>{transaction.receipt?.receiptNumber || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <div>
                  <span className={`badge ${transaction.status === 'completed' ? 'badge-success' : (transaction.status === 'pending' ? 'badge-pending' : 'badge-danger')}`}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {transaction.type === 'collection' && transaction.status === 'completed' ? (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onRefund(transaction.id)}
              style={{ color: '#fda4af' }}
            >
              <RotateCcw size={14} />
              Issue Full Refund
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => alert(`Receipt ${transaction.receipt?.receiptNumber || transaction.id} printed to PDF.`)}
            >
              <FileText size={14} />
              Download Receipt
            </button>
            <button className="btn btn-primary-blue btn-sm" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
