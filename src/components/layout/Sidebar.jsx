import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { WalletContext } from '../../App.jsx';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/oracle', icon: '🔮', label: 'Oracle' },
  { path: '/swap', icon: '🔄', label: 'Swap' },
  { path: '/portfolio', icon: '💼', label: 'Portfolio' },
  { path: '/settlement', icon: '🏦', label: 'Settlement' },
  { path: '/risk', icon: '⚠️', label: 'Risk' },
  { path: '/funding', icon: '📈', label: 'Funding' },
  { path: '/frog', icon: '🐸', label: 'FROG' },
  { path: '/orders', icon: '🔒', label: 'Hidden Orders' },
  { path: '/leverage', icon: '⚡', label: 'Leverage' },
  { path: '/rewards', icon: '🏆', label: 'Rewards' },
  { path: '/lending', icon: '💰', label: 'Lending' },
  { path: '/kyc', icon: '📝', label: 'KYC' },
  { path: '/database', icon: '🗄️', label: 'Database & Events' },
  { path: '/admin', icon: '🛡️', label: 'Admin' },
  { path: '/deployment', icon: '🚀', label: 'Deployment' },
];

function Sidebar({ isOpen, onClose }) {
  const { walletAddress, connected, sxAccount } = useContext(WalletContext);

  const shortenAddress = (addr) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>SX OMNI</h1>
          <span>Institutional Trading</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-wallet">
            <div className={`wallet-dot ${connected ? 'connected' : 'disconnected'}`} />
            <div className="wallet-info">
              <div className="wallet-label">{sxAccount ? 'SXUA Account' : 'Wallet'}</div>
              <div className="wallet-address" style={{ display: 'flex', flexDirection: 'column' }}>
                {connected ? (
                  sxAccount ? (
                    <>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sxAccount.sxuaId}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{shortenAddress(walletAddress)}</span>
                    </>
                  ) : (
                    shortenAddress(walletAddress)
                  )
                ) : (
                  'Not connected'
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
