import React, { useState } from 'react';
import { X, Smartphone, CreditCard, Building2, Coins, ArrowRight } from 'lucide-react';
import { Currency, ProviderId } from '../../types';

interface Props {
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    currency: Currency;
    provider: ProviderId;
    phone: string;
    customerName: string;
    reference: string;
  }) => void;
}

export const NewCollectionModal: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [amount, setAmount] = useState<number>(5000);
  const [currency, setCurrency] = useState<Currency>('KES');
  const [provider, setProvider] = useState<ProviderId>('mpesa');
  const [phone, setPhone] = useState<string>('+254712345678');
  const [customerName, setCustomerName] = useState<string>('Faith Njeri');
  const [reference, setReference] = useState<string>(`INV-${Date.now().toString().slice(-6)}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: Number(amount),
      currency,
      provider,
      phone,
      customerName,
      reference
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Initiate Payment Collection</h3>
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
              <label className="form-label">Currency</label>
              <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value as Currency)}>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="GHS">GHS — Ghanaian Cedi</option>
                <option value="ZAR">ZAR — South African Rand</option>
                <option value="USD">USD — US Dollar</option>
                <option value="USDC">USDC — Circle USD Coin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method / Provider Rail</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              <button
                type="button"
                className={`btn btn-secondary ${provider === 'mpesa' ? 'btn-primary-green' : ''}`}
                onClick={() => { setProvider('mpesa'); setCurrency('KES'); }}
                style={{ justifyContent: 'flex-start', padding: '0.65rem' }}
              >
                <Smartphone size={16} /> M-PESA STK Push
              </button>
              <button
                type="button"
                className={`btn btn-secondary ${provider === 'mtn_momo' ? 'btn-primary-blue' : ''}`}
                onClick={() => { setProvider('mtn_momo'); setCurrency('GHS'); }}
                style={{ justifyContent: 'flex-start', padding: '0.65rem' }}
              >
                <Smartphone size={16} /> MTN Mobile Money
              </button>
              <button
                type="button"
                className={`btn btn-secondary ${provider === 'paystack' ? 'btn-primary-blue' : ''}`}
                onClick={() => { setProvider('paystack'); setCurrency('NGN'); }}
                style={{ justifyContent: 'flex-start', padding: '0.65rem' }}
              >
                <CreditCard size={16} /> Card / NIBSS Paystack
              </button>
              <button
                type="button"
                className={`btn btn-secondary ${provider === 'stablecoin_polygon' ? 'btn-primary-purple' : ''}`}
                onClick={() => { setProvider('stablecoin_polygon'); setCurrency('USDC'); }}
                style={{ justifyContent: 'flex-start', padding: '0.65rem' }}
              >
                <Coins size={16} /> Stablecoin (Polygon USDC)
              </button>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Phone / Identifier</label>
              <input 
                type="text" 
                className="form-input" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Invoice / Order Reference</label>
            <input 
              type="text" 
              className="form-input" 
              value={reference} 
              onChange={e => setReference(e.target.value)} 
              required 
            />
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-green">
              Trigger Collection <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
