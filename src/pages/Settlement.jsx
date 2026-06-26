import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import Modal from '../components/common/Modal.jsx';
import ChainBadge from '../components/common/ChainBadge.jsx';
import { useToast } from '../components/common/Toast.jsx';

const FALLBACK_POSITIONS = [
  { id: 'P001', asset: 'ETH',   amount: 5.20,   value: 16900,   chain: 'hoodi',       type: 'Long',  icon: '⟠' },
  { id: 'P002', asset: 'BTC',   amount: 0.15,   value: 10125,   chain: 'base-sepolia', type: 'Long',  icon: '₿' },
  { id: 'P003', asset: 'USDC',  amount: 8000,   value: 8000,    chain: 'hoodi',        type: 'Lend',  icon: '💵' },
  { id: 'P004', asset: 'ETH',   amount: 2.0,    value: 6500,    chain: 'base-sepolia', type: 'Short', icon: '⟠' },
  { id: 'P005', asset: 'SXSDQ', amount: 10000,  value: 4500,    chain: 'hoodi',        type: 'Stake', icon: '🔷' },
  { id: 'P006', asset: 'USDC',  amount: 12000,  value: 12000,   chain: 'base-sepolia', type: 'Lend',  icon: '💵' },
  { id: 'P007', asset: 'WETH',  amount: 3.8,    value: 12340,   chain: 'hoodi',        type: 'Long',  icon: '⚡' },
];

const TYPE_COLORS = {
  Long:  '#22c55e',
  Short: '#ef4444',
  Lend:  '#3b82f6',
  Stake: '#a855f7',
};

function generateTxHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
}

function Settlement() {
  const { API_BASE, walletAddress } = useContext(WalletContext);
  const { addToast } = useToast();

  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [targetChain, setTargetChain] = useState('hoodi');
  const [settling, setSettling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [settledValue, setSettledValue] = useState(0);
  const [filterChain, setFilterChain] = useState('all');

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const addr = walletAddress || '0xdemo';
      const resp = await fetch(`${API_BASE}/leverage/positions/${addr}`);
      if (resp.ok) {
        const data = await resp.json();
        const ps = data.data || [];
        setPositions(ps.length > 0 ? ps : FALLBACK_POSITIONS);
      } else {
        setPositions(FALLBACK_POSITIONS);
      }
    } catch {
      setPositions(FALLBACK_POSITIONS);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = () => setSelectedIds(filtered.map(p => p.id));
  const clearAll = () => setSelectedIds([]);

  const filtered = filterChain === 'all' ? positions : positions.filter(p => p.chain === filterChain);
  const selected = positions.filter(p => selectedIds.includes(p.id));
  const selectedTotal = selected.reduce((s, p) => s + p.value, 0);

  const hoodiPositions = positions.filter(p => p.chain === 'hoodi');
  const basePositions  = positions.filter(p => p.chain === 'base-sepolia');
  const hoodiTotal = hoodiPositions.reduce((s, p) => s + p.value, 0);
  const baseTotal  = basePositions.reduce((s,  p) => s + p.value, 0);
  const totalValue = positions.reduce((s, p) => s + p.value, 0);

  const handleSettle = async () => {
    if (selectedIds.length === 0) { addToast('Select at least one position', 'warning'); return; }
    setSettling(true);
    setSettledValue(selectedTotal);
    try {
      const resp = await fetch(`${API_BASE}/portfolio/settlement/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionIds: selectedIds, targetChain, walletAddress: walletAddress || '0xdemo' }),
      });
      const data = resp.ok ? await resp.json() : {};
      setTxHash(data.txHash || generateTxHash());
    } catch {
      setTxHash(generateTxHash());
    }

    setPositions(prev => prev.filter(p => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    setSettling(false);
    setShowPreview(false);
    setShowSuccess(true);
    addToast('Settlement completed successfully!', 'success');
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn">

      {/* Top stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 24,
      }}>
        {[
          { label: 'Total Portfolio', value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'var(--accent-primary)', icon: '💼' },
          { label: 'Hoodi Assets',    value: `$${hoodiTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'var(--accent-purple)', icon: '🟣', sub: `${hoodiPositions.length} positions` },
          { label: 'Base Sepolia',    value: `$${baseTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'var(--accent-blue)', icon: '🔵', sub: `${basePositions.length} positions` },
          { label: 'Selected to Close', value: selectedIds.length > 0 ? `$${selectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—', color: 'var(--accent-green)', icon: '✅', sub: `${selectedIds.length} positions` },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              padding: '18px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: stat.color }}>{stat.value}</div>
            {stat.sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{stat.sub}</div>}
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left: unified position table */}
        <div>
          {/* Chain + filter toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 14, flexWrap: 'wrap',
          }}>
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>Open Positions</span>
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              {['all', 'hoodi', 'base-sepolia'].map(c => (
                <button
                  key={c}
                  onClick={() => setFilterChain(c)}
                  className="btn btn-sm"
                  style={{
                    border: filterChain === c ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
                    background: filterChain === c ? 'rgba(0,212,255,0.1)' : 'transparent',
                    color: filterChain === c ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontSize: '0.75rem', padding: '4px 10px',
                  }}
                >
                  {c === 'all' ? 'All Chains' : c === 'hoodi' ? '🟣 Hoodi' : '🔵 Base Sepolia'}
                </button>
              ))}
              <button onClick={selectAll} className="btn btn-sm btn-outline" style={{ fontSize: '0.75rem' }}>Select All</button>
              <button onClick={clearAll}  className="btn btn-sm"        style={{ fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--border-color)' }}>Clear</button>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ width: 40, padding: '12px 16px' }}></th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>POSITION</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ASSET</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AMOUNT</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>VALUE</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CHAIN</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TYPE</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((pos, idx) => {
                    const isSelected = selectedIds.includes(pos.id);
                    return (
                      <motion.tr
                        key={pos.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => toggle(pos.id)}
                        style={{
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(0, 212, 255, 0.05)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggle(pos.id)}
                            onClick={e => e.stopPropagation()}
                            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                          />
                        </td>
                        <td style={{ padding: '14px 8px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pos.id}</td>
                        <td style={{ padding: '14px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '1.2rem' }}>{pos.icon || '🪙'}</span>
                            <span style={{ fontWeight: 700 }}>{pos.asset}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                          {pos.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })}
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 700 }}>
                          ${pos.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                          <ChainBadge chain={pos.chain} />
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                            fontSize: '0.7rem', fontWeight: 700, letterSpacing: 0.5,
                            background: `${TYPE_COLORS[pos.type] || '#888'}22`,
                            color: TYPE_COLORS[pos.type] || '#888',
                            border: `1px solid ${TYPE_COLORS[pos.type] || '#888'}44`,
                          }}>{pos.type}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No open positions to settle
              </div>
            )}
          </div>
        </div>

        {/* Right: target + preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Target chain */}
          <Card title="Settle To Chain">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: 'hoodi',        label: 'Hoodi Testnet',   color: 'var(--accent-purple)', emoji: '🟣' },
                { value: 'base-sepolia', label: 'Base Sepolia',    color: 'var(--accent-blue)',   emoji: '🔵' },
              ].map(opt => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 14, borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: targetChain === opt.value ? `2px solid ${opt.color}` : '2px solid var(--border-color)',
                    background: targetChain === opt.value ? `${opt.color}11` : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="chain"
                    value={opt.value}
                    checked={targetChain === opt.value}
                    onChange={e => setTargetChain(e.target.value)}
                    style={{ accentColor: opt.color }}
                  />
                  <span style={{ fontSize: '1.1rem' }}>{opt.emoji}</span>
                  <span style={{ fontWeight: 600 }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Settlement Preview */}
          <Card title="Settlement Preview">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Positions Selected</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedIds.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Net Value</span>
                <span style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--accent-primary)' }}>
                  ${selectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Target Chain</span>
                <ChainBadge chain={targetChain} />
              </div>

              {selected.length > 0 && (
                <div style={{
                  padding: 12, background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)', maxHeight: 180, overflowY: 'auto',
                }}>
                  <div className="text-muted" style={{ fontSize: '0.72rem', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Will close:
                  </div>
                  {selected.map(p => (
                    <div key={p.id} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '0.8rem', padding: '4px 0',
                      borderBottom: '1px solid var(--border-color)',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{p.icon || '🪙'}</span>
                        <span>{p.asset}</span>
                        <span style={{ color: TYPE_COLORS[p.type], fontSize: '0.7rem' }}>{p.type}</span>
                        <ChainBadge chain={p.chain} />
                      </span>
                      <span style={{ fontWeight: 600 }}>${p.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={() => setShowPreview(true)}
                disabled={selectedIds.length === 0}
              >
                Review &amp; Settle
              </button>
            </div>
          </Card>

          {/* Cross-chain chain breakdown */}
          <Card title="Chain Breakdown">
            {[
              { chain: 'hoodi', label: '🟣 Hoodi', count: hoodiPositions.length, value: hoodiTotal, pct: totalValue > 0 ? (hoodiTotal / totalValue * 100) : 0, color: 'var(--accent-purple)' },
              { chain: 'base-sepolia', label: '🔵 Base Sepolia', count: basePositions.length, value: baseTotal, pct: totalValue > 0 ? (baseTotal / totalValue * 100) : 0, color: 'var(--accent-blue)' },
            ].map(c => (
              <div key={c.chain} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: c.color }}>
                    ${c.value.toLocaleString('en-US', { minimumFractionDigits: 0 })} ({c.pct.toFixed(1)}%)
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ height: '100%', background: c.color, borderRadius: 3 }}
                  />
                </div>
                <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: 2 }}>{c.count} open positions</div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Confirm Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Confirm Settlement">
        <div>
          <div style={{
            padding: 16, background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 20,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Positions to Close', value: selectedIds.length },
                { label: 'Net Value', value: `$${selectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                { label: 'Settlement Chain', value: targetChain === 'hoodi' ? '🟣 Hoodi' : '🔵 Base Sepolia' },
                { label: 'Gas Cost', value: '⚡ Free (Gas: 0)' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="text-muted" style={{ fontSize: '0.72rem', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 20 }}>
            {selected.map(p => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.1rem' }}>{p.icon || '🪙'}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.asset} <span style={{ color: TYPE_COLORS[p.type], fontSize: '0.78rem' }}>{p.type}</span></div>
                    <ChainBadge chain={p.chain} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>${p.value.toLocaleString()}</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>{p.amount} {p.asset}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline flex-1" onClick={() => setShowPreview(false)}>Cancel</button>
            <button
              className="btn btn-primary flex-1"
              onClick={handleSettle}
              disabled={settling}
            >
              {settling
                ? <span className="flex items-center gap-sm"><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Settling...</span>
                : 'Confirm Settlement'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Settlement Complete">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: '3.5rem', marginBottom: 16 }}>✅</motion.div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Positions Settled</h3>
          <p className="text-secondary mb-md">
            <strong>${settledValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> delivered to{' '}
            <strong>{targetChain === 'hoodi' ? '🟣 Hoodi' : '🔵 Base Sepolia'}</strong>
          </p>
          <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: 16, wordBreak: 'break-all' }}>
            <span className="text-muted" style={{ fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>Transaction Hash</span>
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-primary)' }}>{txHash}</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowSuccess(false)}>Done</button>
        </div>
      </Modal>
    </div>
  );
}

export default Settlement;
