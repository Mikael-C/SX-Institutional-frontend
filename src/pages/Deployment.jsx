import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/common/Card.jsx';
import ChainBadge from '../components/common/ChainBadge.jsx';

// ─── Real deployed contracts on Base Sepolia (2026-06-25) ────────────────────
const BASE_SEPOLIA_CONTRACTS = [
  {
    name: 'MockUSDC',
    subtitle: 'USDC Stablecoin Token',
    address: '0xA0A8c0Aa95AE06897554E82dFA310F1a6c0D35C0',
    chain: 'base-sepolia',
    verified: true,
    category: 'Token',
    deployDate: '2026-06-25 21:26 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0xA0A8c0Aa95AE06897554E82dFA310F1a6c0D35C0#code',
  },
  {
    name: 'SXSDQ',
    subtitle: 'Platform Trading Token',
    address: '0x9fF36DC5E3b233Bd0B90f0a6b422fa1144338A74',
    chain: 'base-sepolia',
    verified: true,
    category: 'Token',
    deployDate: '2026-06-25 21:26 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0x9fF36DC5E3b233Bd0B90f0a6b422fa1144338A74#code',
  },
  {
    name: 'WETH9',
    subtitle: 'Wrapped Ether',
    address: '0xe7E3a496F8572795a73F38F857a29a3180CFADa0',
    chain: 'base-sepolia',
    verified: true,
    category: 'Token',
    deployDate: '2026-06-25 21:26 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0xe7E3a496F8572795a73F38F857a29a3180CFADa0#code',
  },
  {
    name: 'SXKYC',
    subtitle: 'KYC/AML Compliance — Subtask 10',
    address: '0xE9CD4C141dE29c3F585aB8Cb21f427F6B62c7e48',
    chain: 'base-sepolia',
    verified: true,
    category: 'Compliance',
    deployDate: '2026-06-25 21:27 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0xE9CD4C141dE29c3F585aB8Cb21f427F6B62c7e48#code',
  },
  {
    name: 'SXRewards',
    subtitle: 'SXR Rewards System — Subtask 8',
    address: '0x1037413E0079c319ce144255dE5742A66597647D',
    chain: 'base-sepolia',
    verified: true,
    category: 'Rewards',
    deployDate: '2026-06-25 21:27 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0x1037413E0079c319ce144255dE5742A66597647D#code',
  },
  {
    name: 'SICO',
    subtitle: 'Oracle Aggregation System — Subtask 1',
    address: '0x6C338FD09fa3C3796CeCDad677a80C2bC426C8b9',
    chain: 'base-sepolia',
    verified: true,
    category: 'Oracle',
    deployDate: '2026-06-25 21:27 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0x6C338FD09fa3C3796CeCDad677a80C2bC426C8b9#code',
  },
  {
    name: 'SXCA',
    subtitle: 'Cross-Protocol Swap Aggregator — Subtask 2',
    address: '0xd56E88E4E90627E001CE39f8A3cF478fa0233eE9',
    chain: 'base-sepolia',
    verified: true,
    category: 'Swap',
    deployDate: '2026-06-25 21:27 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0xd56E88E4E90627E001CE39f8A3cF478fa0233eE9#code',
  },
  {
    name: 'SXCS',
    subtitle: 'Omni-Chain Portfolio Settlement — Subtask 3',
    address: '0x78207F413Cbd13613C7fb9e04dA3F8bd7eDe1D3A',
    chain: 'base-sepolia',
    verified: true,
    category: 'Settlement',
    deployDate: '2026-06-25 21:27 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0x78207F413Cbd13613C7fb9e04dA3F8bd7eDe1D3A#code',
  },
  {
    name: 'SXRS',
    subtitle: 'Risk Scoring & Equity Management — Subtask 4',
    address: '0xDAD99e0ce4984FA7B58fd17fe77863B41ea33562',
    chain: 'base-sepolia',
    verified: true,
    category: 'Risk',
    deployDate: '2026-06-25 21:27 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0xDAD99e0ce4984FA7B58fd17fe77863B41ea33562#code',
  },
  {
    name: 'SXFR',
    subtitle: 'Funding Rate System — Subtask 5a',
    address: '0xDd2489F75d7B5a86e94d4327cBe1CCf130260d0E',
    chain: 'base-sepolia',
    verified: true,
    category: 'Funding',
    deployDate: '2026-06-25 21:28 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0xDd2489F75d7B5a86e94d4327cBe1CCf130260d0E#code',
  },
  {
    name: 'FROGMeter',
    subtitle: 'FROG Sentiment Gauge 0-200 — Subtask 5b',
    address: '0x1d0aeD5757f62ef7621a0532630620a415d0A992',
    chain: 'base-sepolia',
    verified: true,
    category: 'Analytics',
    deployDate: '2026-06-25 21:28 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0x1d0aeD5757f62ef7621a0532630620a415d0A992#code',
  },
  {
    name: 'SXHOP',
    subtitle: 'Hidden Order Privacy System — Subtask 6',
    address: '0xbD00b1e3555f10053B3DDAD8E5A0ea92404F7bc6',
    chain: 'base-sepolia',
    verified: true,
    category: 'Privacy',
    deployDate: '2026-06-25 21:28 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0xbD00b1e3555f10053B3DDAD8E5A0ea92404F7bc6#code',
  },
  {
    name: 'SXLeverage',
    subtitle: 'Leverage & Liquidation Protection — Subtask 7',
    address: '0xAa014E1212b7D62A322e0a8AccE75368Fe65262b',
    chain: 'base-sepolia',
    verified: true,
    category: 'Leverage',
    deployDate: '2026-06-25 21:28 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0xAa014E1212b7D62A322e0a8AccE75368Fe65262b#code',
  },
  {
    name: 'SXLS',
    subtitle: 'Lending & Short-Selling Marketplace — Subtask 9',
    address: '0x14dE6154c87090c56A94ec12b081EF99B387C003',
    chain: 'base-sepolia',
    verified: true,
    category: 'Lending',
    deployDate: '2026-06-25 21:28 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0x14dE6154c87090c56A94ec12b081EF99B387C003#code',
  },
  {
    name: 'SXRConversion',
    subtitle: 'SXR Cross-Platform Conversion 44% APY — Subtask 11',
    address: '0x6EdEC3D9cc6bfdbA2FCEFEfb158c18127463e2dA',
    chain: 'base-sepolia',
    verified: true,
    category: 'Conversion',
    deployDate: '2026-06-25 21:28 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0x6EdEC3D9cc6bfdbA2FCEFEfb158c18127463e2dA#code',
  },
  {
    name: 'DMS',
    subtitle: 'Device Management & Super Admin Kill Switch',
    address: '0x8087CeC1ee901caEE9ae168B4cA323e831b3AE02',
    chain: 'base-sepolia',
    verified: true,
    category: 'Admin',
    deployDate: '2026-06-25 21:28 UTC',
    explorerUrl: 'https://sepolia.basescan.org/address/0x8087CeC1ee901caEE9ae168B4cA323e831b3AE02#code',
  },
];

// Hoodi: placeholder — deploy there next to fill in
const HOODI_CONTRACTS = BASE_SEPOLIA_CONTRACTS.map(c => ({
  ...c,
  chain: 'hoodi',
  address: 'Pending deployment...',
  verified: false,
  explorerUrl: null,
}));

const ALL_CONTRACTS = [...BASE_SEPOLIA_CONTRACTS, ...HOODI_CONTRACTS];

const CATEGORY_COLORS = {
  Token:      '#22c55e',
  Compliance: '#3b82f6',
  Rewards:    '#f59e0b',
  Oracle:     '#00d4ff',
  Swap:       '#a855f7',
  Settlement: '#6366f1',
  Risk:       '#ef4444',
  Funding:    '#f97316',
  Analytics:  '#14b8a6',
  Privacy:    '#8b5cf6',
  Leverage:   '#ec4899',
  Lending:    '#06b6d4',
  Conversion: '#84cc16',
  Admin:      '#64748b',
};

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function Deployment() {
  const [filterChain, setFilterChain] = useState('all');
  const [filterVerified, setFilterVerified] = useState('all');
  const [copiedAddr, setCopiedAddr] = useState(null);

  const handleCopy = (addr) => {
    copyToClipboard(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(null), 1500);
  };

  const filtered = ALL_CONTRACTS.filter(c => {
    if (filterChain !== 'all' && c.chain !== filterChain) return false;
    if (filterVerified === 'verified' && !c.verified) return false;
    if (filterVerified === 'unverified' && c.verified) return false;
    return true;
  });

  const totalVerified = BASE_SEPOLIA_CONTRACTS.filter(c => c.verified).length;
  const totalContracts = BASE_SEPOLIA_CONTRACTS.length;

  return (
    <div className="animate-fadeIn">

      {/* Header */}
      <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Contract Deployment</h2>
          <p className="text-secondary" style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>
            All smart contracts deployed to Hoodi and Base Sepolia — with verification badges
          </p>
        </div>
        <a
          href="https://sepolia.basescan.org"
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
        >
          🔗 Basescan Explorer
        </a>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Contracts', value: totalContracts * 2, icon: '📋', color: 'var(--accent-primary)' },
          { label: 'Base Sepolia', value: totalContracts, icon: '🔵', color: 'var(--accent-blue)' },
          { label: 'Hoodi (Pending)', value: totalContracts, icon: '🟣', color: 'var(--accent-purple)' },
          { label: 'Verified', value: `${totalVerified}/${totalContracts}`, icon: '✅', color: 'var(--accent-green)' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              padding: '16px 20px', background: 'var(--bg-card)',
              border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontWeight: 700, fontSize: '1.4rem', color: stat.color }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Verification progress for Base Sepolia */}
      <div style={{
        padding: '16px 20px', background: 'rgba(34,197,94,0.06)',
        border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-lg)',
        marginBottom: 24,
      }}>
        <div className="flex justify-between items-center mb-sm">
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>🔵 Base Sepolia — Verification Progress</span>
          <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{totalVerified}/{totalContracts} Verified</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(totalVerified / totalContracts) * 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ height: '100%', background: 'var(--accent-green)', borderRadius: 4 }}
          />
        </div>
        <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: 6 }}>
          Run the verification commands below to get ✅ badges on Basescan
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter:</span>
        {[
          { label: 'All Chains', val: 'all' },
          { label: '🔵 Base Sepolia', val: 'base-sepolia' },
          { label: '🟣 Hoodi', val: 'hoodi' },
        ].map(f => (
          <button
            key={f.val}
            onClick={() => setFilterChain(f.val)}
            className="btn btn-sm"
            style={{
              border: filterChain === f.val ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
              background: filterChain === f.val ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: filterChain === f.val ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
            }}
          >{f.label}</button>
        ))}
        <div style={{ width: 1, height: 20, background: 'var(--border-color)', margin: '0 4px' }} />
        {[
          { label: 'All', val: 'all' },
          { label: '✅ Verified', val: 'verified' },
          { label: '⚠️ Unverified', val: 'unverified' },
        ].map(f => (
          <button
            key={f.val}
            onClick={() => setFilterVerified(f.val)}
            className="btn btn-sm"
            style={{
              border: filterVerified === f.val ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
              background: filterVerified === f.val ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: filterVerified === f.val ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
            }}
          >{f.label}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filtered.length} contracts
        </span>
      </div>

      {/* Contract table */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 32,
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
              {['CONTRACT', 'ADDRESS', 'CHAIN', 'CATEGORY', 'VERIFICATION', 'DEPLOYED', 'EXPLORER'].map(h => (
                <th key={h} style={{
                  padding: '12px 14px', textAlign: 'left',
                  fontSize: '0.7rem', color: 'var(--text-secondary)',
                  fontWeight: 700, letterSpacing: 1,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((c, idx) => (
                <motion.tr
                  key={`${c.name}-${c.chain}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 14px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{c.subtitle}</div>
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    {c.address.startsWith('0x') ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          className="font-mono"
                          style={{ fontSize: '0.72rem', color: 'var(--accent-primary)' }}
                        >
                          {c.address.slice(0, 10)}...{c.address.slice(-8)}
                        </span>
                        <button
                          onClick={() => handleCopy(c.address)}
                          title="Copy full address"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.85rem', padding: '2px 4px', borderRadius: 4,
                            transition: 'background 0.15s',
                            color: copiedAddr === c.address ? 'var(--accent-green)' : 'var(--text-muted)',
                          }}
                        >{copiedAddr === c.address ? '✅' : '📋'}</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{c.address}</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <ChainBadge chain={c.chain} />
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                      fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.5,
                      background: `${CATEGORY_COLORS[c.category] || '#888'}22`,
                      color: CATEGORY_COLORS[c.category] || '#888',
                      border: `1px solid ${CATEGORY_COLORS[c.category] || '#888'}44`,
                    }}>{c.category}</span>
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    {c.verified ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '4px 12px', borderRadius: 20,
                          background: 'rgba(34,197,94,0.12)',
                          border: '1px solid rgba(34,197,94,0.35)',
                          color: '#22c55e', fontSize: '0.78rem', fontWeight: 700,
                        }}>✅ Verified</span>
                      </div>
                    ) : (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 12px', borderRadius: 20,
                        background: 'rgba(245,158,11,0.1)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        color: '#f59e0b', fontSize: '0.78rem', fontWeight: 600,
                      }}>⏳ Pending</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.deployDate}</span>
                  </td>
                  <td style={{ padding: '14px 14px' }}>
                    {c.explorerUrl ? (
                      <a
                        href={c.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: '0.75rem', color: 'var(--accent-primary)',
                          textDecoration: 'none', padding: '4px 10px',
                          border: '1px solid rgba(0,212,255,0.3)', borderRadius: 6,
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(0,212,255,0.1)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        🔗 View
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Verification commands section */}
      <Card title="📋 Verification Commands — Base Sepolia" headerRight={
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Run in your contracts/ terminal</span>
      }>
        <div style={{
          background: '#0d1117', borderRadius: 'var(--radius-md)',
          padding: 20, fontFamily: 'monospace', fontSize: '0.72rem',
          lineHeight: 2, overflowX: 'auto',
          border: '1px solid var(--border-color)',
        }}>
          {[
            'npx hardhat verify --network baseSepolia 0xA0A8c0Aa95AE06897554E82dFA310F1a6c0D35C0 0x9998d8694E7636F93A52A8330e300a84d67C99D8',
            'npx hardhat verify --network baseSepolia 0x9fF36DC5E3b233Bd0B90f0a6b422fa1144338A74 0x9998d8694E7636F93A52A8330e300a84d67C99D8',
            'npx hardhat verify --network baseSepolia 0xe7E3a496F8572795a73F38F857a29a3180CFADa0',
            'npx hardhat verify --network baseSepolia 0xE9CD4C141dE29c3F585aB8Cb21f427F6B62c7e48 0x9998d8694E7636F93A52A8330e300a84d67C99D8',
            'npx hardhat verify --network baseSepolia 0x1037413E0079c319ce144255dE5742A66597647D 0x9998d8694E7636F93A52A8330e300a84d67C99D8',
            'npx hardhat verify --network baseSepolia 0x6C338FD09fa3C3796CeCDad677a80C2bC426C8b9 0x9998d8694E7636F93A52A8330e300a84d67C99D8',
            'npx hardhat verify --network baseSepolia 0xd56E88E4E90627E001CE39f8A3cF478fa0233eE9 0x9998d8694E7636F93A52A8330e300a84d67C99D8',
            'npx hardhat verify --network baseSepolia 0x78207F413Cbd13613C7fb9e04dA3F8bd7eDe1D3A 0x9998d8694E7636F93A52A8330e300a84d67C99D8',
            'npx hardhat verify --network baseSepolia 0xDAD99e0ce4984FA7B58fd17fe77863B41ea33562 0x9998d8694E7636F93A52A8330e300a84d67C99D8 0xA0A8c0Aa95AE06897554E82dFA310F1a6c0D35C0',
            'npx hardhat verify --network baseSepolia 0xDd2489F75d7B5a86e94d4327cBe1CCf130260d0E 0x9998d8694E7636F93A52A8330e300a84d67C99D8 0xA0A8c0Aa95AE06897554E82dFA310F1a6c0D35C0',
            'npx hardhat verify --network baseSepolia 0x1d0aeD5757f62ef7621a0532630620a415d0A992 0x9998d8694E7636F93A52A8330e300a84d67C99D8',
            'npx hardhat verify --network baseSepolia 0xbD00b1e3555f10053B3DDAD8E5A0ea92404F7bc6 0x9998d8694E7636F93A52A8330e300a84d67C99D8',
            'npx hardhat verify --network baseSepolia 0xAa014E1212b7D62A322e0a8AccE75368Fe65262b 0x9998d8694E7636F93A52A8330e300a84d67C99D8 0xA0A8c0Aa95AE06897554E82dFA310F1a6c0D35C0',
            'npx hardhat verify --network baseSepolia 0x14dE6154c87090c56A94ec12b081EF99B387C003 0x9998d8694E7636F93A52A8330e300a84d67C99D8 0xA0A8c0Aa95AE06897554E82dFA310F1a6c0D35C0',
            'npx hardhat verify --network baseSepolia 0x6EdEC3D9cc6bfdbA2FCEFEfb158c18127463e2dA 0x9998d8694E7636F93A52A8330e300a84d67C99D8 0x1037413E0079c319ce144255dE5742A66597647D',
            'npx hardhat verify --network baseSepolia 0x8087CeC1ee901caEE9ae168B4cA323e831b3AE02 0x9998d8694E7636F93A52A8330e300a84d67C99D8',
          ].map((cmd, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ color: '#636e7b', userSelect: 'none', minWidth: 24 }}>{i + 1}.</span>
              <span style={{ color: '#e6edf3' }}>{cmd}</span>
              <button
                onClick={() => handleCopy(cmd)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#636e7b', fontSize: '0.8rem', padding: '0 4px', flexShrink: 0,
                  transition: 'color 0.15s',
                }}
                title="Copy command"
                onMouseOver={e => e.target.style.color = '#e6edf3'}
                onMouseOut={e => e.target.style.color = '#636e7b'}
              >📋</button>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 16, padding: '12px 16px',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)',
        }}>
          ⚠️ <strong>Wait 30–60 seconds</strong> after each deployment before running verify commands. 
          Run commands one at a time from your <code style={{ color: 'var(--accent-primary)' }}>contracts/</code> directory.
          If a contract is already verified, Basescan will say "Already Verified" — that's fine.
        </div>
      </Card>
    </div>
  );
}

export default Deployment;
