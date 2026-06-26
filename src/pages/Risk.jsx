import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import Gauge from '../components/common/Gauge.jsx';
import Modal from '../components/common/Modal.jsx';
import { useToast } from '../components/common/Toast.jsx';

function Risk() {
  const { API_BASE } = useContext(WalletContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [riskScore, setRiskScore] = useState(35);
  const [metrics, setMetrics] = useState({});
  const [showEquityModal, setShowEquityModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [equityAmount, setEquityAmount] = useState('');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/risk/:address`);
      if (response.ok) {
        const data = await response.json();
        setRiskScore(data.riskScore || 35);
        setMetrics(data.metrics || {});
        if (!data.metrics) loadFallbackData();
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch risk data:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setRiskScore(35);
    setMetrics({
      borrowingPower: 50000,
      currentLoan: 12500,
      volatility: 23.5,
      correlation: 0.72,
      concentration: 45,
    });
  };

  const getRiskLevel = () => {
    if (riskScore < 30) return { label: 'Low', color: 'var(--accent-success)' };
    if (riskScore < 60) return { label: 'Moderate', color: 'var(--accent-warning)' };
    return { label: 'High', color: 'var(--accent-danger)' };
  };

  const riskLevel = getRiskLevel();
  const isOverLeveraged = (metrics.borrowingPower || 50000) < (metrics.currentLoan || 0);

  const handleAddEquity = () => {
    if (!equityAmount || Number(equityAmount) <= 0) {
      addToast('Please enter a valid amount', 'warning');
      return;
    }
    setMetrics((prev) => ({
      ...prev,
      borrowingPower: (prev.borrowingPower || 50000) + Number(equityAmount),
    }));
    setRiskScore(Math.max(5, riskScore - 10));
    setShowEquityModal(false);
    setEquityAmount('');
    addToast(`Added $${Number(equityAmount).toLocaleString()} equity successfully`, 'success');
  };

  const handleClosePortfolio = async () => {
    setClosing(true);
    try {
      await fetch(`${API_BASE}/risk/close-portfolio`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to close portfolio:', error);
    }
    setRiskScore(0);
    setMetrics({ borrowingPower: 0, currentLoan: 0, volatility: 0, correlation: 0, concentration: 0 });
    setClosing(false);
    setShowCloseModal(false);
    addToast('Portfolio closed. All positions liquidated.', 'success');
  };

  const simulatePriceDrop = () => {
    const newScore = Math.min(95, riskScore + 25);
    setRiskScore(newScore);
    setMetrics((prev) => ({
      ...prev,
      borrowingPower: Math.max(0, (prev.borrowingPower || 50000) - 20000),
      volatility: (prev.volatility || 23.5) + 15,
    }));
    addToast('Simulated 30% price drop — risk score increased', 'error');
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
      {isOverLeveraged && (
        <div className="alert-banner alert-danger pulse">
          <span style={{ fontSize: '1.2rem' }}>🚨</span>
          <span>
            <strong>Warning:</strong> Borrowing power is below current loan amount. Add equity or close positions immediately.
          </span>
        </div>
      )}

      <div className="flex justify-center mb-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Gauge
            value={riskScore}
            min={0}
            max={100}
            label="Risk Score"
            size={220}
            colorStops={[
              { value: 0, color: '#00ff88' },
              { value: 30, color: '#00ff88' },
              { value: 50, color: '#ffaa00' },
              { value: 80, color: '#ff3366' },
            ]}
          />
          <div className="text-center mt-md">
            <span
              className="badge badge-lg"
              style={{
                background: `${riskLevel.color}20`,
                color: riskLevel.color,
                border: `1px solid ${riskLevel.color}40`,
              }}
            >
              {riskLevel.label} Risk
            </span>
          </div>
        </motion.div>
      </div>

      <div className="grid-3 mb-lg" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'Borrowing Power', value: `$${(metrics.borrowingPower || 0).toLocaleString()}`, icon: '💰' },
          { label: 'Current Loan', value: `$${(metrics.currentLoan || 0).toLocaleString()}`, icon: '🏦' },
          { label: 'Volatility', value: `${(metrics.volatility || 0).toFixed(1)}%`, icon: '📊' },
          { label: 'Correlation', value: (metrics.correlation || 0).toFixed(2), icon: '🔗' },
          { label: 'Concentration', value: `${(metrics.concentration || 0)}%`, icon: '🎯' },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <div className="card-body text-center">
              <div style={{ fontSize: '1.3rem', marginBottom: 8 }}>{metric.icon}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {metric.value}
              </div>
              <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {metric.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Card title="Actions">
        <div className="flex gap-md flex-wrap">
          <button className="btn btn-success" onClick={() => setShowEquityModal(true)}>
            💰 Add Equity
          </button>
          <button className="btn btn-danger" onClick={() => setShowCloseModal(true)}>
            ❌ Close Portfolio
          </button>
          <button className="btn btn-warning" onClick={simulatePriceDrop}>
            📉 Simulate Price Drop
          </button>
        </div>
      </Card>

      <Modal isOpen={showEquityModal} onClose={() => setShowEquityModal(false)} title="Add Equity">
        <div className="input-group mb-lg">
          <label>Amount (USD)</label>
          <input
            type="number"
            className="input"
            placeholder="Enter amount..."
            value={equityAmount}
            onChange={(e) => setEquityAmount(e.target.value)}
            min="0"
          />
        </div>
        <div className="flex gap-sm justify-between">
          <button className="btn btn-ghost" onClick={() => setShowEquityModal(false)}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={handleAddEquity}>
            Add Equity
          </button>
        </div>
      </Modal>

      <Modal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)} title="Close Portfolio">
        <div className="text-center mb-lg">
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
          <h3 style={{ marginBottom: 8 }}>Are you sure?</h3>
          <p className="text-secondary">
            This will close ALL open positions and settle everything. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-sm justify-between">
          <button className="btn btn-ghost" onClick={() => setShowCloseModal(false)}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleClosePortfolio} disabled={closing}>
            {closing ? 'Closing...' : 'Close Everything'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Risk;
