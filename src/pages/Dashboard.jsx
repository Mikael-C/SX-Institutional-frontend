import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import Gauge from '../components/common/Gauge.jsx';
import Modal from '../components/common/Modal.jsx';
import { useToast } from '../components/common/Toast.jsx';

function Dashboard() {
  const { walletAddress, connected, API_BASE } = useContext(WalletContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [stats, setStats] = useState({ totalAssets: 0, activePositions: 0, sxrEarned: 0, riskScore: 35 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [frogScore, setFrogScore] = useState(128);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('10000');
  const [depositToken, setDepositToken] = useState('USDC');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/portfolio`);
      if (response.ok) {
        const data = await response.json();
        setPortfolioValue(data.totalValue || 125430.67);
        setStats({
          totalAssets: data.totalAssets || 8,
          activePositions: data.activePositions || 3,
          sxrEarned: data.sxrEarned || 4523,
          riskScore: data.riskScore || 35,
        });
        setRecentActivity(data.recentActivity || []);
        setFrogScore(data.frogScore || 128);
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setPortfolioValue(125430.67);
    setStats({ totalAssets: 8, activePositions: 3, sxrEarned: 4523, riskScore: 35 });
    setFrogScore(128);
    setRecentActivity([
      { id: 1, type: 'Swap', description: 'USDC → ETH', amount: '$2,500', time: '2 min ago', status: 'success' },
      { id: 2, type: 'Lend', description: 'Deposited 1.5 ETH', amount: '$4,875', time: '15 min ago', status: 'success' },
      { id: 3, type: 'Trade', description: 'Long ETH 10x', amount: '$10,000', time: '1 hr ago', status: 'success' },
      { id: 4, type: 'Reward', description: 'SXR Earned', amount: '125 SXR', time: '2 hrs ago', status: 'info' },
      { id: 5, type: 'Settlement', description: 'Settled to Hoodi', amount: '$8,200', time: '5 hrs ago', status: 'success' },
    ]);
  };

  const shortenAddress = (addr) => {
    if (!addr) return 'Guest';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  const handleDeposit = () => {
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
      addToast('Please enter a valid amount', 'warning');
      return;
    }
    setPortfolioValue(prev => prev + Number(depositAmount));
    setRecentActivity(prev => [
      { id: Date.now(), type: 'Deposit', description: `Deposited ${depositAmount} ${depositToken}`, amount: `$${depositAmount}`, time: 'Just now', status: 'success' },
      ...prev
    ]);
    setShowDepositModal(false);
    addToast(`Successfully deposited ${depositAmount} ${depositToken} into SXUA`, 'success');
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 28 }}
      >
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>
          Welcome back, <span className="gradient-text">{connected ? shortenAddress(walletAddress) : 'Trader'}</span>
        </h1>
        <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
          Here&apos;s your trading overview
        </p>
      </motion.div>

      <Card className="mb-lg">
        <div className="text-center" style={{ padding: '10px 0' }}>
          <div className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Total Portfolio Value
          </div>
          <motion.div
            className="stat-big gradient-text"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.div>
        </div>
      </Card>

      <div className="grid-4 mb-lg">
        {[
          { label: 'Total Assets', value: stats.totalAssets, icon: '💎' },
          { label: 'Active Positions', value: stats.activePositions, icon: '📊' },
          { label: 'SXR Earned', value: stats.sxrEarned.toLocaleString(), icon: '🏆' },
          { label: 'Risk Score', value: `${stats.riskScore}/100`, icon: '⚠️' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
          >
            <div className="card-body" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
              <div className="stat-medium" style={{ color: 'var(--text-primary)', marginBottom: 6 }}>
                {stat.value}
              </div>
              <div className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid-3 mb-lg">
        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Recent Activity">
            {recentActivity.length === 0 ? (
              <p className="text-secondary">No recent activity</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td>
                          <span className="badge badge-info">{activity.type}</span>
                        </td>
                        <td>{activity.description}</td>
                        <td style={{ fontWeight: 600 }}>{activity.amount}</td>
                        <td className="text-secondary">{activity.time}</td>
                        <td>
                          <span className={`badge badge-${activity.status === 'success' ? 'success' : 'info'}`}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="FROG Score">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <Gauge
                value={frogScore}
                min={0}
                max={200}
                label="FROG Meter"
                size={140}
                colorStops={[
                  { value: 0, color: '#ff0000' },
                  { value: 50, color: '#ff6600' },
                  { value: 100, color: '#00ff88' },
                  { value: 150, color: '#00ff00' },
                ]}
              />
            </div>
            <div className="text-center mt-sm">
              <span className="badge badge-success badge-lg">Bullish Zone</span>
            </div>
          </Card>
        </div>
      </div>

      <Card title="Quick Actions">
        <div className="flex gap-md flex-wrap">
          <button className="btn btn-primary" onClick={() => setShowDepositModal(true)}>
            💵 Deposit
          </button>
          <Link to="/swap" className="btn btn-primary">
            🔄 Swap Tokens
          </Link>
          <Link to="/leverage" className="btn btn-outline">
            ⚡ Open Position
          </Link>
          <Link to="/lending" className="btn btn-outline">
            💰 Lend Assets
          </Link>
          <Link to="/rewards" className="btn btn-outline">
            🏆 View Rewards
          </Link>
        </div>
      </Card>

      <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title="Deposit into SXUA">
        <div className="input-group mb-md">
          <label>Token</label>
          <select className="select" value={depositToken} onChange={(e) => setDepositToken(e.target.value)}>
            <option value="USDC">USDC</option>
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
          </select>
        </div>
        <div className="input-group mb-lg">
          <label>Amount</label>
          <input
            type="number"
            className="input"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            min="0"
          />
        </div>
        <button className="btn btn-primary btn-block btn-lg" onClick={handleDeposit}>
          Confirm Deposit
        </button>
      </Modal>
    </div>
  );
}

export default Dashboard;
