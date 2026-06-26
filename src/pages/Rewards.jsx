import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import Modal from '../components/common/Modal.jsx';
import { useToast } from '../components/common/Toast.jsx';

const conversionTokens = ['ETH', 'BTC', 'SOL', 'ECUBES', '$300M'];
const tokenRates = { ETH: 0.000308, BTC: 0.0000148, SOL: 0.0066, ECUBES: 2.2, '$300M': 0.0000033 };

function Rewards() {
  const { API_BASE, walletAddress } = useContext(WalletContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [totalSXR, setTotalSXR] = useState(4523);
  const [displaySXR, setDisplaySXR] = useState(0);
  const [rewardsHistory, setRewardsHistory] = useState([]);
  const [convertToken, setConvertToken] = useState('ETH');
  const [convertAmount, setConvertAmount] = useState('');
  const [showConvertSuccess, setShowConvertSuccess] = useState(false);
  const [convertResult, setConvertResult] = useState({ token: '', amount: 0 });

  useEffect(() => {
    fetchRewardsData();
  }, []);

  useEffect(() => {
    if (totalSXR > 0) {
      let current = 0;
      const increment = totalSXR / 60;
      const timer = setInterval(() => {
        current += increment;
        if (current >= totalSXR) {
          current = totalSXR;
          clearInterval(timer);
        }
        setDisplaySXR(Math.floor(current));
      }, 16);
      return () => clearInterval(timer);
    }
  }, [totalSXR]);

  const fetchRewardsData = async () => {
    setLoading(true);
    try {
      const addr = walletAddress || '0xdemo';
      const response = await fetch(`${API_BASE}/rewards/${addr}`);
      if (response.ok) {
        const data = await response.json();
        setTotalSXR(data.totalSXR || 4523);
        setRewardsHistory(data.history || []);
        if (!data.history || data.history.length === 0) loadFallbackData();
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setTotalSXR(4523);
    setRewardsHistory([
      { id: 1, date: '2024-06-24', action: 'Swap', volume: 2500, reward: 2500, cumulative: 4523 },
      { id: 2, date: '2024-06-24', action: 'Trade', volume: 10000, reward: 10000, cumulative: 2023 },
      { id: 3, date: '2024-06-23', action: 'Lend', volume: 5000, reward: 5000, cumulative: -7977 },
      { id: 4, date: '2024-06-23', action: 'Swap', volume: 1200, reward: 1200, cumulative: -12977 },
      { id: 5, date: '2024-06-22', action: 'Trade', volume: 8000, reward: 8000, cumulative: -14177 },
      { id: 6, date: '2024-06-22', action: 'Swap', volume: 3500, reward: 3500, cumulative: -22177 },
    ]);
  };

  const previewAmount = convertAmount ? Number(convertAmount) * (tokenRates[convertToken] || 0) : 0;

  const handleConvert = async () => {
    if (!convertAmount || Number(convertAmount) <= 0) {
      addToast('Please enter a valid SXR amount', 'warning');
      return;
    }
    if (Number(convertAmount) > totalSXR) {
      addToast('Insufficient SXR balance', 'error');
      return;
    }

    try {
      await fetch(`${API_BASE}/rewards/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(convertAmount), targetToken: convertToken }),
      });
    } catch (error) {
      console.error('Failed to convert:', error);
    }

    setConvertResult({ token: convertToken, amount: previewAmount });
    setTotalSXR((prev) => prev - Number(convertAmount));
    setConvertAmount('');
    setShowConvertSuccess(true);
    addToast(`Converted ${Number(convertAmount).toLocaleString()} SXR to ${previewAmount.toFixed(6)} ${convertToken}`, 'success');
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
      <div className="grid-3 mb-lg">
        <Card>
          <div className="text-center" style={{ padding: '16px 0' }}>
            <div className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Total SXR Earned
            </div>
            <motion.div
              className="stat-big gradient-text"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {displaySXR.toLocaleString()}
            </motion.div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 8 }}>SXR Tokens</div>
          </div>
        </Card>

        <Card>
          <div className="text-center" style={{ padding: '16px 0' }}>
            <div className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Earn Rate
            </div>
            <div className="stat-medium" style={{ color: 'var(--accent-primary)', marginBottom: 8 }}>
              1 SXR per $1
            </div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>traded volume</div>
          </div>
        </Card>

        <Card>
          <div className="text-center" style={{ padding: '16px 0' }}>
            <div className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Reward Policy
            </div>
            <span
              className="badge badge-lg"
              style={{
                background: 'rgba(0, 255, 136, 0.1)',
                color: 'var(--accent-success)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                fontSize: '0.85rem',
                padding: '8px 20px',
              }}
            >
              ∞ Unlimited & Uncapped
            </span>
          </div>
        </Card>
      </div>

      <div className="grid-2 mb-lg" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Card title="Convert SXR">
          <div className="input-group mb-md">
            <label>Target Token</label>
            <select
              className="select"
              value={convertToken}
              onChange={(e) => setConvertToken(e.target.value)}
            >
              {conversionTokens.map((token) => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>

          <div className="input-group mb-md">
            <label>Amount (SXR)</label>
            <input
              type="number"
              className="input"
              placeholder="Enter SXR amount..."
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              min="0"
              max={totalSXR}
            />
          </div>

          {convertAmount && Number(convertAmount) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-md"
              style={{
                padding: 16,
                background: 'rgba(0, 212, 255, 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 212, 255, 0.15)',
              }}
            >
              <div className="flex justify-between items-center mb-sm">
                <span className="text-secondary">You will receive</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
                  {previewAmount.toFixed(6)} {convertToken}
                </span>
              </div>
            </motion.div>
          )}

          <div
            style={{
              padding: 12,
              background: 'rgba(0, 255, 136, 0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent-success)' }}>44% APY</span>
            <span className="text-secondary" style={{ fontSize: '0.75rem', display: 'block' }}>
              Current staking yield
            </span>
          </div>

          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={handleConvert}
            disabled={!convertAmount || Number(convertAmount) <= 0}
          >
            Convert SXR
          </button>
        </Card>

        <Card title="Recent Rewards">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Volume</th>
                  <th>SXR Earned</th>
                </tr>
              </thead>
              <tbody>
                {rewardsHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td className="text-secondary">{entry.date}</td>
                    <td><span className="badge badge-info">{entry.action}</span></td>
                    <td>${entry.volume.toLocaleString()}</td>
                    <td style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                      +{entry.reward.toLocaleString()} SXR
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal isOpen={showConvertSuccess} onClose={() => setShowConvertSuccess(false)} title="Conversion Successful">
        <div className="text-center">
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>SXR Converted</h3>
          <p className="text-secondary mb-md">
            You received <strong style={{ color: 'var(--accent-primary)' }}>{convertResult.amount.toFixed(6)} {convertResult.token}</strong>
          </p>
          <button className="btn btn-primary" onClick={() => setShowConvertSuccess(false)}>
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Rewards;
