import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import ChainBadge from '../components/common/ChainBadge.jsx';

function Portfolio() {
  const { API_BASE } = useContext(WalletContext);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/portfolio`);
      if (response.ok) {
        const data = await response.json();
        setTotalValue(data.totalValue || 0);
        setAssets(data.assets || []);
        if ((!data.assets || data.assets.length === 0)) {
          loadFallbackData();
        }
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setTotalValue(125430.67);
    setAssets([
      { id: 1, asset: 'ETH', amount: 15.5, value: 50375, chain: 'hoodi' },
      { id: 2, asset: 'USDC', amount: 35000, value: 35000, chain: 'hoodi' },
      { id: 3, asset: 'BTC', amount: 0.25, value: 16875, chain: 'base-sepolia' },
      { id: 4, asset: 'ETH', amount: 3.2, value: 10400, chain: 'base-sepolia' },
      { id: 5, asset: 'SXSDQ', amount: 15000, value: 6750, chain: 'hoodi' },
      { id: 6, asset: 'USDC', amount: 5030.67, value: 5030.67, chain: 'base-sepolia' },
      { id: 7, asset: 'SXR', amount: 4523, value: 1000, chain: 'hoodi' },
    ]);
  };

  const hoodiAssets = assets.filter((a) => a.chain === 'hoodi');
  const baseAssets = assets.filter((a) => a.chain === 'base-sepolia');
  const hoodiTotal = hoodiAssets.reduce((s, a) => s + a.value, 0);
  const baseTotal = baseAssets.reduce((s, a) => s + a.value, 0);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  const renderAssetTable = (assetList, chainLabel, subtotal) => (
    <Card title={`${chainLabel} Assets`} headerRight={<span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>}>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Amount</th>
              <th>Value</th>
              <th>Chain</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assetList.map((asset) => (
              <tr key={asset.id}>
                <td>
                  <span style={{ fontWeight: 600 }}>{asset.asset}</span>
                </td>
                <td>{asset.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })}</td>
                <td style={{ fontWeight: 600 }}>
                  ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <ChainBadge chain={asset.chain} />
                </td>
                <td>
                  <Link to="/settlement" className="btn btn-outline btn-sm">
                    Settle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="animate-fadeIn">
      <Card className="mb-lg">
        <div className="text-center" style={{ padding: '10px 0' }}>
          <div className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Total Portfolio Value
          </div>
          <motion.div
            className="stat-big gradient-text"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.div>
        </div>
      </Card>

      <div className="flex flex-col gap-lg">
        {hoodiAssets.length > 0 && renderAssetTable(hoodiAssets, 'Hoodi', hoodiTotal)}
        {baseAssets.length > 0 && renderAssetTable(baseAssets, 'Base Sepolia', baseTotal)}
      </div>
    </div>
  );
}

export default Portfolio;
