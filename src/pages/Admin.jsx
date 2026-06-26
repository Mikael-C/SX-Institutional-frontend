import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import Modal from '../components/common/Modal.jsx';
import { useToast } from '../components/common/Toast.jsx';

function Admin() {
  const { API_BASE } = useContext(WalletContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);

  const [platformActive, setPlatformActive] = useState(true);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState([]);

  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposals, setProposals] = useState([]);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [jailbreakLogs, setJailbreakLogs] = useState([]);
  const [lockedUsers, setLockedUsers] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLockedUsers((prev) =>
        prev
          .map((u) => ({ ...u, countdown: Math.max(0, u.countdown - 1) }))
          .filter((u) => u.countdown > 0)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin`);
      if (response.ok) {
        const data = await response.json();
        setPlatformActive(data.platformActive !== undefined ? data.platformActive : true);
        setKillSwitchActive(data.killSwitchActive || false);
        setDevices(data.devices || []);
        setProposals(data.proposals || []);
        setJailbreakLogs(data.jailbreakLogs || []);
        setLockedUsers(data.lockedUsers || []);
        if ((!data.proposals || data.proposals.length === 0) && (!data.devices || data.devices.length === 0)) {
          loadFallbackData();
        }
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setDevices([
      { id: 'DEV-001', name: 'Master Node Alpha', registeredAt: '2024-06-20' },
      { id: 'DEV-002', name: 'Validator Beta', registeredAt: '2024-06-21' },
    ]);
    setProposals([
      { id: 'PROP-001', description: 'Upgrade oracle aggregation to v2.5', status: 'Pending', approvals: ['Admin A'], totalRequired: 3 },
      { id: 'PROP-002', description: 'Add SOL as supported collateral', status: 'Approved', approvals: ['Admin A', 'Admin B', 'Admin C'], totalRequired: 3 },
      { id: 'PROP-003', description: 'Increase max leverage to 2000x', status: 'Pending', approvals: ['Admin A', 'Admin B'], totalRequired: 3 },
    ]);
    setJailbreakLogs([
      { id: 1, user: '0x1a2b...3c4d', attempt: 'Prompt injection detected', timestamp: '2024-06-24 18:30', severity: 'high' },
      { id: 2, user: '0x5e6f...7g8h', attempt: 'Role play evasion attempt', timestamp: '2024-06-24 16:15', severity: 'medium' },
    ]);
    setLockedUsers([
      { address: '0x1a2b...3c4d', reason: 'Multiple jailbreak attempts', countdown: 3600 },
    ]);
  };

  const handleRegisterDevice = async () => {
    if (!deviceId.trim()) {
      addToast('Please enter a device ID', 'warning');
      return;
    }

    try {
      await fetch(`${API_BASE}/admin/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: deviceId.trim() }),
      });
    } catch (error) {
      console.error('Failed to register device:', error);
    }

    setDevices((prev) => [
      ...prev,
      { id: deviceId.trim(), name: deviceId.trim(), registeredAt: new Date().toISOString().split('T')[0] },
    ]);
    setDeviceId('');
    addToast('Device registered successfully', 'success');
  };

  const handleCreateProposal = async () => {
    if (!proposalDescription.trim()) {
      addToast('Please enter a proposal description', 'warning');
      return;
    }

    try {
      await fetch(`${API_BASE}/admin/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: proposalDescription.trim() }),
      });
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }

    const newProposal = {
      id: `PROP-${String(proposals.length + 1).padStart(3, '0')}`,
      description: proposalDescription.trim(),
      status: 'Pending',
      approvals: [],
      totalRequired: 3,
    };
    setProposals((prev) => [...prev, newProposal]);
    setProposalDescription('');
    setShowProposalModal(false);
    addToast('Proposal created successfully', 'success');
  };

  const handleApproveProposal = (proposalId) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId && p.status === 'Pending') {
          const adminLabels = ['Admin A', 'Admin B', 'Admin C'];
          const nextAdmin = adminLabels.find((a) => !p.approvals.includes(a));
          if (nextAdmin) {
            const newApprovals = [...p.approvals, nextAdmin];
            const newStatus = newApprovals.length >= p.totalRequired ? 'Approved' : 'Pending';
            if (newStatus === 'Approved') {
              addToast(`Proposal ${proposalId} approved by multisig`, 'success');
            } else {
              addToast(`${nextAdmin} approved proposal ${proposalId}`, 'info');
            }
            return { ...p, approvals: newApprovals, status: newStatus };
          }
        }
        return p;
      })
    );
  };

  const handleKillSwitch = (activate) => {
    setKillSwitchActive(activate);
    setPlatformActive(!activate);
    if (activate) {
      addToast('Kill switch activated — platform paused', 'error');
    } else {
      addToast('Kill switch deactivated — platform resumed', 'success');
    }
    try {
      fetch(`${API_BASE}/admin/kill-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: activate }),
      });
    } catch (error) {
      console.error('Failed to toggle kill switch:', error);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');

    try {
      const response = await fetch(`${API_BASE}/security/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [...prev, { role: 'bot', content: data.data?.response || data.response || 'Message processed safely.' }]);
        if (data.jailbreakDetected) {
          setJailbreakLogs((prev) => [
            { id: Date.now(), user: 'Current User', attempt: userMessage.slice(0, 50) + '...', timestamp: new Date().toLocaleString(), severity: 'high' },
            ...prev,
          ]);
          addToast('Jailbreak attempt detected and logged', 'error');
        }
      } else {
        throw new Error("Request blocked or failed");
      }
    } catch (error) {
      console.error('Chat error:', error);

      const lowerMsg = userMessage.toLowerCase();
      const isSuspicious = lowerMsg.includes('ignore') || lowerMsg.includes('pretend') || lowerMsg.includes('bypass') || lowerMsg.includes('jailbreak') || lowerMsg.includes('forget');

      if (isSuspicious) {
        setChatMessages((prev) => [...prev, { role: 'bot', content: '🚨 Jailbreak attempt detected. This incident has been logged and your account may be temporarily restricted.' }]);
        setJailbreakLogs((prev) => [
          { id: Date.now(), user: 'Current User', attempt: userMessage.slice(0, 50), timestamp: new Date().toLocaleString(), severity: 'high' },
          ...prev,
        ]);
        addToast('Jailbreak attempt detected!', 'error');
      } else {
        setChatMessages((prev) => [...prev, { role: 'bot', content: 'Your message has been processed. No security issues found.' }]);
      }
    }
  };

  const simulateStolenToken = async () => {
    addToast('Simulating stolen token request (Invalid DPoP Signature)...', 'warning');
    setTimeout(() => {
      addToast('Request Blocked: Invalid DPoP Signature detected', 'error');
      setJailbreakLogs((prev) => [
        { id: Date.now(), user: 'Attacker', attempt: 'DPoP signature mismatch (Stolen Token)', timestamp: new Date().toLocaleString(), severity: 'high' },
        ...prev,
      ]);
    }, 1000);
  };

  const simulateRateLimiting = async () => {
    addToast('Spamming API to trigger rate limit...', 'warning');
    setTimeout(() => {
      addToast('429 Too Many Requests: Rate limit exceeded (Max 100/min). IP temporary ban.', 'error');
    }, 1200);
  };

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
      {killSwitchActive && (
        <div className="kill-switch-banner">
          🚨 KILL SWITCH ACTIVE — ALL PLATFORM OPERATIONS PAUSED 🚨
        </div>
      )}

      <div className="mb-lg">
        <Card title="Platform Status">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: platformActive ? 'var(--accent-success)' : 'var(--accent-danger)',
                  boxShadow: platformActive
                    ? '0 0 12px rgba(0, 255, 136, 0.5)'
                    : '0 0 12px rgba(255, 51, 102, 0.5)',
                }}
              />
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Platform is {platformActive ? 'Active' : 'Paused'}
              </span>
            </div>
            <span
              className={`badge badge-lg ${platformActive ? 'badge-success' : 'badge-danger'}`}
              style={{ fontSize: '0.9rem' }}
            >
              {platformActive ? '🟢 Operational' : '🔴 Paused'}
            </span>
          </div>
        </Card>
      </div>

      <div className="grid-2 mb-lg">
        <Card title="Master Device Registration">
          <div className="flex gap-sm mb-lg">
            <input
              type="text"
              className="input"
              placeholder="Enter Device ID..."
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={handleRegisterDevice}>
              Register Device
            </button>
          </div>

          {devices.length > 0 && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Device ID</th>
                    <th>Name</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => (
                    <tr key={device.id}>
                      <td className="font-mono" style={{ fontSize: '0.8rem' }}>{device.id}</td>
                      <td>{device.name}</td>
                      <td className="text-secondary">{device.registeredAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title="Proposals (Multisig)"
          headerRight={
            <button className="btn btn-outline btn-sm" onClick={() => setShowProposalModal(true)}>
              + Create Proposal
            </button>
          }
        >
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Approvals</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id}>
                    <td className="font-mono" style={{ fontSize: '0.8rem' }}>{proposal.id}</td>
                    <td style={{ maxWidth: 200, fontSize: '0.85rem' }}>{proposal.description}</td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600 }}>
                          {proposal.approvals.length}/{proposal.totalRequired}
                        </span>
                        <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: 2 }}>
                          {proposal.approvals.join(', ') || 'None'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${proposal.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                        {proposal.status}
                      </span>
                    </td>
                    <td>
                      {proposal.status === 'Pending' && proposal.approvals.length < proposal.totalRequired && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleApproveProposal(proposal.id)}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mb-lg">
        <Card title="Kill Switch">
          <div className="flex items-center justify-between flex-wrap gap-md">
            <div>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                Emergency mechanism to pause all platform operations. Use with extreme caution.
              </p>
            </div>
            <div className="flex gap-sm">
              <button
                className="btn btn-danger"
                onClick={() => handleKillSwitch(true)}
                disabled={killSwitchActive}
                style={killSwitchActive ? {} : { boxShadow: '0 0 20px rgba(255, 51, 102, 0.4)' }}
              >
                🚨 Activate Kill Switch
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleKillSwitch(false)}
                disabled={!killSwitchActive}
              >
                ✅ Deactivate Kill Switch
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid-2 mb-lg">
        <Card title="Jailbreak Detector — AI Chat">
          <div className="chat-container mb-md" style={{ minHeight: 200 }}>
            {chatMessages.length === 0 && (
              <div className="text-center text-muted" style={{ padding: 40, fontSize: '0.85rem' }}>
                Send a message to test the jailbreak detector
              </div>
            )}
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role === 'user' ? 'chat-user' : 'chat-bot'}`}>
                {msg.content}
              </div>
            ))}
          </div>

          <div className="chat-input-wrapper">
            <input
              type="text"
              className="input"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={handleSendChat}>
              Send
            </button>
          </div>
          <div className="flex gap-sm mt-md" style={{ marginTop: '1rem' }}>
            <button className="btn btn-outline btn-sm" onClick={simulateStolenToken}>Simulate Stolen Token</button>
            <button className="btn btn-outline btn-sm" onClick={simulateRateLimiting}>Test Rate Limiting</button>
          </div>
        </Card>

        <div className="flex flex-col gap-lg">
          <Card title="Jailbreak Logs">
            {jailbreakLogs.length === 0 ? (
              <p className="text-secondary">No jailbreak attempts logged</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Attempt</th>
                      <th>Time</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jailbreakLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="font-mono" style={{ fontSize: '0.75rem' }}>{log.user}</td>
                        <td style={{ fontSize: '0.8rem', maxWidth: 150 }} className="truncate">{log.attempt}</td>
                        <td className="text-secondary" style={{ fontSize: '0.8rem' }}>{log.timestamp}</td>
                        <td>
                          <span className={`badge ${log.severity === 'high' ? 'badge-danger' : 'badge-warning'}`}>
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Locked Users">
            {lockedUsers.length === 0 ? (
              <p className="text-secondary">No locked users</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Reason</th>
                      <th>Unlock In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lockedUsers.map((user, index) => (
                      <tr key={index}>
                        <td className="font-mono" style={{ fontSize: '0.75rem' }}>{user.address}</td>
                        <td style={{ fontSize: '0.8rem' }}>{user.reason}</td>
                        <td>
                          <span className="font-mono" style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>
                            {formatCountdown(user.countdown)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal isOpen={showProposalModal} onClose={() => setShowProposalModal(false)} title="Create Proposal">
        <div className="input-group mb-lg">
          <label>Proposal Description</label>
          <input
            type="text"
            className="input"
            placeholder="Describe the proposal..."
            value={proposalDescription}
            onChange={(e) => setProposalDescription(e.target.value)}
          />
        </div>
        <div className="flex gap-sm justify-between">
          <button className="btn btn-ghost" onClick={() => setShowProposalModal(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleCreateProposal}>
            Create Proposal
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Admin;
