'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocketConnection, useWebSocketActions, useSystemNotifications } from '../../hooks/useWebSocket';
import { webSocketClient } from '../../utils/websocket';

export default function TestWebSocketPage() {
  const { connected, connect, disconnect, error } = useWebSocketConnection();
  const { ping, sendMessage } = useWebSocketActions();
  const { notifications, clearAll } = useSystemNotifications();
  const [messages, setMessages] = useState<any[]>([]);
  const [testMessage, setTestMessage] = useState('');

  // Subscribe to all topics for testing
  useEffect(() => {
    if (connected) {
      const subscriptions = [
        webSocketClient.subscribe('/topic/public', (message) => {
          console.log('Public message:', message);
          setMessages(prev => [...prev, { topic: '/topic/public', message, timestamp: new Date() }]);
        }),
        webSocketClient.subscribe('/topic/pong', (message) => {
          console.log('Pong message:', message);
          setMessages(prev => [...prev, { topic: '/topic/pong', message, timestamp: new Date() }]);
        }),
        webSocketClient.subscribe('/topic/matches', (message) => {
          console.log('Matches message:', message);
          setMessages(prev => [...prev, { topic: '/topic/matches', message, timestamp: new Date() }]);
        }),
        webSocketClient.subscribe('/topic/events', (message) => {
          console.log('Events message:', message);
          setMessages(prev => [...prev, { topic: '/topic/events', message, timestamp: new Date() }]);
        }),
        webSocketClient.subscribe('/topic/notifications', (message) => {
          console.log('Notification message:', message);
          setMessages(prev => [...prev, { topic: '/topic/notifications', message, timestamp: new Date() }]);
        })
      ];

      return () => {
        subscriptions.forEach(id => {
          if (id) webSocketClient.unsubscribe(id);
        });
      };
    }
  }, [connected]);

  const handlePing = () => {
    ping();
    setMessages(prev => [...prev, { 
      topic: 'SENT', 
      message: { type: 'PING_SENT', timestamp: new Date() },
      timestamp: new Date() 
    }]);
  };

  const handleJoinMatch = () => {
    const username = `TestUser${Math.floor(Math.random() * 1000)}`;
    const matchId = 1; // Test with match ID 1
    
    webSocketClient.joinMatch(matchId, username);
    setMessages(prev => [...prev, { 
      topic: 'SENT', 
      message: { type: 'JOIN_MATCH', username, matchId },
      timestamp: new Date() 
    }]);
  };

  const handleSendCustomMessage = () => {
    if (!testMessage.trim()) return;
    
    try {
      const messageData = JSON.parse(testMessage);
      sendMessage('/app/ping', messageData);
      setMessages(prev => [...prev, { 
        topic: 'SENT', 
        message: { type: 'CUSTOM', data: messageData },
        timestamp: new Date() 
      }]);
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    clearAll();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">WebSocket Test Page</h1>
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-4 h-4 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-lg">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
            {error && (
              <span className="text-red-600 text-sm">Error: {error}</span>
            )}
          </div>
          
          <div className="space-x-4">
            <button
              onClick={connect}
              disabled={connected}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Connect
            </button>
            <button
              onClick={disconnect}
              disabled={!connected}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4 mb-4">
            <button
              onClick={handlePing}
              disabled={!connected}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Send Ping
            </button>
            <button
              onClick={handleJoinMatch}
              disabled={!connected}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Join Test Match
            </button>
            <button
              onClick={clearMessages}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Messages
            </button>
          </div>

          {/* Custom Message */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder='{"ping": "custom test"}'
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendCustomMessage}
              disabled={!connected || !testMessage.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
            >
              Send Custom
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Messages ({messages.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet. Try connecting and sending a ping!</p>
            ) : (
              messages.slice().reverse().map((msg, index) => (
                <div key={index} className="border-b border-gray-200 pb-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-medium text-sm px-2 py-1 rounded ${
                      msg.topic === 'SENT' ? 'bg-blue-100 text-blue-800' :
                      msg.topic === '/topic/pong' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.topic}
                    </span>
                    <span className="text-xs text-gray-500">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-sm text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(msg.message, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Notifications */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">System Notifications ({notifications.length})</h2>
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>{notification.title || 'Notification'}</strong>
                      <p className="text-gray-700">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Information */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>WebSocket URL:</strong> ws://localhost:8080/ws</p>
            <p><strong>Backend API:</strong> http://localhost:8080</p>
            <p><strong>Connection Status:</strong> {webSocketClient.isConnected() ? 'Connected' : 'Disconnected'}</p>
            <p><strong>Client Status:</strong> {JSON.stringify(webSocketClient.getStatus())}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
