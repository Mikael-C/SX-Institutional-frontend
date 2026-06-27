import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import { useToast } from '../components/common/Toast.jsx';

function KYC() {
  const { API_BASE, walletAddress, sxAccount } = useContext(WalletContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState('none');
  const [submittedAt, setSubmittedAt] = useState(null);
  const [verifiedAt, setVerifiedAt] = useState(null);
  const [shieldedIntent, setShieldedIntent] = useState(false);

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [idDocument, setIdDocument] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    setLoading(true);
    try {
      const addr = walletAddress || '0xdemo';
      const response = await fetch(`${API_BASE}/kyc/status/${addr}`);
      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          setKycStatus(json.data.status ? json.data.status.toLowerCase() : 'none');
          setSubmittedAt(json.data.submittedAt || null);
          setVerifiedAt(json.data.verifiedAt || null);
          setShieldedIntent(json.data.shieldedIntent || false);
        } else {
          setKycStatus(json.status ? json.status.toLowerCase() : 'none');
          setSubmittedAt(json.submittedAt || null);
          setVerifiedAt(json.verifiedAt || null);
          setShieldedIntent(json.shieldedIntent || false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !dob || !address) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const addr = walletAddress || '0xdemo';
      const response = await fetch(`${API_BASE}/kyc/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress: addr,
          fullName, 
          dateOfBirth: dob, 
          address, 
          documentHash: '0xdummy_hash_abc123',
          shieldedIntent: true
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          setKycStatus(json.data.status ? json.data.status.toLowerCase() : 'pending');
          setSubmittedAt(json.data.submittedAt || new Date().toISOString());
        } else {
          setKycStatus(json.status ? json.status.toLowerCase() : 'pending');
          setSubmittedAt(json.submittedAt || new Date().toISOString());
        }
      } else {
        setKycStatus('pending');
        setSubmittedAt(new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to submit KYC:', error);
      setKycStatus('pending');
      setSubmittedAt(new Date().toISOString());
    }

    setSubmitting(false);
    addToast('KYC application submitted successfully', 'success');
  };

  const handleApproveKyc = async () => {
    try {
      const addr = walletAddress || '0xdemo';
      await fetch(`${API_BASE}/kyc/approve/${addr}`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to approve KYC:', error);
    }

    setKycStatus('verified');
    setVerifiedAt(new Date().toISOString());
    setShieldedIntent(true);
    addToast('KYC verified successfully', 'success');
  };

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'pending':
        return (
          <span className="badge badge-warning badge-lg" style={{ fontSize: '1rem', padding: '12px 24px' }}>
            ⏳ Pending Verification
          </span>
        );
      case 'verified':
        return (
          <span className="badge badge-success badge-lg" style={{ fontSize: '1rem', padding: '12px 24px' }}>
            ✅ Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="badge badge-danger badge-lg" style={{ fontSize: '1rem', padding: '12px 24px' }}>
            ❌ Rejected
          </span>
        );
      default:
        return (
          <span className="badge badge-info badge-lg" style={{ fontSize: '1rem', padding: '12px 24px' }}>
            📝 Not Submitted
          </span>
        );
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
      {!sxAccount && (
        <div className="mb-lg" style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-warning)', borderLeft: '4px solid var(--accent-warning)' }}>
          <div className="flex items-center gap-md">
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>SXUA Account Required</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                You must create an Institutional SXUA Account before submitting KYC. <a href="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Create Account</a>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2 mb-lg" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <Card title="KYC Application">
          {kycStatus === 'verified' ? (
            <div className="text-center" style={{ padding: '32px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 8, color: 'var(--accent-success)' }}>
                Identity Verified
              </h3>
              <p className="text-secondary">
                Your KYC verification is complete. You have full access to all platform features.
              </p>
            </div>
          ) : kycStatus === 'pending' ? (
            <div className="text-center" style={{ padding: '32px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>⏳</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 8, color: 'var(--accent-warning)' }}>
                Pending Verification
              </h3>
              <p className="text-secondary mb-lg">
                Your KYC application is being reviewed. This typically takes 1-2 business days.
              </p>
              <button className="btn btn-success" onClick={handleApproveKyc}>
                🛡️ Approve KYC (Demo)
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="input-group mb-md">
                <label>Full Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter your full legal name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group mb-md">
                <label>Date of Birth</label>
                <input
                  type="date"
                  className="input"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>

              <div className="input-group mb-md">
                <label>Address</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Street address, city, state, country"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="input-group mb-lg">
                <label>ID Document</label>
                <div className="file-input-wrapper">
                  <div className="file-icon">📄</div>
                  <div className="file-label">
                    {idDocument ? idDocument.name : 'Click to upload passport, driver\'s license, or national ID'}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setIdDocument(e.target.files[0] || null)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting || !sxAccount}>
                {!sxAccount ? 'Create Account First' : (submitting ? 'Submitting...' : 'Submit KYC Application')}
              </button>
            </form>
          )}
        </Card>

        <div className="flex flex-col gap-lg">
          <Card title="Verification Status">
            <div className="text-center" style={{ padding: '20px 0' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {getStatusBadge()}
              </motion.div>

              <div className="flex flex-col gap-md mt-lg" style={{ textAlign: 'left' }}>
                <div className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span className="text-secondary">Shielded Order Intent</span>
                  <span style={{ fontWeight: 600, color: shieldedIntent ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                    {shieldedIntent ? '✓ Active' : 'Inactive'}
                  </span>
                </div>

                {submittedAt && (
                  <div className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span className="text-secondary">Submitted</span>
                    <span style={{ fontSize: '0.85rem' }}>
                      {new Date(submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                {verifiedAt && (
                  <div className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span className="text-secondary">Verified</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>
                      {new Date(verifiedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {sxAccount && (
            <Card title="Account Info">
              <div className="flex flex-col gap-sm" style={{ padding: '10px 0' }}>
                <div className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span className="text-secondary">SXUA ID</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sxAccount.sxuaId}</span>
                </div>
                <div className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span className="text-secondary">Username</span>
                  <span style={{ color: 'var(--text-primary)' }}>{sxAccount.username}</span>
                </div>
                <div className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span className="text-secondary">Tier</span>
                  <span className="badge badge-info">{sxAccount.accountTier}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default KYC;
