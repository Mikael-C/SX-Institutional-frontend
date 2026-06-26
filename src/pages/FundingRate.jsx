import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import { useToast } from '../components/common/Toast.jsx';

function FundingRate() {
  const { API_BASE } = useContext(WalletContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fundingRate, setFundingRate] = useState('+0.0100');
  const [totalPaid, setTotalPaid] = useState(245.8);
  const [countdown, setCountdown] = useState(3600);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchFundingData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) return 28800;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchFundingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/funding`);
      if (response.ok) {
        const data = await response.json();
        setFundingRate(data.currentRate || '+0.0100');
        setTotalPaid(data.totalPaid || 245.8);
        setCountdown(data.nextDeduction || 3600);
        setHistory(data.history || []);
        if (!data.history || data.history.length === 0) loadFallbackData();
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch funding data:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setHistory([
      { id: 1, date: '2024-06-24 19:00', amount: -12.5, marginAfter: 48750 },
      { id: 2, date: '2024-06-24 11:00', amount: -11.8, marginAfter: 48762.5 },
      { id: 3, date: '2024-06-24 03:00', amount: -13.2, marginAfter: 48774.3 },
      { id: 4, date: '2024-06-23 19:00', amount: -10.9, marginAfter: 48787.5 },
      { id: 5, date: '2024-06-23 11:00', amount: -14.1, marginAfter: 48798.4 },
      { id: 6, date: '2024-06-23 03:00', amount: -12.3, marginAfter: 48812.5 },
      { id: 7, date: '2024-06-22 19:00', amount: -11.5, marginAfter: 48824.8 },
      { id: 8, date: '2024-06-22 11:00', amount: -13.7, marginAfter: 48836.3 },
    ]);
  };

  const formatCountdown = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleApplyFunding = async () => {
    try {
      await fetch(`${API_BASE}/funding/apply`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to apply funding:', error);
    }

    const newDeduction = -(Math.random() * 5 + 10).toFixed(2);
    const lastMargin = history.length > 0 ? history[0].marginAfter : 48750;
    setHistory((prev) => [
      {
        id: Date.now(),
        date: new Date().toLocaleString(),
        amount: Number(newDeduction),
        marginAfter: lastMargin + Number(newDeduction),
      },
      ...prev,
    ]);
    setTotalPaid((prev) => prev + Math.abs(Number(newDeduction)));
    setCountdown(28800);
    addToast(`Funding applied: ${newDeduction} USDC deducted`, 'info');
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
              Current Funding Rate
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="stat-big"
              style={{ color: fundingRate.startsWith('+') ? 'var(--accent-success)' : 'var(--accent-danger)' }}
            >
              {fundingRate}%
            </motion.div>
          </div>
        </Card>

        <Card>
          <div className="text-center" style={{ padding: '16px 0' }}>
            <div className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Next Deduction In
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="stat-big font-mono"
              style={{ color: 'var(--accent-primary)' }}
            >
              {formatCountdown(countdown)}
            </motion.div>
          </div>
        </Card>

        <Card>
          <div className="text-center" style={{ padding: '16px 0' }}>
            <div className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Total Funding Paid
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="stat-big"
              style={{ color: 'var(--accent-warning)' }}
            >
              ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </motion.div>
          </div>
        </Card>
      </div>

      <div className="mb-lg">
        <button className="btn btn-primary" onClick={handleApplyFunding}>
          ⚡ Apply Funding (Demo)
        </button>
      </div>

      <Card title="Deduction History">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Margin After</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td className="text-secondary">{entry.date}</td>
                  <td style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>
                    {entry.amount < 0 ? '' : '+'}{entry.amount.toFixed(2)} USDC
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    ${entry.marginAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default FundingRate;
