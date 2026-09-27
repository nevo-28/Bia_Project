import React from 'react';
import type { ActiveSurface } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MerchantDashboard } from './components/surfaces/MerchantDashboard';
import { DeveloperPortal } from './components/surfaces/DeveloperPortal';
import { AdminConsole } from './components/surfaces/AdminConsole';
import { PartnerPortal } from './components/surfaces/PartnerPortal';
import { CheckoutWidget } from './components/surfaces/CheckoutWidget';
import { AiTerminal } from './components/surfaces/AiTerminal';
import { ToastProvider } from './components/common/UI';

const surfaceMap: Record<ActiveSurface, React.FC> = {
  merchant: MerchantDashboard,
  developer: DeveloperPortal,
  admin: AdminConsole,
  partner: PartnerPortal,
  checkout: CheckoutWidget,
  ai: AiTerminal,
};

const App: React.FC = () => {
  const [activeSurface, setActiveSurface] = React.useState<ActiveSurface>('merchant');
  const [envMode, setEnvMode] = React.useState<'live' | 'sandbox'>('live');

  const Surface = surfaceMap[activeSurface];

  return (
    <ToastProvider>
      <div className="bia-shell">
        <Sidebar
          activeSurface={activeSurface}
          setActiveSurface={setActiveSurface}
          envMode={envMode}
          setEnvMode={setEnvMode}
        />
        <div className="bia-main">
          <TopBar activeSurface={activeSurface} />
          <div style={{ minHeight: 'calc(100vh - 64px)' }}>
            <Surface key={activeSurface} />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
};

export default App;
