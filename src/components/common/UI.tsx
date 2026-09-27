import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';

/* =========================================================
   BADGE
   ========================================================= */
export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'accent' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', dot = false, children, className = '', style }) => (
  <span className={`badge badge-${variant} ${className}`} style={style}>
    {dot && <span className="badge-dot" />}
    {children}
  </span>
);

/* =========================================================
   SECTION HEADER
   ========================================================= */
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
    <div>
      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{subtitle}</div>}
    </div>
    {actions && <div>{actions}</div>}
  </div>
);

/* =========================================================
   CUSTOM SELECT
   ========================================================= */
export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  meta?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = 'Select...', disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (disabled) return (
    <div className="custom-select-trigger" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
      <span className="custom-select-value">{selected ? selected.label : <span className="custom-select-placeholder">{placeholder}</span>}</span>
    </div>
  );

  return (
    <div className="custom-select" ref={ref}>
      <button type="button" className={`custom-select-trigger ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className="custom-select-value">
          {selected ? (
            <>
              {selected.icon && <span>{selected.icon}</span>}
              {selected.label}
            </>
          ) : <span className="custom-select-placeholder">{placeholder}</span>}
        </span>
        <svg className={`custom-select-chevron ${open ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none">
          <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="custom-select-dropdown">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`custom-select-option ${opt.value === value ? 'active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.icon && <span className="custom-select-option-icon">{opt.icon}</span>}
              <span>{opt.label}</span>
              {opt.meta && <span className="custom-select-option-meta">{opt.meta}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   MODAL
   ========================================================= */
interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}

export const Modal: React.FC<ModalProps> = ({ open, isOpen, onClose, title, children, footer, maxWidth = 520 }) => {
  const isVisible = open ?? isOpen ?? false;

  useEffect(() => {
    if (!isVisible) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

/* =========================================================
   TOAST
   ========================================================= */
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastCtx = createContext<ToastContextType>({ addToast: () => {} });
export const useToast = () => useContext(ToastCtx);

const ToastIcons: Record<Toast['type'], React.ReactNode> = {
  success: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#00A67E' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  error:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#DF1B41' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  info:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#0570DE' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  warning: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#DB7D12' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.75"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastCtx.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{ToastIcons[t.type]}</span>
            <div className="toast-content">
              {t.title && <div className="toast-title">{t.title}</div>}
              <div className="toast-message">{t.message}</div>
            </div>
            <button className="toast-close" onClick={() => remove(t.id)} aria-label="Dismiss">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

/* =========================================================
   SPARKLINE SVG
   ========================================================= */
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  showFill?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color = '#635BFF', height = 40, showFill = true }) => {
  if (!data.length) return null;
  const w = 100; const h = height;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / range) * (h - 6) - 3 }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillPath = `${path} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      {showFill && <path d={fillPath} fill={color} opacity="0.1" />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

/* =========================================================
   METRIC CARD
   ========================================================= */
interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaDir?: 'up' | 'down';
  deltaSub?: string;
  sparkData?: number[];
  sparkColor?: string;
  iconBg?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, delta, deltaDir = 'up', deltaSub, sparkData, sparkColor = '#635BFF', iconBg, icon }) => (
  <div className="metric-card">
    <div className="metric-card-header">
      <span className="metric-card-label">{label}</span>
      {icon && <div className="metric-card-icon" style={{ background: iconBg || '#EEF0FF' }}>{icon}</div>}
    </div>
    <div className="metric-card-value">{value}</div>
    {delta && (
      <div className={`metric-card-delta ${deltaDir}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          {deltaDir === 'up'
            ? <polyline points="18 15 12 9 6 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            : <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          }
        </svg>
        {delta}
        {deltaSub && <span className="metric-card-delta-sub">{deltaSub}</span>}
      </div>
    )}
    {sparkData && sparkData.length > 0 && (
      <div className="metric-card-sparkline">
        <Sparkline data={sparkData} color={sparkColor} height={40} />
      </div>
    )}
  </div>
);

/* =========================================================
   STATUS DOT
   ========================================================= */
type DotColor = 'green' | 'red' | 'amber' | 'blue' | 'grey';
interface StatusDotProps { color: DotColor; pulse?: boolean; }
export const StatusDot: React.FC<StatusDotProps> = ({ color, pulse }) => (
  <span className={`status-dot ${color} ${pulse ? 'pulse' : ''}`} />
);

/* =========================================================
   PROGRESS BAR
   ========================================================= */
interface ProgressBarProps { value: number; max?: number; color?: 'green' | 'amber' | 'red' | 'accent'; }
export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, color }) => {
  const pct = Math.min(100, (value / max) * 100);
  const auto = pct < 50 ? 'green' : pct < 80 ? 'amber' : 'red';
  return (
    <div className="progress-track">
      <div className={`progress-fill ${color || auto}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

/* =========================================================
   COPY BUTTON (for code snippets)
   ========================================================= */
interface CopyBtnProps { text: string; label?: string; }
export const CopyBtn: React.FC<CopyBtnProps> = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="btn btn-ghost btn-xs" onClick={copy} style={{ gap: 4 }}>
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: '#00A67E' }}>
          <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.75"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.75"/>
        </svg>
      )}
      {copied ? 'Copied!' : label}
    </button>
  );
};

/* =========================================================
   TABS (underline style)
   ========================================================= */
interface TabDef { id: string; label: string; icon?: React.ReactNode; count?: number; }
interface TabsProps { tabs: TabDef[]; active: string; onChange: (id: string) => void; style?: 'underline' | 'pill'; }

export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange, style = 'underline' }) => {
  if (style === 'pill') return (
    <div className="tabs-pill-bar">
      {tabs.map(t => (
        <div key={t.id} className={`tab-pill ${t.id === active ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          {t.icon}{t.label}
          {t.count !== undefined && <Badge variant={t.id === active ? 'accent' : 'neutral'} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{t.count}</Badge>}
        </div>
      ))}
    </div>
  );
  return (
    <div className="tabs-bar">
      {tabs.map(t => (
        <div key={t.id} className={`tab-item ${t.id === active ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          {t.icon}{t.label}
          {t.count !== undefined && <Badge variant={t.id === active ? 'accent' : 'neutral'} style={{ fontSize: '0.65rem', padding: '1px 5px', marginLeft: 4 }}>{t.count}</Badge>}
        </div>
      ))}
    </div>
  );
};

/* =========================================================
   TIMELINE ITEM
   ========================================================= */
interface TimelineItemProps {
  status: 'done' | 'active' | 'pending' | 'error';
  title: string;
  subtitle?: string;
  meta?: string;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ status, title, subtitle, meta, isLast }) => {
  const iconMap = {
    done:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    error:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>,
    active:  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />,
    pending: null,
  };

  return (
    <div className="timeline-item">
      <div className="timeline-left">
        <div className={`timeline-dot ${status}`}>{iconMap[status]}</div>
        {!isLast && <div className={`timeline-connector ${status === 'done' ? 'done' : ''}`} />}
      </div>
      <div className="timeline-content">
        <div className="timeline-title">{title}</div>
        {subtitle && <div className="timeline-subtitle">{subtitle}</div>}
        {meta && <div className="timeline-meta">{meta}</div>}
      </div>
    </div>
  );
};

/* =========================================================
   STEP WIZARD
   ========================================================= */
interface StepWizardProps { steps: string[]; current: number; }
export const StepWizard: React.FC<StepWizardProps> = ({ steps, current }) => (
  <div className="step-wizard">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <div className="step-item">
          <div className={`step-circle ${i < current ? 'completed' : i === current ? 'active' : ''}`}>
            {i < current
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : i + 1}
          </div>
          <span className={`step-label ${i < current ? 'completed' : i === current ? 'active' : ''}`}>{s}</span>
        </div>
        {i < steps.length - 1 && <div className={`step-connector ${i < current ? 'done' : ''}`} />}
      </React.Fragment>
    ))}
  </div>
);
