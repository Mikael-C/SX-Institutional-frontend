import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { WalletContext } from '../../App.jsx';

const pageTitles = {
  '/': 'Dashboard',
  '/oracle': 'Oracle Dashboard',
  '/swap': 'Swap',
  '/portfolio': 'Portfolio',
  '/settlement': 'Settlement',
  '/risk': 'Risk Management',
  '/funding': 'Funding Rate',
  '/frog': 'FROG Meter',
  '/orders': 'Hidden Orders',
  '/leverage': 'Leverage Trading',
  '/rewards': 'Rewards',
  '/lending': 'Lending',
  '/kyc': 'KYC Verification',
  '/admin': 'Admin Panel',
};

function Header({ onMenuToggle }) {
  const { walletAddress, connected, connectWallet, disconnectWallet, getChainName, chainId } = useContext(WalletContext);
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'SX Omni Chain';
  const chainName = getChainName();

  const shortenAddress = (addr) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  const getChainBadgeClass = () => {
    if (chainId === 560048 || chainId === 17000) return 'badge badge-hoodi';
    if (chainId === 84532) return 'badge badge-base-sepolia';
    return 'badge badge-info';
  };

  return (
    <header className="header">
      <div className="flex items-center gap-md">
        <button className="mobile-menu-toggle" onClick={onMenuToggle}>
          ☰
        </button>
        <h2 className="header-title">{title}</h2>
      </div>

      <div className="header-actions">
        {connected && chainId && (
          <span className={getChainBadgeClass()}>
            {chainName}
          </span>
        )}

        {connected ? (
          <div className="flex items-center gap-sm">
            <button className="btn btn-outline btn-sm" onClick={disconnectWallet}>
              {shortenAddress(walletAddress)}
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
