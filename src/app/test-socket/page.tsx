'use client';

import { useEffect, useState } from 'react';
import { getSocket, initializeSocket } from '@/lib/socket';

export default function TestSocketPage() {
  const [socketStatus, setSocketStatus] = useState<string>('Not initialized');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setSocketStatus('No auth token found');
      addLog('ERROR: No auth token in localStorage');
      return;
    }

    addLog('Initializing socket with token...');
    const socket = initializeSocket(token);

    // Check initial connection state
    if (socket.connected) {
      setSocketStatus('Connected ✅');
      addLog(`Already connected! Socket ID: ${socket.id}`);
    } else {
      setSocketStatus('Connecting...');
    }

    socket.on('connect', () => {
      setSocketStatus('Connected ✅');
      addLog(`Connected! Socket ID: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      setSocketStatus(`Disconnected: ${reason}`);
      addLog(`Disconnected: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      setSocketStatus(`Error: ${error.message}`);
      addLog(`Connection error: ${error.message}`);
    });

    // Test listening to data events
    socket.on('data:order:synced', (data) => {
      addLog(`Order synced event: ${JSON.stringify(data)}`);
    });

    socket.on('data:product:synced', (data) => {
      addLog(`Product synced event: ${JSON.stringify(data)}`);
    });

    return () => {
      addLog('Cleaning up listeners...');
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Socket.IO Connection Test</h1>

      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Status: {socketStatus}</h2>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Logs:</h3>
        <div style={{
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px', fontSize: '12px' }}>
              {log}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => {
            const socket = getSocket();
            if (socket) {
              addLog(`Socket connected: ${socket.connected}`);
              addLog(`Socket ID: ${socket.id}`);
            } else {
              addLog('Socket not initialized');
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#003450',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Check Socket Status
        </button>

        <button
          onClick={() => setLogs([])}
          style={{
            padding: '10px 20px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
}
