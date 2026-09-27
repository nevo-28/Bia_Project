import React from 'react';
import { 
  Layers, 
  Code2, 
  ShieldAlert, 
  Building2, 
  CreditCard, 
  Bot, 
  Activity, 
  Terminal,
  Zap,
  Globe2
} from 'lucide-react';

export type SurfaceType = 
  | 'merchant' 
  | 'developer' 
  | 'admin' 
  | 'partner' 
  | 'checkout' 
  | 'ai_agent';

interface HeaderProps {
  currentSurface: SurfaceType;
  onSelectSurface: (surface: SurfaceType) => void;
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
  rateLimitInfo: { limit: number; remaining: number };
}

export const Header: React.FC<HeaderProps> = ({
  currentSurface,
  onSelectSurface,
  isLiveMode,
  onToggleLiveMode,
  rateLimitInfo
}) => {
  return (
    <header className="top-header">
      <div className="brand-section">
        <div className="logo-badge">
          <div className="logo-icon">
            <Zap size={20} />
          </div>
          <div>
            <div className="brand-title">
              BIA
              <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#93c5fd' }}>
                v2.0 PROD
              </span>
            </div>
            <div className="brand-subtitle">Pan-African Payment Infrastructure</div>
          </div>
        </div>
      </div>

      <nav className="surface-nav">
        <button
          className={`surface-tab ${currentSurface === 'merchant' ? 'active' : ''}`}
          onClick={() => onSelectSurface('merchant')}
          title="Merchant Dashboard for business operators"
        >
          <Layers size={16} />
          <span>Merchant Dashboard</span>
        </button>

        <button
          className={`surface-tab ${currentSurface === 'developer' ? 'active' : ''}`}
          onClick={() => onSelectSurface('developer')}
          title="Developer Portal, Interactive API Explorer, Webhook Tester"
        >
          <Code2 size={16} />
          <span>Developer Portal</span>
        </button>

        <button
          className={`surface-tab ${currentSurface === 'admin' ? 'active' : ''}`}
          onClick={() => onSelectSurface('admin')}
          title="Admin & Ops: Circuit Breakers, Double-Entry Ledger, Liquidity, AML"
        >
          <ShieldAlert size={16} />
          <span>Admin & Ops Console</span>
        </button>

        <button
          className={`surface-tab ${currentSurface === 'partner' ? 'active' : ''}`}
          onClick={() => onSelectSurface('partner')}
          title="Partner Portal: B2B Onboarding, KYB & PAPSS Settlements"
        >
          <Building2 size={16} />
          <span>Partner Portal</span>
        </button>

        <button
          className={`surface-tab ${currentSurface === 'checkout' ? 'active' : ''}`}
          onClick={() => onSelectSurface('checkout')}
          title="Embeddable Checkout Widget with STK Push & Stablecoins"
        >
          <CreditCard size={16} />
          <span>Checkout Widget</span>
        </button>

        <button
          className={`surface-tab ${currentSurface === 'ai_agent' ? 'active' : ''}`}
          onClick={() => onSelectSurface('ai_agent')}
          title="AI Intent Terminal & MCP Protocol Inspector"
        >
          <Bot size={16} style={{ color: '#c084fc' }} />
          <span style={{ color: '#e9d5ff', fontWeight: 600 }}>AI Intent & MCP</span>
        </button>
      </nav>

      <div className="header-actions">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.72rem', color: '#94a3b8' }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>API Rate Limit: {rateLimitInfo.remaining}/{rateLimitInfo.limit}</span>
          <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Activity size={10} /> 99.95% SLA
          </span>
        </div>

        <button 
          onClick={onToggleLiveMode}
          className="env-badge"
          style={{
            cursor: 'pointer',
            background: isLiveMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            borderColor: isLiveMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
            color: isLiveMode ? '#34d399' : '#fbbf24'
          }}
        >
          <span 
            className="env-dot" 
            style={{ 
              background: isLiveMode ? '#10b981' : '#f59e0b',
              boxShadow: isLiveMode ? '0 0 8px #10b981' : '0 0 8px #f59e0b' 
            }} 
          />
          {isLiveMode ? 'Production' : 'Sandbox'}
        </button>
      </div>
    </header>
  );
};
