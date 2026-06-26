import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import Gauge from '../components/common/Gauge.jsx';
import ChainBadge from '../components/common/ChainBadge.jsx';

function FrogMeter() {
  const { API_BASE } = useContext(WalletContext);
  const [loading, setLoading] = useState(true);
  const [frogScore, setFrogScore] = useState(128);
  const [components, setComponents] = useState({});
  const [chartData, setChartData] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    fetchFrogData();
  }, []);

  const fetchFrogData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/frog`);
      if (response.ok) {
        const data = await response.json();
        setFrogScore(data.score || 128);
        setComponents(data.components || {});
        setChartData(data.chartData || []);
        setHistoryData(data.historyData || []);
        if (!data.components) loadFallbackData();
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch FROG data:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setFrogScore(128);
    setComponents({
      fundingRate: { value: 0.012, signal: 'bullish' },
      openInterest: { value: 2450000000, signal: 'bullish' },
      spotPremium: { value: -0.35, signal: 'bearish' },
    });

    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        oi: 2200000000 + Math.random() * 500000000,
        fundingRate: 0.005 + Math.random() * 0.015,
        spotPremium: (Math.random() - 0.5) * 2,
      });
    }
    setChartData(days);

    const hist = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      hist.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: 80 + Math.random() * 120,
      });
    }
    setHistoryData(hist);
  };

  const getInterpretation = () => {
    if (frogScore < 50) return { text: 'Extremely Bearish — High caution advised', color: '#ff0000' };
    if (frogScore < 100) return { text: 'Bearish — Market showing weakness', color: '#ff6600' };
    if (frogScore < 150) return { text: 'Bullish — Favorable market conditions', color: '#00ff88' };
    return { text: 'Extremely Bullish — Strong market momentum', color: '#00ff00' };
  };

  const interpretation = getInterpretation();

  const formatOI = (val) => {
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(0)}M`;
    return `$${val.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          fontSize: '0.8rem',
        }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 6 }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, marginBottom: 2 }}>
              {entry.name}: {typeof entry.value === 'number' && entry.value > 1000000
                ? formatOI(entry.value)
                : typeof entry.value === 'number'
                  ? entry.value.toFixed(4)
                  : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
      <div className="flex justify-center mb-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Gauge
            value={frogScore}
            min={0}
            max={200}
            label="FROG Meter"
            size={240}
            strokeWidth={18}
            colorStops={[
              { value: 0, color: '#ff0000' },
              { value: 50, color: '#ff6600' },
              { value: 100, color: '#00ff88' },
              { value: 150, color: '#00ff00' },
            ]}
          />
          <div className="text-center mt-md">
            <div style={{ fontSize: '1rem', fontWeight: 600, color: interpretation.color }}>
              {interpretation.text}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid-3 mb-lg">
        <Card title="Funding Rate">
          <div className="text-center">
            <div className="stat-medium" style={{ color: 'var(--accent-primary)', marginBottom: 8 }}>
              {((components.fundingRate?.value || 0) * 100).toFixed(4)}%
            </div>
            <span className={`badge badge-lg ${components.fundingRate?.signal === 'bullish' ? 'badge-success' : 'badge-danger'}`}>
              {components.fundingRate?.signal === 'bullish' ? '▲ Bullish' : '▼ Bearish'}
            </span>
          </div>
        </Card>

        <Card title="Open Interest">
          <div className="text-center">
            <div className="stat-medium" style={{ color: 'var(--accent-success)', marginBottom: 8 }}>
              {formatOI(components.openInterest?.value || 0)}
            </div>
            <span className={`badge badge-lg ${components.openInterest?.signal === 'bullish' ? 'badge-success' : 'badge-danger'}`}>
              {components.openInterest?.signal === 'bullish' ? '▲ Bullish' : '▼ Bearish'}
            </span>
          </div>
        </Card>

        <Card title="Spot Premium">
          <div className="text-center">
            <div className="stat-medium" style={{ color: 'var(--accent-warning)', marginBottom: 8 }}>
              {(components.spotPremium?.value || 0).toFixed(2)}%
            </div>
            <span className={`badge badge-lg ${components.spotPremium?.signal === 'bullish' ? 'badge-success' : 'badge-danger'}`}>
              {components.spotPremium?.signal === 'bullish' ? '▲ Bullish' : '▼ Bearish'}
            </span>
          </div>
        </Card>
      </div>

      <Card title="30-Day Component Trends" className="mb-lg">
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={formatOI} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
              <Line yAxisId="left" type="monotone" dataKey="oi" name="Open Interest" stroke="#00ff88" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="fundingRate" name="Funding Rate" stroke="#00d4ff" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="spotPremium" name="Spot Premium" stroke="#ffaa00" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Historical FROG Scores" className="mb-lg">
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 200]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="score"
                name="FROG Score"
                radius={[4, 4, 0, 0]}
                fill="#00d4ff"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Chain Breakdown">
        <div className="grid-2">
          <div className="flex items-center justify-between" style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center gap-md">
              <ChainBadge chain="hoodi" />
              <span style={{ fontWeight: 600 }}>Hoodi Contribution</span>
            </div>
            <span className="stat-medium" style={{ color: 'var(--accent-success)' }}>62%</span>
          </div>
          <div className="flex items-center justify-between" style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center gap-md">
              <ChainBadge chain="base-sepolia" />
              <span style={{ fontWeight: 600 }}>Base Sepolia Contribution</span>
            </div>
            <span className="stat-medium" style={{ color: 'var(--accent-primary)' }}>38%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default FrogMeter;
