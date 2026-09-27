import React from 'react';
import type { ActiveSurface } from '../../types';

const surfaceLabels: Record<ActiveSurface, { root: string; current: string }> = {
  merchant:  { root: 'Bia', current: 'Dashboard' },
  developer: { root: 'Bia', current: 'Developer Portal' },
  admin:     { root: 'Bia', current: 'Admin Console' },
  partner:   { root: 'Bia', current: 'Partner Portal' },
  checkout:  { root: 'Bia', current: 'Checkout Widget' },
  ai:        { root: 'Bia', current: 'AI & MCP Terminal' },
};

interface TopBarProps {
  activeSurface: ActiveSurface;
}

export const TopBar: React.FC<TopBarProps> = ({ activeSurface }) => {
  const { root, current } = surfaceLabels[activeSurface];

  return (
    <header className="bia-topbar">
      {/* Breadcrumb */}
      <nav className="topbar-breadcrumb">
        <span className="topbar-breadcrumb-root">{root}</span>
        <span className="topbar-breadcrumb-sep">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="topbar-breadcrumb-current">{current}</span>
      </nav>

      {/* Search */}
      <div className="topbar-search" style={{ marginLeft: 'var(--sp-6)' }}>
        <span className="topbar-search-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
        <input type="text" className="topbar-search-input" placeholder="Search transactions, merchants, docs…" />
      </div>

      {/* Right actions */}
      <div className="topbar-actions">
        {/* Status chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: '#E6F7F3', border: '1px solid rgba(0,166,126,0.2)', borderRadius: 'var(--r-full)', fontSize: '0.78rem', fontWeight: 600, color: '#00A67E' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00A67E', animation: 'statusPulse 2s ease-in-out infinite', display: 'inline-block' }} />
          All systems operational
        </div>

        {/* Docs */}
        <button className="topbar-icon-btn" title="Documentation" onClick={() => window.open('#', '_blank')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
        </button>

        {/* Notifications */}
        <button className="topbar-icon-btn" title="Notifications" style={{ position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: '50%', background: 'var(--red)', border: '2px solid white', fontSize: '0.55rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
        </button>

        {/* Avatar */}
        <div className="topbar-avatar" title="Account">N</div>
      </div>
    </header>
  );
};
