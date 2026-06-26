import React, { useState, useEffect, useContext } from 'react';
import { WalletContext } from '../App.jsx';
import Card from '../components/common/Card.jsx';
import { useToast } from '../components/common/Toast.jsx';

function EventsDatabase() {
  const { API_BASE } = useContext(WalletContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [isIndexing, setIsIndexing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/events?limit=10`),
        fetch(`${API_BASE}/events/stats`)
      ]);
      
      if (eventsRes.ok && statsRes.ok) {
        const eventsData = await eventsRes.json();
        const statsData = await statsRes.json();
        setEvents(eventsData.data);
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    setEvents([
      { id: '1', chain: 'Hoodi', eventName: 'SwapExecuted', timestamp: new Date().toISOString(), txHash: '0xabc123...', blockNumber: 1543210, args: { tokenIn: 'ETH' } },
      { id: '2', chain: 'Base Sepolia', eventName: 'PositionOpened', timestamp: new Date().toISOString(), txHash: '0xdef456...', blockNumber: 2345678, args: { leverage: 5 } }
    ]);
    setStats({ totalEvents: 2, byChain: { 'Hoodi': 1, 'Base Sepolia': 1 }, byType: { 'SwapExecuted': 1, 'PositionOpened': 1 } });
  };

  const handleManualIndex = async () => {
    setIsIndexing(true);
    addToast('Indexing cross-chain events...', 'warning');
    try {
      const res = await fetch(`${API_BASE}/events/index`, { method: 'POST' });
      if (res.ok) {
        addToast('Successfully indexed new events from Hoodi & Base', 'success');
        fetchData();
      } else {
        addToast('Failed to index events', 'error');
      }
    } catch (error) {
      addToast('Error indexing events', 'error');
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-lg">
        <h1 style={{ marginBottom: '0.5rem' }}>Omni-Chain Database & Events</h1>
        <p className="text-secondary">View unified database schema and live cross-chain indexed events.</p>
      </div>

      <div className="grid-2 mb-lg">
        <Card title="Event Indexer Stats">
          {stats ? (
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between">
                <span>Total Indexed Events:</span>
                <span className="font-mono">{stats.totalEvents}</span>
              </div>
              <div className="flex justify-between">
                <span>Hoodi Events:</span>
                <span className="font-mono">{stats.byChain['Hoodi'] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Sepolia Events:</span>
                <span className="font-mono">{stats.byChain['Base Sepolia'] || 0}</span>
              </div>
              <div className="mt-md">
                <button 
                  className="btn btn-primary" 
                  onClick={handleManualIndex}
                  disabled={isIndexing}
                >
                  {isIndexing ? 'Indexing...' : 'Manually Trigger Indexer'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-muted">Loading stats...</div>
          )}
        </Card>

        <Card title="Database Schema Summary">
          <p className="text-secondary mb-sm" style={{ fontSize: '0.85rem' }}>
            Unified PostgreSQL schema storing data from both chains natively.
          </p>
          <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>Events</code></td><td>Indexed cross-chain events with args</td></tr>
                <tr><td><code>LeveragedPositions</code></td><td>Unified leveraged trading positions</td></tr>
                <tr><td><code>OraclePrices</code></td><td>Aggregated price feeds</td></tr>
                <tr><td><code>HiddenOrders</code></td><td>ZKP-shielded privacy orders</td></tr>
                <tr><td><code>JailbreakLogs</code></td><td>Security AI threat detections</td></tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mb-lg">
        <Card title="Recent Cross-Chain Events">
          {loading ? (
            <div className="text-muted">Loading events...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Chain</th>
                    <th>Event</th>
                    <th>Block</th>
                    <th>Tx Hash</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => (
                    <tr key={evt.id}>
                      <td>
                        <span className={`badge ${evt.chain === 'Hoodi' ? 'badge-primary' : 'badge-success'}`}>
                          {evt.chain}
                        </span>
                      </td>
                      <td className="font-mono">{evt.eventName}</td>
                      <td className="font-mono text-secondary">{evt.blockNumber}</td>
                      <td className="font-mono text-secondary">{evt.txHash?.substring(0,10)}...</td>
                      <td className="text-secondary">{new Date(evt.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      
      <div className="mb-lg">
        <Card title="Architecture Diagrams (Eraser.io)">
           <p className="text-secondary mb-sm">
            Show your generated Eraser.io diagrams here by saving them to your project and adding standard image tags.
           </p>
           <div style={{ padding: '2rem', border: '2px dashed var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
              (Diagrams UI Placeholder)
           </div>
        </Card>
      </div>
    </div>
  );
}

export default EventsDatabase;
