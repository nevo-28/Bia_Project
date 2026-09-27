import React, { useState } from 'react';
import { Badge, CustomSelect, useToast, CopyBtn, Tabs } from '../common/UI';

interface PaymentMethod {
  id: string;
  name: string;
  category: 'mobile_money' | 'bank' | 'card' | 'crypto';
  country: string;
  badge: string;
  iconSvg: React.ReactNode;
  speed: string;
  fee: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'mpesa',
    name: 'Safaricom M-PESA',
    category: 'mobile_money',
    country: 'Kenya 🇰🇪',
    badge: 'Instant STK Push',
    speed: '~1.8s',
    fee: '1.2%',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#00A651"/>
        <path d="M7 12h10M12 7v10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    category: 'mobile_money',
    country: 'Ghana 🇬🇭 / Uganda 🇺🇬',
    badge: 'Push USSD',
    speed: '~2.2s',
    fee: '1.4%',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#FFCC00"/>
        <circle cx="12" cy="12" r="5" fill="#000"/>
      </svg>
    ),
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    category: 'mobile_money',
    country: 'Pan-African 🌍',
    badge: 'Direct Debit',
    speed: '~2.5s',
    fee: '1.3%',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#ED1C24"/>
        <path d="M8 8h8v8H8z" fill="#fff"/>
      </svg>
    ),
  },
  {
    id: 'moniepoint',
    name: 'Moniepoint Instant Bank Transfer',
    category: 'bank',
    country: 'Nigeria 🇳🇬',
    badge: 'NIP Virtual Account',
    speed: '~1.4s',
    fee: '1.0%',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#003399"/>
        <path d="M12 6L6 11v7h12v-7l-6-5z" fill="#fff"/>
      </svg>
    ),
  },
  {
    id: 'card',
    name: 'Cards (Visa, Mastercard, Verve)',
    category: 'card',
    country: 'Global 🌐',
    badge: '3D Secure 2.2',
    speed: '~2.0s',
    fee: '2.5% + $0.20',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#1A1F71"/>
        <circle cx="9" cy="12" r="4" fill="#EB001B"/>
        <circle cx="15" cy="12" r="4" fill="#F79E1B" fillOpacity="0.8"/>
      </svg>
    ),
  },
  {
    id: 'circle_usdc',
    name: 'USDC (Solana / Polygon / Base)',
    category: 'crypto',
    country: 'Decentralized 🔵',
    badge: 'Zero Slippage',
    speed: '~0.8s',
    fee: '0.3%',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#2775CA"/>
        <circle cx="12" cy="12" r="6" stroke="#fff" strokeWidth="2"/>
        <path d="M12 9v6M10 10.5h3.5a1 1 0 0 1 0 2H10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const currencies = [
  { value: 'KES', label: 'Kenya Shillings (KES)', symbol: 'KES', rate: 129.5 },
  { value: 'NGN', label: 'Nigerian Naira (NGN)', symbol: '₦', rate: 1540.0 },
  { value: 'GHS', label: 'Ghanaian Cedi (GHS)', symbol: 'GH₵', rate: 15.6 },
  { value: 'ZAR', label: 'South African Rand (ZAR)', symbol: 'R', rate: 17.8 },
  { value: 'USD', label: 'USD / USDC', symbol: '$', rate: 1.0 },
];

export const CheckoutWidget: React.FC = () => {
  const { addToast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState('KES');
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [phone, setPhone] = useState('+254 712 345 678');
  const [email, setEmail] = useState('customer@enterprise.africa');
  const [payerName, setPayerName] = useState('Amina Mwangi');
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('412');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastTxId, setLastTxId] = useState('');
  const [embedTab, setEmbedTab] = useState<'react' | 'html' | 'curl'>('react');

  const curr = currencies.find((c) => c.value === selectedCurrency) || currencies[0];
  const baseUsd = 45.0;
  const rawAmount = (baseUsd * curr.rate).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const methodObj = paymentMethods.find((m) => m.id === selectedMethod) || paymentMethods[0];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentSuccess(false);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      const tx = `bia_ch_${Math.floor(10000000 + Math.random() * 90000000)}`;
      setLastTxId(tx);
      addToast({
        type: 'success',
        message: `Payment authorized via ${methodObj.name}. Reference: ${tx}`,
      });
    }, 2000);
  };

  const reactCodeSnippet = `import { BiaElements, PaymentElement } from '@biapay/react-elements';

export function CheckoutPage() {
  const options = {
    clientSecret: 'cs_live_9921_abc8472...',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#635BFF',
        borderRadius: '8px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    }
  };

  return (
    <BiaElements options={options}>
      <form onSubmit={handlePayment}>
        <PaymentElement />
        <button type="submit" className="bia-pay-button">
          Pay ${rawAmount} ${selectedCurrency}
        </button>
      </form>
    </BiaElements>
  );
}`;

  const htmlCodeSnippet = `<!-- Bia Drop-in Elements SDK -->
<script src="https://js.biapay.io/v1/elements.js"></script>

<div id="bia-payment-container"></div>
<button id="submit-pay">Confirm & Pay</button>

<script>
  const bia = Bia('pk_live_african_fintech_token_9128');
  const elements = bia.elements({ clientSecret: 'cs_sec_8921_ke...' });
  const paymentElement = elements.create('payment');
  paymentElement.mount('#bia-payment-container');
</script>`;

  const curlCodeSnippet = `curl -X POST https://api.biapay.io/v1/charges \\
  -H "Authorization: Bearer sk_live_7721_prod_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": ${Math.round(baseUsd * curr.rate * 100)},
    "currency": "${selectedCurrency.toLowerCase()}",
    "payment_method_type": "${selectedMethod}",
    "customer": {
      "email": "${email}",
      "phone": "${phone}",
      "name": "${payerName}"
    },
    "metadata": {
      "order_id": "ORD-2024-AFR-99"
    }
  }'`;

  return (
    <div className="page-shell">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-pretitle">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary-600)', fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Client-Side Embeddable SDK
            </span>
          </div>
          <h1 className="page-title">Bia Elements & Checkout</h1>
          <p className="page-subtitle">
            Stripe-grade drop-in payment UI for web, mobile web, and React apps across African mobile money, instant bank EFT, and stablecoin rails.
          </p>
        </div>
        <div className="page-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Currency Demo:</span>
            <div style={{ width: 190 }}>
              <CustomSelect
                value={selectedCurrency}
                onChange={setSelectedCurrency}
                options={currencies.map((c) => ({ value: c.value, label: c.label }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-12" style={{ gap: 24, alignItems: 'start' }}>
        {/* Left Column: Interactive Checkout Component */}
        <div className="col-7">
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {/* Merchant Top Bar */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0A2540 0%, #1A1F71 100%)',
                color: '#fff',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                  }}
                >
                  B
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Pan-African Digital Goods Ltd.</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Powered by Bia Payments · TLS 256-bit</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total Amount Due</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {curr.symbol} {rawAmount}
                </div>
              </div>
            </div>

            {/* Checkout Body */}
            <div style={{ padding: 24 }}>
              {paymentSuccess ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'rgba(0, 166, 126, 0.1)',
                      color: 'var(--color-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Payment Successful!
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 20px' }}>
                    Your payment of <strong>{curr.symbol} {rawAmount}</strong> was confirmed via {methodObj.name}.
                  </p>
                  <div style={{ background: 'var(--bg-canvas)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-subtle)', display: 'inline-block', marginBottom: 24 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginRight: 8 }}>Transaction ID:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem' }}>{lastTxId}</span>
                  </div>
                  <div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPaymentSuccess(false)}
                    >
                      Make Another Test Payment
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePay}>
                  {/* Select Payment Method */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 10 }}>
                      Select African Payment Rail
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {paymentMethods.map((m) => {
                        const active = selectedMethod === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => setSelectedMethod(m.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 12px',
                              borderRadius: 8,
                              border: `1.5px solid ${active ? 'var(--color-primary-600)' : 'var(--border-subtle)'}`,
                              background: active ? 'rgba(99, 91, 255, 0.04)' : '#fff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ flexShrink: 0 }}>{m.iconSvg}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {m.name}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                {m.country} · {m.speed}
                              </div>
                            </div>
                            {active && (
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary-600)' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form fields based on selected method */}
                  <div style={{ background: 'var(--bg-canvas)', padding: 16, borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                          Customer Full Name
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {(selectedMethod === 'mpesa' || selectedMethod === 'mtn_momo' || selectedMethod === 'airtel') && (
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                          Mobile Wallet Phone Number (Receives STK / USSD Prompt)
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            className="input"
                            style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                          A direct PIN authorization prompt will be pushed instantly to this handset.
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'moniepoint' && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          Dynamic NIP Transfer Virtual Account
                        </div>
                        <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>8039218491</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Moniepoint MFB · Bia Checkout Escrow</div>
                          </div>
                          <Badge variant="accent">Expires in 29m</Badge>
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'card' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                            Card Number
                          </label>
                          <input
                            type="text"
                            className="input"
                            style={{ fontFamily: 'var(--font-mono)' }}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                              Expiry MM/YY
                            </label>
                            <input
                              type="text"
                              className="input"
                              style={{ fontFamily: 'var(--font-mono)' }}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                              CVC Security Code
                            </label>
                            <input
                              type="password"
                              className="input"
                              style={{ fontFamily: 'var(--font-mono)' }}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'circle_usdc' && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          Settlement Deposit Address (Base / Solana / Polygon)
                        </div>
                        <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>0x918...42C8</span>
                          <CopyBtn text="0x918485B887144e5B1E96C839F4771239842C8" label="Copy Address" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Authorizing on {methodObj.name}...
                      </span>
                    ) : (
                      <span>
                        Authorize Payment · {curr.symbol} {rawAmount}
                      </span>
                    )}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    End-to-end encrypted · ISO 20022 compliant messaging
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code Snippets & Developer Integration */}
        <div className="col-5">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Integration Code</div>
                <div className="card-subtitle">Drop this checkout onto any web page or React app in 3 lines</div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                <Tabs
                  active={embedTab}
                  onChange={(t) => setEmbedTab(t as any)}
                  style="pill"
                  tabs={[
                    { id: 'react', label: 'React SDK' },
                    { id: 'html', label: 'Vanilla JS' },
                    { id: 'curl', label: 'Backend cURL' },
                  ]}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <pre
                  style={{
                    margin: 0,
                    padding: 16,
                    background: '#0A2540',
                    color: '#E3E8EE',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    lineHeight: 1.6,
                    fontFamily: 'var(--font-mono)',
                    overflowX: 'auto',
                    maxHeight: 400,
                  }}
                >
                  <code>
                    {embedTab === 'react' && reactCodeSnippet}
                    {embedTab === 'html' && htmlCodeSnippet}
                    {embedTab === 'curl' && curlCodeSnippet}
                  </code>
                </pre>
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <CopyBtn
                    text={
                      embedTab === 'react'
                        ? reactCodeSnippet
                        : embedTab === 'html'
                        ? htmlCodeSnippet
                        : curlCodeSnippet
                    }
                  />
                </div>
              </div>

              <div style={{ marginTop: 20, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Key Capabilities
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <Badge variant="success">✓</Badge>
                    <span>Instant STK Push on Safaricom & MTN</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <Badge variant="success">✓</Badge>
                    <span>Automatic dynamic NIP virtual accounts in Nigeria</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <Badge variant="success">✓</Badge>
                    <span>Multi-chain USDC instant receipt with sub-second finality</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <Badge variant="success">✓</Badge>
                    <span>Zero KYC friction for Tier-1 local transactions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
