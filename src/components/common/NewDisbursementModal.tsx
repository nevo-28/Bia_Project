import React, { useState } from 'react';
import { X, Send, Coins, ArrowRight, Sparkles } from 'lucide-react';
import { Currency, ProviderId, KycTier } from '../../types';

interface Props {
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    currency: Currency;
    provider: ProviderId;
    recipientName: string;
    identifier: string;
    country: string;
    reference: string;
    senderKycTier: KycTier;
  }) => void;
}

export const NewDisbursementModal: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [amount, setAmount] = useState<number>(350);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [country, setCountry] = useState<string>('GH');
  const [provider, setProvider] = useState<ProviderId>('stablecoin_solana');
  const [recipientName, setRecipientName] = useState<string>('Kofi Annan Mensah');
  const [identifier, setIdentifier] = useState<string>('+233241234567');
  const [reference, setReference] = useState<string>(`PAYOUT-${Date.now().toString().slice(-6)}`);
  const [senderKycTier, setSenderKycTier] = useState<KycTier>('tier_2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: Number(amount),
      currency,
      provider,
      recipientName,
      identifier,
      country,
      reference,
      senderKycTier
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Initiate Cross-Border Disbursement</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input 
                type="number" 
                className="form-input" 
                value={amount} 
                onChange={e => setAmount(Number(e.target.value))}
                required 
                min={1}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payout Currency</label>
              <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value as Currency)}>
                <option value="USD">USD — US Dollar (Cross-border)</option>
                <option value="USDC">USDC — Circle USD Coin</option>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="GHS">GHS — Ghanaian Cedi</option>
                <option value="ZAR">ZAR — South African Rand</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Destination Country</label>
              <select 
                className="form-select" 
                value={country} 
                onChange={e => {
                  setCountry(e.target.value);
                  if (e.target.value === 'GH') setIdentifier('+233241234567');
                  else if (e.target.value === 'KE') setIdentifier('+254712345678');
                  else if (e.target.value === 'NG') setIdentifier('+2348031234567');
                }}
              >
                <option value="GH">Ghana (MTN MoMo, Vodafone, AirtelTigo)</option>
                <option value="KE">Kenya (M-PESA, Airtel Money)</option>
                <option value="NG">Nigeria (Bank Account, NIP, Paystack)</option>
                <option value="ZA">South Africa (EFT, Capitec, TymeBank)</option>
                <option value="UG">Uganda (MTN MoMo, Airtel)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Settlement Rail Backbone</label>
              <select className="form-select" value={provider} onChange={e => setProvider(e.target.value as ProviderId)}>
                <option value="stablecoin_solana">Solana USDC Settlement (~4s, 0.8% fee)</option>
                <option value="stablecoin_polygon">Polygon USDC Settlement (~15s, 1.2% fee)</option>
                <option value="mpesa">Direct M-PESA Rail (Kenya only)</option>
                <option value="pawapay">PawaPay Aggregator (20+ African Countries)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Recipient Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={recipientName} 
                onChange={e => setRecipientName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Recipient Mobile / Account</label>
              <input 
                type="text" 
                className="form-input" 
                value={identifier} 
                onChange={e => setIdentifier(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Disbursement Reference</label>
              <input 
                type="text" 
                className="form-input" 
                value={reference} 
                onChange={e => setReference(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sender Verified KYC Tier</label>
              <select className="form-select" value={senderKycTier} onChange={e => setSenderKycTier(e.target.value as KycTier)}>
                <option value="tier_1">Tier 1 Basic (Max $500)</option>
                <option value="tier_2">Tier 2 Verified (Max $5,000)</option>
                <option value="tier_3">Tier 3 Enterprise (Max $50,000)</option>
              </select>
            </div>
          </div>

          {/* AI Route Advisory Notice */}
          <div style={{ background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8rem', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} style={{ color: '#a78bfa', flexShrink: 0 }} />
            <div>
              <strong>AI Recommender Advisory:</strong> Routing through Solana USDC Backbone reduces fee from 3.5% to 0.8% and settles in under 5 seconds with zero intermediary bank delays.
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-purple">
              <Send size={16} /> Authorize & Disburse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
