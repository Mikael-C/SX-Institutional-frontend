import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import ChainBadge from '../components/common/ChainBadge.jsx';
import { useToast } from '../components/common/Toast.jsx';

function OracleDashboard() {
  const { API_BASE } = useContext(WalletContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState({ btc: {}, eth: {} });
  const [disputeAlert, setDisputeAlert] = useState(false);
  const [twapFallback, setTwapFallback] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await fetch(`${API_BASE}/oracle/prices`);
      if (response.ok) {
        const data = await response.json();
        setPrices(data.prices || generateDefaultPrices());
        setDisputeAlert(data.disputeAlert || false);
        setTwapFallback(data.twapFallback || false);
      } else {
        setPrices(generateDefaultPrices());
      }
    } catch (error) {
      console.error('Failed to fetch oracle prices:', error);
      setPrices(generateDefaultPrices());
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  const generateDefaultPrices = () => {
    const btcBase = 67500 + (Math.random() - 0.5) * 200;
    const ethBase = 3250 + (Math.random() - 0.5) * 50;
    return {
      btc: {
        unified: btcBase,
        change: (Math.random() - 0.4) * 3,
        feeds: [
          { name: 'Chainlink Feed', chain: 'hoodi', price: btcBase + (Math.random() - 0.5) * 30 },
          { name: 'Pyth Feed', chain: 'hoodi', price: btcBase + (Math.random() - 0.5) * 30 },
          { name: 'Band Protocol', chain: 'base-sepolia', price: btcBase + (Math.random() - 0.5) * 30 },
        ],
      },
      eth: {
        unified: ethBase,
        change: (Math.random() - 0.4) * 3,
        feeds: [
          { name: 'Chainlink Feed', chain: 'hoodi', price: ethBase + (Math.random() - 0.5) * 15 },
          { name: 'Pyth Feed', chain: 'hoodi', price: ethBase + (Math.random() - 0.5) * 15 },
          { name: 'Band Protocol', chain: 'base-sepolia', price: ethBase + (Math.random() - 0.5) * 15 },
        ],
      },
    };
  };

  const simulateDispute = () => {
    setDisputeAlert(true);
    addToast('Dispute detected! Feed deviation exceeds 0.5%', 'error');
    const newPrices = { ...prices };
    if (newPrices.btc && newPrices.btc.feeds && newPrices.btc.feeds.length > 2) {
      newPrices.btc.feeds[2].price = newPrices.btc.unified * 1.008;
    }
    setPrices({ ...newPrices });
  };

  const simulateTwap = () => {
    setTwapFallback(true);
    addToast('TWAP fallback activated — oracle feed unresponsive', 'warning');
  };

  const formatPrice = (price) => {
    return '$' + Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderPriceSection = (asset, label) => {
    const data = prices[asset];
    if (!data || !data.unified) return null;
    const changePositive = (data.change || 0) >= 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card title={`${label} / USD`}>
          <div className="text-center mb-lg">
            <div className="stat-big" style={{ color: 'var(--text-primary)', marginBottom: 8 }}>
              {formatPrice(data.unified)}
            </div>
            <span className={changePositive ? 'price-up' : 'price-down'} style={{ fontSize: '1rem', fontWeight: 600 }}>
              {changePositive ? '▲' : '▼'} {Math.abs(data.change || 0).toFixed(2)}%
            </span>
          </div>

          <div className="grid-3" style={{ gap: 12 }}>
            {(data.feeds || []).map((feed, idx) => {
              const deviation = data.unified > 0 ? ((feed.price - data.unified) / data.unified * 100) : 0;
              const isAnomalous = Math.abs(deviation) > 0.5;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    border: isAnomalous ? '1px solid var(--accent-danger)' : '1px solid var(--glass-border)',
                  }}
                >
                  <div className="card-body" style={{ padding: 14 }}>
                    <div className="flex justify-between items-center mb-sm">
                      <span className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {feed.name}
                      </span>
                      <ChainBadge chain={feed.chain} />
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: isAnomalous ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                      {formatPrice(feed.price)}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: 4 }}>
                      Deviation: <span style={{ color: isAnomalous ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                        {deviation >= 0 ? '+' : ''}{deviation.toFixed(4)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    );
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
      {disputeAlert && (
        <div className="alert-banner alert-danger pulse" style={{ marginBottom: 20 }}>
          <span style={{ fontSize: '1.2rem' }}>🚨</span>
          <span>
            <strong>Dispute Alert:</strong> Oracle feed deviation exceeds 0.5%. Manual verification may be required.
          </span>
        </div>
      )}

      {twapFallback && (
        <div className="alert-banner alert-warning" style={{ marginBottom: 20 }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <span>
            <strong>TWAP Fallback Active:</strong> Primary oracle feed unresponsive. Using Time-Weighted Average Price.
          </span>
        </div>
      )}

      <div className="flex justify-between items-center mb-lg">
        <div>
          <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
            Last updated: {lastUpdate.toLocaleTimeString()} · Auto-refresh every 5s
          </p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-danger btn-sm" onClick={simulateDispute}>
            Simulate Dispute
          </button>
          <button className="btn btn-warning btn-sm" onClick={simulateTwap}>
            Simulate TWAP Fallback
          </button>
        </div>
      </div>

      <div className="grid-2 mb-lg">
        {renderPriceSection('btc', 'BTC')}
        {renderPriceSection('eth', 'ETH')}
      </div>
    </div>
  );
}

export default OracleDashboard;
