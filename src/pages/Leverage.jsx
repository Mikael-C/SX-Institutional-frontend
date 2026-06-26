import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import { useToast } from '../components/common/Toast.jsx';

const leveragePresets = [3, 10, 50, 100, 1000];

function Leverage() {
  const { API_BASE, walletAddress } = useContext(WalletContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedLeverage, setSelectedLeverage] = useState(10);
  const [amount, setAmount] = useState('');
  const [liquidationProtection, setLiquidationProtection] = useState(true);
  const [positions, setPositions] = useState([]);
  const [opening, setOpening] = useState(false);

  const entryPrice = 3250;
  const liqPrice = entryPrice * (1 - 1 / selectedLeverage);
  const margin = amount ? Number(amount) / selectedLeverage : 0;

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const addr = walletAddress || '0xdemo';
      const response = await fetch(`${API_BASE}/leverage/positions/${addr}`);
      if (response.ok) {
        const data = await response.json();
        setPositions(data.positions || []);
        if (!data.positions || data.positions.length === 0) loadFallbackData();
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setPositions([
      { id: 'LP-001', leverage: 10, amount: 5000, entry: 3200, current: 3250, liqPrice: 2880, status: 'Active', protection: true },
      { id: 'LP-002', leverage: 50, amount: 2000, entry: 3180, current: 3250, liqPrice: 3116.4, status: 'Active', protection: false },
      { id: 'LP-003', leverage: 3, amount: 10000, entry: 3300, current: 3250, liqPrice: 2200, status: 'Active', protection: true },
    ]);
  };

  const generateTxHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const handleOpenPosition = async () => {
    if (!amount || Number(amount) <= 0) {
      addToast('Please enter a valid amount', 'warning');
      return;
    }

    setOpening(true);
    try {
      await fetch(`${API_BASE}/leverage/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leverage: selectedLeverage,
          amount: Number(amount),
          protection: liquidationProtection,
        }),
      });
    } catch (error) {
      console.error('Failed to open position:', error);
    }

    const newPosition = {
      id: `LP-${String(positions.length + 1).padStart(3, '0')}`,
      leverage: selectedLeverage,
      amount: Number(amount),
      entry: entryPrice,
      current: entryPrice,
      liqPrice: liqPrice,
      status: 'Active',
      protection: liquidationProtection,
    };

    setPositions((prev) => [newPosition, ...prev]);
    setAmount('');
    setOpening(false);
    addToast(`Opened ${selectedLeverage}x position for $${Number(amount).toLocaleString()}`, 'success');
  };

  const simulatePriceMove = () => {
    setPositions((prev) =>
      prev.map((pos) => {
        const newPrice = pos.current * (1 - 0.02);
        const isLiquidated = newPrice <= pos.liqPrice;
        if (isLiquidated && pos.protection) {
          addToast(`Position ${pos.id}: Liquidation protection activated!`, 'warning');
          return { ...pos, current: newPrice, status: 'Protected' };
        } else if (isLiquidated) {
          addToast(`Position ${pos.id}: Liquidated!`, 'error');
          return { ...pos, current: newPrice, status: 'Liquidated' };
        }
        return { ...pos, current: newPrice };
      })
    );
    addToast('Simulated 2% price drop across all positions', 'info');
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
      <div className="grid-2 mb-lg" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Card title="Open Leveraged Position">
          <div className="mb-md">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 10 }}>
              Select Leverage
            </label>
            <div className="flex gap-sm flex-wrap">
              {leveragePresets.map((lev) => (
                <button
                  key={lev}
                  className={`btn ${selectedLeverage === lev ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  onClick={() => setSelectedLeverage(lev)}
                  style={{ minWidth: 70 }}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          <div className="input-group mb-md">
            <label>Amount ($)</label>
            <input
              type="number"
              className="input input-lg"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
            />
          </div>

          <div className="flex items-center justify-between mb-lg" style={{ padding: '12px 0' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Liquidation Protection</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={liquidationProtection}
                onChange={(e) => setLiquidationProtection(e.target.checked)}
              />
              <div className="toggle-track" />
              <span className="toggle-label">{liquidationProtection ? 'ON' : 'OFF'}</span>
            </label>
          </div>

          <div
            style={{
              padding: 16,
              background: 'rgba(0, 255, 136, 0.05)',
              border: '1px solid rgba(0, 255, 136, 0.15)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-success)' }}>
              Gas: 0
            </span>
            <span className="text-secondary" style={{ fontSize: '0.75rem', display: 'block', marginTop: 2 }}>
              Zero gas fees on SX Omni Chain
            </span>
          </div>

          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handleOpenPosition}
            disabled={opening || !amount || Number(amount) <= 0}
          >
            {opening ? 'Opening Position...' : 'Open Position'}
          </button>
        </Card>

        <Card title="Position Preview">
          <div className="flex flex-col gap-md">
            {[
              { label: 'Leverage', value: `${selectedLeverage}x` },
              { label: 'Position Size', value: amount ? `$${Number(amount).toLocaleString()}` : '$0' },
              { label: 'Entry Price', value: `$${entryPrice.toLocaleString()}` },
              { label: 'Liquidation Price', value: amount ? `$${liqPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—' },
              { label: 'Required Margin', value: amount ? `$${margin.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—' },
              { label: 'Protection', value: liquidationProtection ? 'Enabled ✓' : 'Disabled' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span className="text-secondary">{item.label}</span>
                <span style={{ fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        title="Active Positions"
        headerRight={
          <button className="btn btn-warning btn-sm" onClick={simulatePriceMove}>
            📉 Simulate Price Move
          </button>
        }
      >
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Position ID</th>
                <th>Leverage</th>
                <th>Amount</th>
                <th>Entry</th>
                <th>Current</th>
                <th>Liq. Price</th>
                <th>P&L</th>
                <th>Status</th>
                <th>Protection</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => {
                const pnl = ((pos.current - pos.entry) / pos.entry) * pos.leverage * 100;
                const pnlDollar = (pos.current - pos.entry) / pos.entry * pos.amount * pos.leverage;
                return (
                  <tr key={pos.id}>
                    <td className="font-mono" style={{ fontSize: '0.8rem' }}>{pos.id}</td>
                    <td>
                      <span className="badge badge-info">{pos.leverage}x</span>
                    </td>
                    <td>${pos.amount.toLocaleString()}</td>
                    <td>${pos.entry.toLocaleString()}</td>
                    <td>${pos.current.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ color: 'var(--accent-danger)' }}>
                      ${pos.liqPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: pnl >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 600 }}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                      <div style={{ fontSize: '0.7rem' }}>
                        {pnlDollar >= 0 ? '+' : ''}${pnlDollar.toFixed(2)}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        pos.status === 'Active' ? 'badge-success' :
                        pos.status === 'Protected' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {pos.status}
                      </span>
                    </td>
                    <td>
                      {pos.protection ? (
                        <span className="text-success" style={{ fontWeight: 600 }}>✓ ON</span>
                      ) : (
                        <span className="text-muted">OFF</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default Leverage;
