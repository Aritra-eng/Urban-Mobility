import React, { useEffect, useState } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownRight, Clock, Building, Download, TrendingUp, Wallet as WalletIcon, CheckCircle, X, Shield, Loader, ChevronRight, Landmark, IndianRupee } from 'lucide-react';
import { useToast } from '../components/Toast';
import { apiRequest, getDriverId } from '../services/api';
import './Wallet.css';

const linkedBanks = [
  { id: 'hdfc', name: 'HDFC Bank', account: '****4521', type: 'Savings', color: '#004c8f', instantSupported: true },
  { id: 'sbi', name: 'State Bank of India', account: '****7893', type: 'Savings', color: '#0066b3', instantSupported: true },
  { id: 'icici', name: 'ICICI Bank', account: '****2156', type: 'Current', color: '#f58220', instantSupported: false },
];

const valueOf = (obj, keys, fallback = 0) => keys.map((k) => obj?.[k]).find((v) => v !== undefined && v !== null) ?? fallback;
const money = (value) => Number(value || 0).toLocaleString();
const formatDate = (value) => {
  if (!value) return 'Recent';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const normalizeTransaction = (tx) => {
  const rawAmount = Number(valueOf(tx, ['amount', 'txn_amount'], 0));
  const rawType = String(valueOf(tx, ['type', 'transaction_type'], '')).toLowerCase();
  const isDebit = rawType.includes('debit') || rawType.includes('withdraw') || rawAmount < 0;

  return {
    id: valueOf(tx, ['txn_id', 'id', 'transaction_id'], `${rawType}-${rawAmount}-${valueOf(tx, ['created_at'], '')}`),
    type: isDebit ? 'Withdrawal' : 'Ride Fare',
    desc: valueOf(tx, ['description', 'desc'], isDebit ? 'Wallet withdrawal' : 'Driver earning'),
    amount: isDebit ? -Math.abs(rawAmount) : Math.abs(rawAmount),
    date: formatDate(valueOf(tx, ['created_at', 'date', 'transaction_date'], '')),
  };
};

const Wallet = () => {
  const toast = useToast();
  const driverId = getDriverId();

  const [showAll, setShowAll] = useState(false);
  const [balance, setBalance] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawType, setWithdrawType] = useState(null);
  const [withdrawStep, setWithdrawStep] = useState('select-bank');
  const [selectedBank, setSelectedBank] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const loadWalletData = async () => {
    setLoading(true);
    setError('');

    try {
      const [wallet, txns, earnings] = await Promise.all([
        apiRequest(`/wallet/${driverId}`),
        apiRequest(`/transactions/${driverId}`).catch(() => []),
        apiRequest(`/earnings/${driverId}`).catch(() => []),
      ]);

      setBalance(Number(valueOf(wallet, ['balance', 'available_balance'], 0)));
      setPendingAmount(Number(valueOf(wallet, ['pending_amount', 'pending', 'pending_payments'], 0)));

      const earningRows = Array.isArray(earnings) ? earnings : [];
      setLifetimeEarnings(earningRows.reduce((sum, row) => sum + Number(valueOf(row, ['earnings', 'amount', 'net_profit'], 0)), 0));
      setWeeklyEarnings(earningRows.slice(0, 7).reduce((sum, row) => sum + Number(valueOf(row, ['earnings', 'amount', 'net_profit'], 0)), 0));
      setTransactions(Array.isArray(txns) ? txns.map(normalizeTransaction) : []);
    } catch (err) {
      setError(err.message || 'Unable to load wallet.');
      toast(err.message || 'Unable to load wallet.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [driverId]);

  const closeWithdrawModal = () => {
    setWithdrawOpen(false);
    setTimeout(() => {
      setWithdrawStep('select-bank');
      setSelectedBank(null);
      setWithdrawAmount('');
      setWithdrawType(null);
    }, 300);
  };

  const openWithdraw = (type) => {
    if (balance <= 0) {
      toast('No balance to withdraw', 'warning');
      return;
    }
    setWithdrawType(type);
    setWithdrawStep('select-bank');
    setSelectedBank(null);
    setWithdrawAmount('');
    setWithdrawOpen(true);
  };

  const handleSelectBank = (bank) => {
    if (withdrawType === 'instant' && !bank.instantSupported) {
      toast(`${bank.name} does not support instant withdrawals`, 'warning');
      return;
    }
    setSelectedBank(bank);
    setWithdrawStep('enter-amount');
    setWithdrawAmount(String(Math.min(balance, 500)));
  };

  const handleProceedWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      toast('Please enter a valid amount', 'error');
      return;
    }
    if (amt > balance) {
      toast('Amount exceeds available balance', 'error');
      return;
    }
    if (amt < 100) {
      toast('Minimum withdrawal amount is Rs.100', 'error');
      return;
    }

    setWithdrawStep('verifying');
    try {
      await apiRequest('/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({ driverId, amount: amt }),
      });
      await loadWalletData();
      setWithdrawStep('success');
      toast('Withdrawal successful', 'success');
    } catch (err) {
      toast(err.message || 'Withdrawal failed. Please try again.', 'error');
      setWithdrawStep('enter-amount');
    }
  };

  const handleDownloadStatement = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast('Earnings statement downloaded successfully!', 'success');
    }, 800);
  };

  const displayedTransactions = showAll ? transactions : transactions.slice(0, 6);
  const quickAmounts = [500, 1000, 2000, 5000, 10000].filter((amount) => amount <= balance);

  if (loading) {
    return <div className="wallet-page"><div className="glass-card">Loading wallet...</div></div>;
  }

  if (error) {
    return <div className="wallet-page"><div className="glass-card">{error}</div></div>;
  }

  return (
    <div className="wallet-page">
      <div className="wallet-header">
        <h1 className="page-heading">Wallet & Earnings</h1>
        <button className="download-btn" onClick={handleDownloadStatement} disabled={downloading}>
          <Download size={16} /> {downloading ? 'Downloading...' : 'Statement'}
        </button>
      </div>

      <div className="balance-grid">
        <div className="primary-balance-card">
          <div className="balance-bg-pattern"></div>
          <div className="balance-content">
            <div className="balance-top">
              <div className="balance-chip">
                <CreditCard size={20} />
              </div>
              <span className="balance-badge">DriveMax Wallet</span>
            </div>
            <div className="balance-main">
              <span className="balance-label">Available Balance</span>
              <h2 className="balance-amount">Rs.{money(balance)}</h2>
            </div>
            <div className="balance-actions">
              <button className="withdraw-btn" onClick={() => openWithdraw('instant')}>
                <ArrowUpRight size={18} /> Instant Withdraw
              </button>
              <button className="bank-btn" onClick={() => openWithdraw('bank')}>
                <Building size={18} /> To Bank
              </button>
            </div>
          </div>
        </div>

        <div className="secondary-cards">
          <div className="info-card glass-card pending">
            <div className="info-icon-wrap amber"><Clock size={20} /></div>
            <div>
              <span className="info-label">Pending Payments</span>
              <span className="info-value amber-text">Rs.{money(pendingAmount)}</span>
            </div>
          </div>
          <div className="info-card glass-card lifetime">
            <div className="info-icon-wrap green"><TrendingUp size={20} /></div>
            <div>
              <span className="info-label">Lifetime Earnings</span>
              <span className="info-value green-text">Rs.{money(lifetimeEarnings)}</span>
            </div>
          </div>
          <div className="info-card glass-card weekly">
            <div className="info-icon-wrap blue"><WalletIcon size={20} /></div>
            <div>
              <span className="info-label">This Week</span>
              <span className="info-value blue-text">Rs.{money(weeklyEarnings)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="transactions-card glass-card">
        <div className="tx-header">
          <h3 className="tx-title">Recent Transactions</h3>
          <button className="view-all-btn" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show Less' : 'View All'}
          </button>
        </div>

        <div className="tx-list">
          {displayedTransactions.length === 0 && (
            <div className="tx-row" style={{ opacity: 1 }}>
              <div className="tx-left">
                <div className="tx-info">
                  <span className="tx-type">No transactions yet</span>
                  <span className="tx-desc">Completed rides and withdrawals will appear here.</span>
                </div>
              </div>
            </div>
          )}
          {displayedTransactions.map((tx, i) => (
            <div key={tx.id} className="tx-row" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="tx-left">
                <div className={`tx-icon-wrap ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                  {tx.amount > 0 ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div className="tx-info">
                  <span className="tx-type">{tx.type}</span>
                  <span className="tx-desc">{tx.desc}</span>
                </div>
              </div>
              <div className="tx-right">
                <span className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                  {tx.amount > 0 ? '+' : ''}Rs.{money(Math.abs(tx.amount))}
                </span>
                <span className="tx-meta">{tx.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {withdrawOpen && (
        <div className="modal-overlay" onClick={closeWithdrawModal}>
          <div className="modal-card withdraw-modal" onClick={(e) => e.stopPropagation()}>
            <button className="withdraw-close-btn" onClick={closeWithdrawModal}>
              <X size={18} />
            </button>

            {withdrawStep === 'select-bank' && (
              <div className="withdraw-step animate-step">
                <div className="modal-icon-wrap info"><Landmark size={28} /></div>
                <h3 className="modal-title">{withdrawType === 'instant' ? 'Instant Withdraw' : 'Transfer to Bank'}</h3>
                <p className="modal-desc">Select a linked bank account to transfer your funds</p>
                <div className="bank-list">
                  {linkedBanks.map((bank) => (
                    <button
                      key={bank.id}
                      className={`bank-option ${withdrawType === 'instant' && !bank.instantSupported ? 'disabled' : ''}`}
                      onClick={() => handleSelectBank(bank)}
                    >
                      <div className="bank-option-left">
                        <div className="bank-icon-box" style={{ background: `${bank.color}12`, color: bank.color }}>
                          <Landmark size={18} />
                        </div>
                        <div className="bank-option-info">
                          <span className="bank-option-name">{bank.name}</span>
                          <span className="bank-option-acc">{bank.type} - {bank.account}</span>
                        </div>
                      </div>
                      <div className="bank-option-right">
                        <span className={`bank-tag ${bank.instantSupported ? 'instant' : 'standard'}`}>
                          {bank.instantSupported ? 'Instant' : '1-2 days'}
                        </span>
                        <ChevronRight size={16} className="bank-chevron" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {withdrawStep === 'enter-amount' && selectedBank && (
              <div className="withdraw-step animate-step">
                <div className="modal-icon-wrap success"><IndianRupee size={28} /></div>
                <h3 className="modal-title">Enter Amount</h3>
                <p className="modal-desc">Withdrawing to <strong>{selectedBank.name}</strong> ({selectedBank.account})</p>
                <div className="amount-input-wrap">
                  <span className="amount-currency">Rs.</span>
                  <input
                    type="number"
                    className="amount-input"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0"
                    min="100"
                    max={balance}
                    autoFocus
                  />
                </div>
                <span className="amount-available">Available: Rs.{money(balance)}</span>
                <div className="quick-amounts">
                  {quickAmounts.map((amt) => (
                    <button key={amt} className={`quick-amt-btn ${withdrawAmount === String(amt) ? 'active' : ''}`} onClick={() => setWithdrawAmount(String(amt))}>
                      Rs.{money(amt)}
                    </button>
                  ))}
                  <button className={`quick-amt-btn ${withdrawAmount === String(balance) ? 'active' : ''}`} onClick={() => setWithdrawAmount(String(balance))}>
                    Full Amount
                  </button>
                </div>
                <div className="modal-actions">
                  <button className="modal-btn cancel" onClick={() => setWithdrawStep('select-bank')}>Back</button>
                  <button className="modal-btn primary" onClick={handleProceedWithdraw}>
                    {withdrawType === 'instant' ? 'Withdraw Now' : 'Transfer'}
                  </button>
                </div>
              </div>
            )}

            {withdrawStep === 'verifying' && selectedBank && (
              <div className="withdraw-step animate-step verifying-step">
                <div className="verifying-animation">
                  <div className="verify-spinner"></div>
                  <div className="verify-shield"><Shield size={28} /></div>
                </div>
                <h3 className="modal-title">Bank Verification</h3>
                <p className="modal-desc">{selectedBank.name} is accepting the withdrawal request...</p>
                <div className="verify-progress">
                  <div className="verify-step-item completed"><CheckCircle size={16} /><span>Request initiated</span></div>
                  <div className="verify-step-item active"><Loader size={16} className="spin" /><span>Processing transfer...</span></div>
                </div>
              </div>
            )}

            {withdrawStep === 'success' && selectedBank && (
              <div className="withdraw-step animate-step success-step">
                <div className="success-animation">
                  <div className="success-ring"></div>
                  <CheckCircle size={40} />
                </div>
                <h3 className="modal-title">Withdrawal Successful!</h3>
                <p className="modal-desc">Rs.{money(withdrawAmount)} has been submitted to your bank account</p>
                <button className="modal-btn primary" style={{ width: '100%' }} onClick={closeWithdrawModal}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
