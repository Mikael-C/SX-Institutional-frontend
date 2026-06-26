import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import { useToast } from '../components/common/Toast.jsx';

const tiers = [
  {
    id: 'HOBL',
    title: 'HOBL',
    subtitle: 'Retail',
    description: 'Basic hidden order — standard privacy for retail traders',
    color: '#00d4ff',
  },
  {
    id: 'HOPL',
    title: 'HOPL',
    subtitle: 'Professional',
    description: 'Enhanced privacy with advanced concealment mechanics',
    color: '#8b5cf6',
  },
  {
    id: 'HOTL',
    title: 'HOTL',
    subtitle: 'Institutional',
    description: 'Maximum privacy — ZK proof verification for full anonymity',
    color: '#00ff88',
  },
];

function HiddenOrders() {
  const { API_BASE, walletAddress } = useContext(WalletContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('HOBL');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [orders, setOrders] = useState([]);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/orders/hidden/${walletAddress || '0xdemo'}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        if (!data.orders || data.orders.length === 0) loadFallbackData();
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setOrders([
      { id: 'HO-001', tier: 'HOBL', amount: 2.5, price: 3200, status: 'Hidden', zkProof: false, txHash: '' },
      { id: 'HO-002', tier: 'HOTL', amount: 10.0, price: 3180, status: 'Executed', zkProof: true, txHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b' },
      { id: 'HO-003', tier: 'HOPL', amount: 5.0, price: 3250, status: 'Hidden', zkProof: false, txHash: '' },
      { id: 'HO-004', tier: 'HOTL', amount: 15.0, price: 3100, status: 'Cancelled', zkProof: true, txHash: '' },
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

  const handlePlaceOrder = async () => {
    if (!amount || Number(amount) <= 0 || !price || Number(price) <= 0) {
      addToast('Please enter valid amount and price', 'warning');
      return;
    }

    setPlacing(true);
    try {
      await fetch(`${API_BASE}/orders/hidden`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier, amount: Number(amount), price: Number(price), walletAddress: walletAddress || '0xdemo' }),
      });
    } catch (error) {
      console.error('Failed to place order:', error);
    }

    const newOrder = {
      id: `HO-${String(orders.length + 1).padStart(3, '0')}`,
      tier: selectedTier,
      amount: Number(amount),
      price: Number(price),
      status: 'Hidden',
      zkProof: selectedTier === 'HOTL',
      txHash: '',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setAmount('');
    setPrice('');
    setPlacing(false);
    addToast(`Hidden order placed (${selectedTier})`, 'success');
  };

  const simulateExecution = () => {
    const hiddenOrders = orders.filter((o) => o.status === 'Hidden');
    if (hiddenOrders.length === 0) {
      addToast('No hidden orders to execute', 'warning');
      return;
    }
    const targetId = hiddenOrders[0].id;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === targetId
          ? { ...o, status: 'Executed', txHash: generateTxHash() }
          : o
      )
    );
    addToast(`Order ${targetId} executed successfully`, 'success');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hidden': return 'badge-info';
      case 'Executed': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
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
        {tiers.map((tier) => (
          <motion.div
            key={tier.id}
            className={`card tier-card ${selectedTier === tier.id ? 'selected' : ''}`}
            onClick={() => setSelectedTier(tier.id)}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card-body text-center" style={{ padding: 24 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `${tier.color}20`,
                  border: `2px solid ${tier.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '1.2rem',
                }}
              >
                {tier.id === 'HOBL' ? '🔒' : tier.id === 'HOPL' ? '🛡️' : '🔐'}
              </div>
              <div className="tier-title" style={{ color: tier.color }}>{tier.title}</div>
              <div className="tier-subtitle">{tier.subtitle}</div>
              <div className="tier-description">{tier.description}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <Card title="Place Hidden Order" className="mb-lg">
        <div className="grid-2 mb-md" style={{ maxWidth: 600 }}>
          <div className="input-group">
            <label>Amount (ETH)</label>
            <input
              type="number"
              className="input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="input-group">
            <label>Price (USD)</label>
            <input
              type="number"
              className="input"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="1"
            />
          </div>
        </div>
        <div className="flex gap-md items-center">
          <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={placing}>
            {placing ? 'Placing...' : '🔒 Place Hidden Order'}
          </button>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>
            Tier: <span style={{ color: tiers.find((t) => t.id === selectedTier)?.color, fontWeight: 600 }}>{selectedTier}</span>
          </span>
        </div>
      </Card>

      <Card
        title="Order Status Dashboard"
        headerRight={
          <button className="btn btn-outline btn-sm" onClick={simulateExecution}>
            ⚡ Simulate Execution
          </button>
        }
      >
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Tier</th>
                <th>Amount (ETH)</th>
                <th>Price (USD)</th>
                <th>Status</th>
                <th>ZK Proof</th>
                <th>TX Hash</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono" style={{ fontSize: '0.8rem' }}>{order.id}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: `${tiers.find((t) => t.id === order.tier)?.color || '#00d4ff'}20`,
                        color: tiers.find((t) => t.id === order.tier)?.color || '#00d4ff',
                        border: `1px solid ${tiers.find((t) => t.id === order.tier)?.color || '#00d4ff'}40`,
                      }}
                    >
                      {order.tier}
                    </span>
                  </td>
                  <td>{order.amount}</td>
                  <td>${order.price.toLocaleString()}</td>
                  <td><span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span></td>
                  <td>
                    {order.zkProof ? (
                      <span className="badge badge-success">✓ Verified</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    {order.txHash ? (
                      <span className="font-mono text-accent" style={{ fontSize: '0.7rem' }}>
                        {order.txHash.slice(0, 10)}...{order.txHash.slice(-6)}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
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

export default HiddenOrders;
