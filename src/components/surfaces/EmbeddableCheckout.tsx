import React, { useState } from 'react';
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  Coins, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Copy, 
  Check, 
  QrCode,
  Sparkles
} from 'lucide-react';
import { biaGateway } from '../../services/engine/gateway';
import { ProviderId } from '../../types';

export const EmbeddableCheckout: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<'mpesa' | 'momo' | 'card' | 'bank' | 'stablecoin'>('mpesa');
  const [amount, setAmount] = useState<number>(3500);
  const [currency, setCurrency] = useState<'KES' | 'NGN' | 'GHS' | 'USD'>('KES');
  const [phoneNumber, setPhoneNumber] = useState('+254712345678');
  const [momoNumber, setMomoNumber] = useState('+233241234567');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('892');
  const [selectedNetwork, setSelectedNetwork] = useState<'Solana' | 'Polygon' | 'Ethereum'>('Solana');

  // Interactive phone STK push simulator
  const [simulatingStk, setSimulatingStk] = useState(false);
  const [stkSuccess, setStkSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (selectedMethod === 'mpesa') {
      setSimulatingStk(true);
      setTimeout(async () => {
        setStkSuccess(true);
        // Execute against gateway
        await biaGateway.collect({
          amount,
          currency,
          paymentMethod: {
            type: 'mobile_money',
            provider: 'mpesa',
            phoneNumber
          },
          reference: `CHECKOUT-${Date.now().toString().slice(-6)}`,
          description: 'Payment via Bia Embeddable Checkout',
          customer: {
            id: 'cust_checkout_user',
            name: 'Wanjiku Mwangi',
            phone: phoneNumber,
            kycTier: 'tier_2'
          }
        });
        setIsProcessing(false);
      }, 2500);
    } else {
      setTimeout(async () => {
        setStkSuccess(true);
        let provider: ProviderId = 'pawapay';
        if (selectedMethod === 'card') provider = 'paystack';
        else if (selectedMethod === 'stablecoin') provider = 'stablecoin_solana';
        else if (selectedMethod === 'bank') provider = 'bank_nip';

        await biaGateway.collect({
          amount,
          currency: selectedMethod === 'stablecoin' ? 'USD' : currency,
          paymentMethod: {
            type: selectedMethod === 'stablecoin' ? 'stablecoin' : 'card',
            provider
          },
          reference: `CHECKOUT-${Date.now().toString().slice(-6)}`,
          description: `Paid via ${selectedMethod.toUpperCase()} rail`,
          customer: {
            id: 'cust_checkout_02',
            name: 'Kofi Mensah',
            phone: momoNumber,
            kycTier: 'tier_2'
          }
        });
        setIsProcessing(false);
      }, 1500);
    }
  };

  const resetCheckout = () => {
    setSimulatingStk(false);
    setStkSuccess(false);
    setIsProcessing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Embeddable Checkout Experience</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Production drop-in checkout modal supporting M-PESA STK Push, MTN MoMo, Cards, Bank Virtual Accounts, and Stablecoins.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* The Checkout Widget Container */}
        <div 
          className="fintech-card glow-blue" 
          style={{ 
            padding: 0, 
            background: 'var(--bg-card)', 
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(139,92,246,0.15) 100%)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pan-African Checkout
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                Merchant: AfroMarketplace Ltd
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</div>
              <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#34d399' }}>
                {currency} {amount.toLocaleString()}
              </div>
            </div>
          </div>

          {!stkSuccess ? (
            <form onSubmit={handlePay} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Payment Method Selector Tabs */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Select Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className={`surface-tab ${selectedMethod === 'mpesa' ? 'active' : ''}`}
                    style={{ flexDirection: 'column', padding: '0.6rem 0.2rem', textAlign: 'center', justifyContent: 'center' }}
                    onClick={() => { setSelectedMethod('mpesa'); setCurrency('KES'); }}
                  >
                    <Smartphone size={18} />
                    <span style={{ fontSize: '0.72rem' }}>M-PESA</span>
                  </button>

                  <button
                    type="button"
                    className={`surface-tab ${selectedMethod === 'momo' ? 'active' : ''}`}
                    style={{ flexDirection: 'column', padding: '0.6rem 0.2rem', textAlign: 'center', justifyContent: 'center' }}
                    onClick={() => { setSelectedMethod('momo'); setCurrency('GHS'); }}
                  >
                    <Smartphone size={18} />
                    <span style={{ fontSize: '0.72rem' }}>MTN MoMo</span>
                  </button>

                  <button
                    type="button"
                    className={`surface-tab ${selectedMethod === 'card' ? 'active' : ''}`}
                    style={{ flexDirection: 'column', padding: '0.6rem 0.2rem', textAlign: 'center', justifyContent: 'center' }}
                    onClick={() => setSelectedMethod('card')}
                  >
                    <CreditCard size={18} />
                    <span style={{ fontSize: '0.72rem' }}>Card</span>
                  </button>

                  <button
                    type="button"
                    className={`surface-tab ${selectedMethod === 'stablecoin' ? 'active' : ''}`}
                    style={{ flexDirection: 'column', padding: '0.6rem 0.2rem', textAlign: 'center', justifyContent: 'center' }}
                    onClick={() => setSelectedMethod('stablecoin')}
                  >
                    <Coins size={18} />
                    <span style={{ fontSize: '0.72rem' }}>USDC</span>
                  </button>
                </div>
              </div>

              {/* Method 1: M-PESA */}
              {selectedMethod === 'mpesa' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">M-PESA Registered Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="+254712345678"
                      required
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    An STK push PIN prompt will appear on this phone instantly.
                  </div>
                </div>
              )}

              {/* Method 2: MTN MoMo */}
              {selectedMethod === 'momo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">MTN Mobile Money Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={momoNumber}
                      onChange={e => setMomoNumber(e.target.value)}
                      placeholder="+233241234567"
                      required
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Authorize the debit prompt sent to your MTN phone.
                  </div>
                </div>
              )}

              {/* Method 3: Card */}
              {selectedMethod === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Expiry</label>
                      <input type="text" className="form-input" value={expiry} onChange={e => setExpiry(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input type="password" className="form-input" value={cvv} onChange={e => setCvv(e.target.value)} maxLength={4} required />
                    </div>
                  </div>
                </div>
              )}

              {/* Method 4: Stablecoin USDC */}
              {selectedMethod === 'stablecoin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Select Settlement Network</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(['Solana', 'Polygon', 'Ethereum'] as const).map(net => (
                        <button
                          key={net}
                          type="button"
                          className={`btn btn-sm ${selectedNetwork === net ? 'btn-primary-purple' : 'btn-secondary'}`}
                          style={{ flex: 1 }}
                          onClick={() => setSelectedNetwork(net)}
                        >
                          {net}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(7, 11, 20, 0.6)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ width: '120px', height: '120px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <QrCode size={100} color="#000000" />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Treasury Deposit Address:</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#c4b5fd', wordBreak: 'break-all' }}>
                      {selectedNetwork === 'Solana' ? 'Bia7Sol...918xUSDCDeposit' : '0x71bE...941aBiaPolygon'}
                    </div>
                  </div>
                </div>
              )}

              {/* Security info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Lock size={14} style={{ color: '#34d399' }} />
                <span>PCI-DSS 4.0 Level 1 Encrypted • Settled via Bia Rails</span>
              </div>

              {/* Submit Pay Button */}
              <button 
                type="submit" 
                className="btn btn-primary-green"
                disabled={isProcessing}
                style={{ padding: '0.85rem' }}
              >
                {isProcessing ? 'Waiting for PIN on phone...' : `Pay ${currency} ${amount.toLocaleString()}`}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.4rem' }}>Payment Successful!</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Your payment of <strong>{currency} {amount.toLocaleString()}</strong> has been settled via {selectedMethod.toUpperCase()} and recorded on the double-entry ledger.
              </p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#60a5fa', background: 'rgba(7, 11, 20, 0.6)', padding: '0.5rem 1rem', borderRadius: '6px' }}>
                Receipt: QWE{Math.floor(Math.random() * 899999 + 100000)} • 2026-09-27
              </div>
              <button className="btn btn-secondary btn-sm" onClick={resetCheckout}>
                Test Another Payment
              </button>
            </div>
          )}
        </div>

        {/* Live Phone STK Push Notification Simulator */}
        <div className="fintech-card" style={{ background: 'rgba(10, 17, 34, 0.6)' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smartphone size={18} style={{ color: '#60a5fa' }} />
            Customer Mobile Phone Simulation
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            In live production, Safaricom Daraja and MTN MoMo push a native SIM prompt directly to the customer's device.
          </p>

          <div style={{ maxWidth: '300px', margin: '0 auto', background: '#000000', borderRadius: '28px', border: '4px solid #1e293b', padding: '1.25rem 1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}>
            <div style={{ width: '60px', height: '4px', background: '#334155', borderRadius: '2px', margin: '0 auto 1.25rem auto' }} />

            {simulatingStk ? (
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1rem', border: '1px solid #334155', animation: 'pulse-glow 1.5s infinite' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  SIM TOOLKIT PROMPT
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                  Do you want to pay KES {amount} to AfroMarketplace Ltd?
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  Enter M-PESA PIN: ••••
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>Sending PIN...</span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '2.5rem 0' }}>
                Phone idle. Click "Pay" in checkout to trigger simulated STK push prompt.
              </div>
            )}

            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #334155', margin: '1.5rem auto 0 auto' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
