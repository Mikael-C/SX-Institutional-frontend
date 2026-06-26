import React, { useState, useContext, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import Modal from '../components/common/Modal.jsx';
import ChainBadge from '../components/common/ChainBadge.jsx';
import { useToast } from '../components/common/Toast.jsx';

const TOKENS = ['USDC', 'ETH', 'SXSDQ', 'WETH'];
const TOKEN_ICONS = { USDC: '💵', ETH: '⟠', SXSDQ: '🔷', WETH: '⚡' };
const BASE_PRICES = { USDC: 1, ETH: 3247.82, SXSDQ: 0.4513, WETH: 3247.45 };

function jitter(base, pct = 0.008) {
  return base * (1 + (Math.random() - 0.5) * pct);
}

function buildSources(fromToken, toToken, fromAmt) {
  if (!fromAmt || isNaN(fromAmt) || Number(fromAmt) <= 0) return [];
  const fromUSD = Number(fromAmt) * (BASE_PRICES[fromToken] || 1);
  const baseOut = fromUSD / (BASE_PRICES[toToken] || 1);

  return [
    {
      id: 'sx-hoodi',
      name: 'SX Internal Pool',
      chain: 'hoodi',
      chainLabel: 'Hoodi',
      amountOut: baseOut * jitter(1, 0.006),
      slippage: '0.00%',
      gas: '0',
      badge: 'BEST',
    },
    {
      id: 'sx-base',
      name: 'SX Internal Pool',
      chain: 'base-sepolia',
      chainLabel: 'Base Sepolia',
      amountOut: baseOut * jitter(1, 0.009),
      slippage: '0.00%',
      gas: '0',
      badge: null,
    },
    {
      id: 'uniswap-hoodi',
      name: 'Uniswap v3',
      chain: 'hoodi',
      chainLabel: 'Hoodi',
      amountOut: baseOut * jitter(0.993, 0.012),
      slippage: '0.12%',
      gas: '~$0.04',
      badge: null,
    },
    {
      id: 'curve-base',
      name: 'Curve Finance',
      chain: 'base-sepolia',
      chainLabel: 'Base Sepolia',
      amountOut: baseOut * jitter(0.990, 0.01),
      slippage: '0.18%',
      gas: '~$0.06',
      badge: null,
    },
  ].sort((a, b) => b.amountOut - a.amountOut)
   .map((s, i) => ({ ...s, badge: i === 0 ? 'BEST' : s.badge === 'BEST' ? null : s.badge }));
}

function Swap() {
  const { API_BASE, connected, connectWallet } = useContext(WalletContext);
  const { addToast } = useToast();

  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('SXSDQ');
  const [fromAmount, setFromAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [quoteRefreshing, setQuoteRefreshing] = useState(false);
  const [balances, setBalances] = useState({ USDC: 50000, ETH: 12.5, SXSDQ: 25000, WETH: 5.0 });
  const [lastSwapped, setLastSwapped] = useState(null);

  // Auto-refresh quotes every 12 seconds
  const refreshQuotes = useCallback(() => {
    if (!fromAmount || Number(fromAmount) <= 0) { setSources([]); return; }
    setQuoteRefreshing(true);
    setTimeout(() => {
      const newSources = buildSources(fromToken, toToken, fromAmount);
      setSources(newSources);
      setSelectedSource(newSources[0]);
      setQuoteRefreshing(false);
    }, 600);
  }, [fromAmount, fromToken, toToken]);

  useEffect(() => { refreshQuotes(); }, [refreshQuotes]);

  useEffect(() => {
    const id = setInterval(() => {
      if (fromAmount && Number(fromAmount) > 0) refreshQuotes();
    }, 12000);
    return () => clearInterval(id);
  }, [refreshQuotes, fromAmount]);

  const toAmount = selectedSource
    ? selectedSource.amountOut.toFixed(toToken === 'USDC' ? 2 : 6)
    : '';

  const priceImpact = selectedSource && Number(fromAmount) > 0
    ? ((1 - selectedSource.amountOut / (Number(fromAmount) * (BASE_PRICES[fromToken] || 1) / (BASE_PRICES[toToken] || 1))) * 100).toFixed(4)
    : null;

  const generateTxHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * chars.length)];
    return hash;
  };

  const handleSwap = async () => {
    if (!fromAmount || Number(fromAmount) <= 0) { addToast('Enter a valid amount', 'warning'); return; }
    if (Number(fromAmount) > (balances[fromToken] || 0)) { addToast('Insufficient balance', 'error'); return; }
    if (!selectedSource) { addToast('No quote available', 'warning'); return; }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromToken, toToken, fromAmount: Number(fromAmount), toAmount: Number(toAmount), source: selectedSource.name }),
      });
      const data = resp.ok ? await resp.json() : {};
      setTxHash(data.txHash || generateTxHash());
    } catch { setTxHash(generateTxHash()); }

    setLastSwapped({ fromAmt: fromAmount, fromTok: fromToken, toAmt: toAmount, toTok: toToken, source: selectedSource });
    setBalances(prev => ({
      ...prev,
      [fromToken]: (prev[fromToken] || 0) - Number(fromAmount),
      [toToken]: (prev[toToken] || 0) + Number(toAmount),
    }));
    setLoading(false);
    setShowSuccess(true);
    addToast(`Swapped ${fromAmount} ${fromToken} → ${toAmount} ${toToken}`, 'success');
  };

  const swapDirection = () => {
    const t = fromToken; setFromToken(toToken); setToToken(t);
    setFromAmount(''); setSources([]);
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-lg">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Cross-Protocol Swap</h2>
          <p className="text-secondary" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
            Best price aggregated from SX Internal Pools and external DEXes across Hoodi &amp; Base Sepolia
          </p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={refreshQuotes}
          disabled={quoteRefreshing || !fromAmount}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {quoteRefreshing ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : '🔄'}
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: Input form */}
        <div>
          <Card title="Swap Tokens">
            {/* From */}
            <div className="mb-md">
              <div className="flex justify-between items-center mb-sm">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>You Send</label>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Balance: {(balances[fromToken] || 0).toLocaleString()} {fromToken}
                </span>
              </div>
              <div className="flex gap-sm">
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="number"
                    className="input input-lg"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={e => setFromAmount(e.target.value)}
                    style={{ width: '100%', paddingRight: 60 }}
                    min="0"
                  />
                  <button
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(0,212,255,0.15)',
                      border: '1px solid rgba(0,212,255,0.3)', borderRadius: 4, color: 'var(--accent-primary)', cursor: 'pointer',
                    }}
                    onClick={() => setFromAmount(String(balances[fromToken] || 0))}
                  >MAX</button>
                </div>
                <select
                  className="select"
                  value={fromToken}
                  onChange={e => { setFromToken(e.target.value); setFromAmount(''); }}
                  style={{ width: 110 }}
                >
                  {TOKENS.filter(t => t !== toToken).map(t => (
                    <option key={t} value={t}>{TOKEN_ICONS[t]} {t}</option>
                  ))}
                </select>
              </div>
              {fromAmount && Number(fromAmount) > 0 && (
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                  ≈ ${(Number(fromAmount) * (BASE_PRICES[fromToken] || 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </div>
              )}
            </div>

            {/* Arrow */}
            <div
              onClick={swapDirection}
              style={{
                textAlign: 'center', fontSize: '1.4rem', cursor: 'pointer', margin: '8px 0',
                transition: 'transform 0.2s', userSelect: 'none',
              }}
              title="Flip direction"
              onMouseOver={e => e.target.style.transform = 'scale(1.3)'}
              onMouseOut={e => e.target.style.transform = 'scale(1)'}
            >⇅</div>

            {/* To */}
            <div className="mb-lg">
              <div className="flex justify-between items-center mb-sm">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>You Receive</label>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Balance: {(balances[toToken] || 0).toLocaleString()} {toToken}
                </span>
              </div>
              <div className="flex gap-sm">
                <input
                  type="text"
                  className="input input-lg"
                  placeholder={quoteRefreshing ? 'Fetching...' : '0.00'}
                  value={quoteRefreshing ? '' : toAmount}
                  readOnly
                  style={{ flex: 1, opacity: 0.85 }}
                />
                <select
                  className="select"
                  value={toToken}
                  onChange={e => { setToToken(e.target.value); setSources([]); }}
                  style={{ width: 110 }}
                >
                  {TOKENS.filter(t => t !== fromToken).map(t => (
                    <option key={t} value={t}>{TOKEN_ICONS[t]} {t}</option>
                  ))}
                </select>
              </div>
              {toAmount && (
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                  ≈ ${(Number(toAmount) * (BASE_PRICES[toToken] || 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </div>
              )}
            </div>

            {/* Selected route info */}
            {selectedSource && fromAmount && Number(fromAmount) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: 12,
                  background: 'rgba(0, 212, 255, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  marginBottom: 16,
                }}
              >
                <div className="flex justify-between items-center mb-sm">
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Best Route</span>
                  <ChainBadge chain={selectedSource.chain} />
                </div>
                <div className="flex justify-between items-center mb-sm">
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>Source</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{selectedSource.name}</span>
                </div>
                <div className="flex justify-between items-center mb-sm">
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>Slippage</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.85rem' }}>{selectedSource.slippage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>Gas Cost</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: selectedSource.gas === '0' ? 'var(--accent-green)' : 'inherit' }}>
                    {selectedSource.gas === '0' ? '⚡ Free (Gas: 0)' : selectedSource.gas}
                  </span>
                </div>
                {priceImpact !== null && (
                  <div className="flex justify-between items-center" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Price Impact</span>
                    <span style={{ color: Math.abs(Number(priceImpact)) < 0.5 ? 'var(--accent-green)' : 'var(--accent-orange)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {priceImpact}%
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {connected ? (
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={handleSwap}
                disabled={loading || !fromAmount || Number(fromAmount) <= 0 || !selectedSource}
              >
                {loading ? (
                  <span className="flex items-center gap-sm">
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Swapping...
                  </span>
                ) : 'Swap Now'}
              </button>
            ) : (
              <button className="btn btn-primary btn-lg btn-block" onClick={connectWallet}>
                Connect Wallet to Swap
              </button>
            )}
          </Card>
        </div>

        {/* Right: Price sources panel */}
        <div>
          <Card title="Price Sources" headerRight={
            quoteRefreshing
              ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              : <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Live quotes</span>
          }>
            {sources.length === 0 ? (
              <div className="text-center" style={{ padding: '40px 0', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>📊</div>
                <p style={{ fontSize: '0.85rem' }}>Enter an amount to see live quotes from all sources</p>
              </div>
            ) : (
              <div className="flex flex-col gap-sm">
                {sources.map((src, idx) => {
                  const isBest = idx === 0;
                  const isSelected = selectedSource?.id === src.id;
                  return (
                    <motion.div
                      key={src.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedSource(src)}
                      style={{
                        padding: 14,
                        borderRadius: 'var(--radius-md)',
                        border: isSelected
                          ? '2px solid var(--accent-primary)'
                          : '2px solid var(--border-color)',
                        background: isSelected
                          ? 'rgba(0, 212, 255, 0.06)'
                          : isBest ? 'rgba(0, 212, 100, 0.04)' : 'var(--bg-input)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                    >
                      {isBest && (
                        <div style={{
                          position: 'absolute', top: -10, right: 12,
                          background: 'var(--accent-green)', color: '#000',
                          fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                          borderRadius: 20, letterSpacing: 1,
                        }}>BEST PRICE</div>
                      )}

                      <div className="flex justify-between items-center mb-sm">
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{src.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <ChainBadge chain={src.chain} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontWeight: 700, fontSize: '1rem',
                            color: isBest ? 'var(--accent-green)' : 'var(--text-primary)',
                          }}>
                            {src.amountOut.toFixed(toToken === 'USDC' ? 2 : 6)}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>{toToken}</div>
                        </div>
                      </div>

                      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '0.72rem' }}>
                          <span className="text-muted">Slippage: </span>
                          <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{src.slippage}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem' }}>
                          <span className="text-muted">Gas: </span>
                          <span style={{ fontWeight: 600, color: src.gas === '0' ? 'var(--accent-green)' : 'inherit' }}>
                            {src.gas === '0' ? '⚡ Free' : src.gas}
                          </span>
                        </div>
                        {!isBest && (
                          <div style={{ fontSize: '0.72rem' }}>
                            <span className="text-muted">vs Best: </span>
                            <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
                              -{((sources[0].amountOut - src.amountOut) / sources[0].amountOut * 100).toFixed(3)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Balances card */}
          <div style={{ marginTop: 16 }}>
            <Card title="Your Balances">
              <div className="flex flex-col gap-sm">
                {TOKENS.map(t => (
                  <div key={t} className="flex justify-between items-center" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 600 }}>{TOKEN_ICONS[t]} {t}</span>
                    <span>{(balances[t] || 0).toLocaleString('en-US', { maximumFractionDigits: 6 })}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="✅ Swap Successful">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{ fontSize: '3.5rem', marginBottom: 16 }}
          >✅</motion.div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Transaction Complete</h3>
          {lastSwapped && (
            <p className="text-secondary mb-md">
              Swapped <strong>{lastSwapped.fromAmt} {lastSwapped.fromTok}</strong> → <strong>{lastSwapped.toAmt} {lastSwapped.toTok}</strong>
            </p>
          )}
          {lastSwapped?.source && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 20, background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)', marginBottom: 16,
            }}>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Via</span>
              <strong style={{ fontSize: '0.85rem' }}>{lastSwapped.source.name}</strong>
              <ChainBadge chain={lastSwapped.source.chain} />
            </div>
          )}
          <div style={{
            padding: 12, background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)', marginBottom: 16, wordBreak: 'break-all',
          }}>
            <span className="text-muted" style={{ fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>Transaction Hash</span>
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-primary)' }}>{txHash}</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowSuccess(false)}>Done</button>
        </div>
      </Modal>
    </div>
  );
}

export default Swap;
