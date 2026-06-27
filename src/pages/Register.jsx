import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import { useToast } from '../components/common/Toast.jsx';

function Register() {
  const { connected, walletAddress, API_BASE, fetchSxAccount, sxAccount } = useContext(WalletContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    // If they already have an account, redirect them to dashboard
    if (sxAccount) {
      navigate('/');
    }
  }, [sxAccount, navigate]);

  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      setCheckingUsername(true);
      try {
        const res = await fetch(`${API_BASE}/accounts/check-username/${username}`);
        const json = await res.json();
        setUsernameAvailable(json.data?.available);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingUsername(false);
      }
    };
    
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username, API_BASE]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!connected || !walletAddress) {
      addToast('Please connect your wallet first', 'warning');
      return;
    }
    if (!usernameAvailable) {
      addToast('Username is not available or invalid', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/accounts/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, username, referralCode })
      });

      const json = await response.json();
      if (response.ok && json.success) {
        addToast(`Welcome ${json.data.username}! Your SXUA ID is ${json.data.sxuaId}`, 'success');
        await fetchSxAccount(walletAddress);
        navigate('/kyc'); // Redirect to KYC after creation
      } else {
        addToast(json.error || 'Failed to create account', 'error');
      }
    } catch (error) {
      console.error(error);
      addToast('An error occurred during registration', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔗</div>
        <h2 style={{ marginBottom: '1rem' }}>Wallet Not Connected</h2>
        <p className="text-secondary mb-lg text-center" style={{ maxWidth: '400px' }}>
          Please connect your MetaMask wallet using the button in the top right corner to create an SXUA account.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn flex justify-center" style={{ padding: '2rem 0' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-lg">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Join SX Omni Chain
            </h1>
            <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
              Create your Institutional SXUA Account
            </p>
          </div>

          <Card>
            <div className="flex items-center gap-md mb-lg" style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
              <div className="wallet-dot connected" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Connected Wallet</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{walletAddress}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group mb-md">
                <label>Username</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    required
                    minLength={3}
                    maxLength={30}
                    style={{ 
                      borderColor: username.length >= 3 ? (usernameAvailable ? 'var(--accent-success)' : 'var(--accent-danger)') : undefined
                    }}
                  />
                  {username.length >= 3 && (
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                      {checkingUsername ? '⏳' : (usernameAvailable ? '✅' : '❌')}
                    </div>
                  )}
                </div>
                {username.length >= 3 && !checkingUsername && !usernameAvailable && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-danger)', marginTop: '4px' }}>
                    Username is already taken.
                  </div>
                )}
              </div>

              <div className="input-group mb-lg">
                <label>Referral Code (Optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter code if you have one"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block btn-lg" 
                disabled={submitting || !usernameAvailable || username.length < 3}
                style={{ height: '56px', fontSize: '1.1rem' }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-sm">
                    <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> 
                    Creating Account...
                  </span>
                ) : 'Create SXUA Account'}
              </button>
            </form>
            
            <div className="text-center mt-md text-secondary" style={{ fontSize: '0.85rem' }}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
