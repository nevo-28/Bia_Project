import React from 'react';
import type { ActiveSurface } from '../../types';

interface SidebarProps {
  activeSurface: ActiveSurface;
  setActiveSurface: (s: ActiveSurface) => void;
  envMode: 'live' | 'sandbox';
  setEnvMode: (m: 'live' | 'sandbox') => void;
}

const navSections = [
  {
    label: 'Business',
    items: [
      { id: 'merchant' as ActiveSurface, label: 'Dashboard', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      )},
      { id: 'partner' as ActiveSurface, label: 'Partner Portal', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )},
      { id: 'checkout' as ActiveSurface, label: 'Checkout Widget', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
        </svg>
      )},
    ],
  },
  {
    label: 'Engineering',
    items: [
      { id: 'developer' as ActiveSurface, label: 'Developer Portal', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      )},
      { id: 'ai' as ActiveSurface, label: 'AI & MCP Terminal', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
      )},
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'admin' as ActiveSurface, label: 'Admin Console', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ), badge: '3' },
    ],
  },
];

const surfaceTitles: Record<ActiveSurface, string> = {
  merchant: 'Dashboard',
  developer: 'Developer Portal',
  admin: 'Admin Console',
  partner: 'Partner Portal',
  checkout: 'Checkout Widget',
  ai: 'AI & MCP Terminal',
};

export const Sidebar: React.FC<SidebarProps> = ({ activeSurface, setActiveSurface, envMode, setEnvMode }) => (
  <aside className="bia-sidebar">
    {/* Logo */}
    <div className="sidebar-logo">
      <div className="sidebar-logo-mark">B</div>
      <div>
        <div className="sidebar-logo-text">Bia</div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1 }}>Pan-African Payments</div>
      </div>
    </div>

    {/* Env toggle */}
    <div style={{ padding: 'var(--sp-3) var(--sp-4) 0' }}>
      <div className="sidebar-env-toggle">
        <button className={`sidebar-env-btn ${envMode === 'live' ? 'active' : ''}`} onClick={() => setEnvMode('live')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {envMode === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00A67E', display: 'inline-block' }} />}
            Live
          </span>
        </button>
        <button className={`sidebar-env-btn ${envMode === 'sandbox' ? 'active' : ''}`} onClick={() => setEnvMode('sandbox')}>Sandbox</button>
      </div>
    </div>

    {/* Navigation */}
    {navSections.map(section => (
      <div key={section.label} className="sidebar-section">
        <div className="sidebar-section-label">{section.label}</div>
        {section.items.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeSurface === item.id ? 'active' : ''}`}
            onClick={() => setActiveSurface(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && activeSurface !== item.id && (
              <span className="sidebar-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </div>
    ))}

    {/* Footer */}
    <div className="sidebar-footer">
      <div className="sidebar-avatar">N</div>
      <div>
        <div className="sidebar-user-name">Nia Kamau</div>
        <div className="sidebar-user-role">Admin · Jumia Kenya</div>
      </div>
      <button
        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
        title="Settings"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
  </aside>
);

export { surfaceTitles };
