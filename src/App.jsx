import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import OracleDashboard from './pages/OracleDashboard.jsx';
import Swap from './pages/Swap.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Settlement from './pages/Settlement.jsx';
import Risk from './pages/Risk.jsx';
import FundingRate from './pages/FundingRate.jsx';
import FrogMeter from './pages/FrogMeter.jsx';
import HiddenOrders from './pages/HiddenOrders.jsx';
import Leverage from './pages/Leverage.jsx';
import Rewards from './pages/Rewards.jsx';
import Lending from './pages/Lending.jsx';
import KYC from './pages/KYC.jsx';
import EventsDatabase from './pages/EventsDatabase.jsx';
import Admin from './pages/Admin.jsx';
import Deployment from './pages/Deployment.jsx';
import { ToastProvider } from './components/common/Toast.jsx';

export const WalletContext = createContext(null);

const API_BASE = 'https://sx-institutional.onrender.com/api';
const WS_URL = 'wss://sx-institutional.onrender.com/ws';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [wsMessages, setWsMessages] = useState([]);
  const wsRef = useRef(null);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to connect your wallet.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setConnected(true);
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainIdHex, 16));
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress('');
    setChainId(null);
    setConnected(false);
  }, []);

  const switchNetwork = useCallback(async (targetChainId) => {
    if (typeof window.ethereum === 'undefined') return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + targetChainId.toString(16) }],
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  }, []);

  const getChainName = useCallback(() => {
    if (chainId === 560048) return 'Hoodi';
    if (chainId === 84532) return 'Base Sepolia';
    if (chainId === 17000) return 'Hoodi';
    return chainId ? `Chain ${chainId}` : 'Not Connected';
  }, [chainId]);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setConnected(true);
        } else {
          disconnectWallet();
        }
      });
      window.ethereum.on('chainChanged', (chainIdHex) => {
        setChainId(parseInt(chainIdHex, 16));
      });

      window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setConnected(true);
          window.ethereum.request({ method: 'eth_chainId' }).then((chainIdHex) => {
            setChainId(parseInt(chainIdHex, 16));
          });
        }
      }).catch(() => {});
    }
  }, [disconnectWallet]);

  useEffect(() => {
    let ws;
    const connectWebSocket = () => {
      try {
        ws = new WebSocket(WS_URL);
        wsRef.current = ws;
        ws.onopen = () => {
          console.log('WebSocket connected');
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setWsMessages((prev) => [...prev.slice(-99), data]);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };
        ws.onclose = () => {
          console.log('WebSocket disconnected. Reconnecting in 5s...');
          setTimeout(connectWebSocket, 5000);
        };
        ws.onerror = (err) => {
          console.error('WebSocket error:', err);
        };
      } catch (err) {
        console.error('WebSocket connection failed:', err);
        setTimeout(connectWebSocket, 5000);
      }
    };
    connectWebSocket();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const walletValue = {
    walletAddress,
    chainId,
    connected,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getChainName,
    wsMessages,
    API_BASE,
  };

  return (
    <WalletContext.Provider value={walletValue}>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/oracle" element={<OracleDashboard />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/settlement" element={<Settlement />} />
            <Route path="/risk" element={<Risk />} />
            <Route path="/funding" element={<FundingRate />} />
            <Route path="/frog" element={<FrogMeter />} />
            <Route path="/orders" element={<HiddenOrders />} />
            <Route path="/leverage" element={<Leverage />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/lending" element={<Lending />} />
            <Route path="/kyc" element={<KYC />} />
            <Route path="/database" element={<EventsDatabase />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/deployment" element={<Deployment />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </WalletContext.Provider>
  );
}

export default App;
