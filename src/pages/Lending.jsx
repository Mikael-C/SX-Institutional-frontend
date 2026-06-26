import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import { useToast } from '../components/common/Toast.jsx';

function Lending() {
  const { API_BASE, walletAddress } = useContext(WalletContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lend');

  const [lendAmount, setLendAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [shortAsset, setShortAsset] = useState('ETH');
  const [shortAmount, setShortAmount] = useState('');

  const [lendingPositions, setLendingPositions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [shorts, setShorts] = useState([]);

  useEffect(() => {
    fetchLendingData();
  }, []);

  const fetchLendingData = async () => {
    setLoading(true);
    try {
      const addr = walletAddress || '0xdemo';
      const response = await fetch(`${API_BASE}/lending/portfolio/${addr}`);
      if (response.ok) {
        const data = await response.json();
        setLendingPositions(data.lendingPositions || []);
        setLoans(data.loans || []);
        setShorts(data.shorts || []);
        if ((!data.lendingPositions || data.lendingPositions.length === 0) &&
            (!data.loans || data.loans.length === 0) &&
            (!data.shorts || data.shorts.length === 0)) {
          loadFallbackData();
        }
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch lending data:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setLendingPositions([
      { id: 'LD-001', amount: 5.0, asset: 'ETH', startDate: '2024-06-20', yieldAccrued: 0.025, status: 'Active' },
      { id: 'LD-002', amount: 2.5, asset: 'ETH', startDate: '2024-06-18', yieldAccrued: 0.019, status: 'Active' },
    ]);
    setLoans([
      { id: 'LN-001', amount: 3.0, asset: 'ETH', startDate: '2024-06-21', interest: 0.03, status: 'Active' },
    ]);
    setShorts([
      { id: 'SH-001', asset: 'ETH', amount: 2.0, entry: 3300, current: 3250, pnl: 100, status: 'Active' },
      { id: 'SH-002', asset: 'BTC', amount: 0.1, entry: 68000, current: 67500, pnl: 50, status: 'Active' },
    ]);
  };

  const handleLend = async () => {
    if (!lendAmount || Number(lendAmount) <= 0) {
      addToast('Please enter a valid amount', 'warning');
      return;
    }

    try {
      await fetch(`${API_BASE}/lending/lend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(lendAmount), asset: 'ETH' }),
      });
    } catch (error) {
      console.error('Lend failed:', error);
    }

    setLendingPositions((prev) => [
      {
        id: `LD-${String(prev.length + 1).padStart(3, '0')}`,
        amount: Number(lendAmount),
        asset: 'ETH',
        startDate: new Date().toISOString().split('T')[0],
        yieldAccrued: 0,
        status: 'Active',
      },
      ...prev,
    ]);
    setLendAmount('');
    addToast(`Deposited ${lendAmount} ETH for lending`, 'success');
  };

  const handleBorrow = async () => {
    if (!borrowAmount || Number(borrowAmount) <= 0) {
      addToast('Please enter a valid amount', 'warning');
      return;
    }

    try {
      await fetch(`${API_BASE}/lending/borrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(borrowAmount), asset: 'ETH' }),
      });
    } catch (error) {
      console.error('Borrow failed:', error);
    }

    setLoans((prev) => [
      {
        id: `LN-${String(prev.length + 1).padStart(3, '0')}`,
        amount: Number(borrowAmount),
        asset: 'ETH',
        startDate: new Date().toISOString().split('T')[0],
        interest: 0,
        status: 'Active',
      },
      ...prev,
    ]);
    setBorrowAmount('');
    addToast(`Borrowed ${borrowAmount} ETH`, 'success');
  };

  const handleOpenShort = async () => {
    if (!shortAmount || Number(shortAmount) <= 0) {
      addToast('Please enter a valid amount', 'warning');
      return;
    }

    try {
      await fetch(`${API_BASE}/lending/short`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset: shortAsset, amount: Number(shortAmount) }),
      });
    } catch (error) {
      console.error('Short failed:', error);
    }

    const entryPrices = { ETH: 3250, BTC: 67500, SOL: 145 };
    setShorts((prev) => [
      {
        id: `SH-${String(prev.length + 1).padStart(3, '0')}`,
        asset: shortAsset,
        amount: Number(shortAmount),
        entry: entryPrices[shortAsset] || 100,
        current: entryPrices[shortAsset] || 100,
        pnl: 0,
        status: 'Active',
      },
      ...prev,
    ]);
    setShortAmount('');
    addToast(`Opened short position on ${shortAsset}`, 'success');
  };

  const handleCloseShort = (id) => {
    const shortPos = shorts.find((s) => s.id === id);
    setShorts((prev) => prev.map((s) => s.id === id ? { ...s, status: 'Closed' } : s));
    addToast(`Closed short ${id} — P&L: $${shortPos?.pnl || 0}`, 'success');
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="tabs mb-lg">
        <button className={`tab ${activeTab === 'lend' ? 'active' : ''}`} onClick={() => setActiveTab('lend')}>
          Lend
        </button>
        <button className={`tab ${activeTab === 'borrow' ? 'active' : ''}`} onClick={() => setActiveTab('borrow')}>
          Borrow
        </button>
        <button className={`tab ${activeTab === 'short' ? 'active' : ''}`} onClick={() => setActiveTab('short')}>
          Short-Sell
        </button>
      </div>

      {activeTab === 'lend' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="grid-2 mb-lg" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Card title="Deposit to Lend">
              <div className="input-group mb-md">
                <label>Amount (ETH)</label>
                <input
                  type="number"
                  className="input input-lg"
                  placeholder="0.00"
                  value={lendAmount}
                  onChange={(e) => setLendAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div
                style={{
                  padding: 14,
                  background: 'rgba(0, 255, 136, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(0, 255, 136, 0.15)',
                  textAlign: 'center',
                  marginBottom: 16,
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent-success)' }}>5% APY</span>
                <span className="text-secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
                  Current lending yield
                </span>
              </div>

              <button
                className="btn btn-success btn-block btn-lg"
                onClick={handleLend}
                disabled={!lendAmount || Number(lendAmount) <= 0}
              >
                Lend ETH
              </button>
            </Card>

            <Card title="Active Lending Positions">
              {lendingPositions.length === 0 ? (
                <p className="text-secondary">No active lending positions</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Start Date</th>
                        <th>Yield Accrued</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lendingPositions.map((pos) => (
                        <tr key={pos.id}>
                          <td className="font-mono" style={{ fontSize: '0.8rem' }}>{pos.id}</td>
                          <td>{pos.amount} {pos.asset}</td>
                          <td className="text-secondary">{pos.startDate}</td>
                          <td style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                            +{pos.yieldAccrued.toFixed(4)} {pos.asset}
                          </td>
                          <td><span className="badge badge-success">{pos.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 'borrow' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="grid-2 mb-lg" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Card title="Borrow Assets">
              <div className="input-group mb-md">
                <label>Amount (ETH)</label>
                <input
                  type="number"
                  className="input input-lg"
                  placeholder="0.00"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div
                style={{
                  padding: 14,
                  background: 'rgba(0, 212, 255, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(0, 212, 255, 0.15)',
                  textAlign: 'center',
                  marginBottom: 16,
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent-primary)' }}>1% Fee</span>
                <span className="text-secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
                  Borrowing interest rate
                </span>
              </div>

              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={handleBorrow}
                disabled={!borrowAmount || Number(borrowAmount) <= 0}
              >
                Borrow ETH
              </button>
            </Card>

            <Card title="Active Loans">
              {loans.length === 0 ? (
                <p className="text-secondary">No active loans</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Start Date</th>
                        <th>Interest</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map((loan) => (
                        <tr key={loan.id}>
                          <td className="font-mono" style={{ fontSize: '0.8rem' }}>{loan.id}</td>
                          <td>{loan.amount} {loan.asset}</td>
                          <td className="text-secondary">{loan.startDate}</td>
                          <td style={{ color: 'var(--accent-warning)', fontWeight: 600 }}>
                            {loan.interest.toFixed(4)} {loan.asset}
                          </td>
                          <td><span className="badge badge-warning">{loan.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 'short' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="grid-2 mb-lg" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Card title="Open Short Position">
              <div className="input-group mb-md">
                <label>Asset</label>
                <select
                  className="select"
                  value={shortAsset}
                  onChange={(e) => setShortAsset(e.target.value)}
                >
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>

              <div className="input-group mb-md">
                <label>Amount</label>
                <input
                  type="number"
                  className="input input-lg"
                  placeholder="0.00"
                  value={shortAmount}
                  onChange={(e) => setShortAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <button
                className="btn btn-danger btn-block btn-lg"
                onClick={handleOpenShort}
                disabled={!shortAmount || Number(shortAmount) <= 0}
              >
                Open Short
              </button>
            </Card>

            <Card title="Active Shorts">
              {shorts.length === 0 ? (
                <p className="text-secondary">No active short positions</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Asset</th>
                        <th>Amount</th>
                        <th>Entry</th>
                        <th>Current</th>
                        <th>P&L</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shorts.map((s) => (
                        <tr key={s.id}>
                          <td className="font-mono" style={{ fontSize: '0.8rem' }}>{s.id}</td>
                          <td style={{ fontWeight: 600 }}>{s.asset}</td>
                          <td>{s.amount}</td>
                          <td>${s.entry.toLocaleString()}</td>
                          <td>${s.current.toLocaleString()}</td>
                          <td style={{ color: s.pnl >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 600 }}>
                            {s.pnl >= 0 ? '+' : ''}${s.pnl.toLocaleString()}
                          </td>
                          <td>
                            {s.status === 'Active' ? (
                              <button className="btn btn-outline btn-sm" onClick={() => handleCloseShort(s.id)}>
                                Close
                              </button>
                            ) : (
                              <span className="badge badge-success">Closed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Lending;
