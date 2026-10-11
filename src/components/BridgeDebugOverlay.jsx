import React, { useState, useEffect } from 'react';
import { flutterBridge } from '../utils/flutterBridge';

/**
 * Developer Debug Overlay to inspect Flutter Bridge events and simulate incoming Flutter commands
 */
export const BridgeDebugOverlay = ({ onClose, onSimulateCommand }) => {
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('LOGS');
  const [isFlutter, setIsFlutter] = useState(false);

  useEffect(() => {
    setIsFlutter(flutterBridge.isFlutterEnvironment());
    const update = () => setHistory(flutterBridge.getHistory());
    update();
    const interval = setInterval(update, 800);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = (cmd, data = {}) => {
    if (window.onFlutterCommand) {
      window.onFlutterCommand(cmd, data);
    }
    if (onSimulateCommand) {
      onSimulateCommand(cmd, data);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '420px',
        maxHeight: '520px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 2px rgba(56, 189, 248, 0.4)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace',
        fontSize: '12px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isFlutter ? '#22c55e' : '#eab308'
            }}
          />
          <strong style={{ fontSize: '13px', color: '#38bdf8' }}>Flutter Bridge Inspector</strong>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '2px 6px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Environment Status Badge */}
      <div
        style={{
          padding: '6px 16px',
          backgroundColor: isFlutter ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
          color: isFlutter ? '#4ade80' : '#fde047',
          fontSize: '11px',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <span>Mode: {isFlutter ? 'Flutter WebView (Connected)' : 'Standalone / Browser Simulator'}</span>
        <span>Channel: "FlutterBridge"</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#090d16', borderBottom: '1px solid #334155' }}>
        <button
          onClick={() => setActiveTab('LOGS')}
          style={{
            flex: 1,
            padding: '8px',
            background: activeTab === 'LOGS' ? '#1e293b' : 'transparent',
            color: activeTab === 'LOGS' ? '#38bdf8' : '#94a3b8',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Event Logs ({history.length})
        </button>
        <button
          onClick={() => setActiveTab('SIMULATE')}
          style={{
            flex: 1,
            padding: '8px',
            background: activeTab === 'SIMULATE' ? '#1e293b' : 'transparent',
            color: activeTab === 'SIMULATE' ? '#38bdf8' : '#94a3b8',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Simulate Flutter Commands
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', maxHeight: '340px' }}>
        {activeTab === 'LOGS' ? (
          history.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>
              No messages sent or received yet. Play a level or simulate an event!
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '10px',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: item.direction === 'OUTGOING' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(168, 85, 247, 0.08)',
                  borderLeft: item.direction === 'OUTGOING' ? '3px solid #38bdf8' : '3px solid #a855f7'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: item.direction === 'OUTGOING' ? '#38bdf8' : '#c084fc' }}>
                    {item.direction === 'OUTGOING' ? '📤 OUT: ' + item.event : '📥 IN: ' + item.command}
                  </span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <pre
                  style={{
                    margin: 0,
                    fontSize: '11px',
                    color: '#e2e8f0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}
                >
                  {JSON.stringify(item.payload || item.data, null, 2)}
                </pre>
              </div>
            ))
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '11px' }}>
              Click a button below to test how the game reacts to incoming commands sent by Flutter:
            </p>
            <button
              onClick={() => handleSimulate('PAUSE')}
              style={{
                padding: '8px 12px',
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              ⏸️ Simulate Flutter Send: <b>PAUSE</b>
            </button>
            <button
              onClick={() => handleSimulate('RESUME')}
              style={{
                padding: '8px 12px',
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              ▶️ Simulate Flutter Send: <b>RESUME</b>
            </button>
            <button
              onClick={() => handleSimulate('RESTART')}
              style={{
                padding: '8px 12px',
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              🔄 Simulate Flutter Send: <b>RESTART</b>
            </button>
            <button
              onClick={() => flutterBridge.sendLevelCompleted(520)}
              style={{
                padding: '8px 12px',
                background: '#0369a1',
                color: '#f8fafc',
                border: '1px solid #0ea5e9',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: '8px'
              }}
            >
              ⚡ Test Dispatch: <b>LEVEL_COMPLETED</b> Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default BridgeDebugOverlay;
