'use client';

import React, { useState, useEffect } from 'react';
import { useMatchLiveUpdates, useWebSocketConnection } from '../hooks/useWebSocket';

interface LiveMatchWidgetProps {
  matchId: number;
  username?: string;
  className?: string;
}

export default function LiveMatchWidget({ 
  matchId, 
  username = 'Anonymous', 
  className = '' 
}: LiveMatchWidgetProps) {
  const { connected, error } = useWebSocketConnection();
  const {
    matchData,
    events,
    chatMessages,
    joinMatch,
    leaveMatch,
    sendChatMessage,
    sendReaction
  } = useMatchLiveUpdates(matchId, connected);

  const [chatInput, setChatInput] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  // Auto-join when component mounts and connection is established
  useEffect(() => {
    if (connected && !hasJoined) {
      joinMatch(username);
      setHasJoined(true);
    }
  }, [connected, hasJoined, joinMatch, username]);

  // Leave match when component unmounts
  useEffect(() => {
    return () => {
      if (hasJoined) {
        leaveMatch();
      }
    };
  }, [hasJoined, leaveMatch]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && connected) {
      sendChatMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleReaction = (emoji: string) => {
    if (connected) {
      sendReaction(emoji);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Live Match Updates</h3>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            connected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
          Connection Error: {error}
        </div>
      )}

      {/* Match Score */}
      {matchData && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="font-semibold">{matchData.homeTeam}</p>
              <p className="text-2xl font-bold">{matchData.homeScore}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-sm opacity-75">vs</p>
              <p className="text-xs opacity-75">{matchData.status}</p>
            </div>
            <div className="text-center flex-1">
              <p className="font-semibold">{matchData.awayTeam}</p>
              <p className="text-2xl font-bold">{matchData.awayScore}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reaction Buttons */}
      {connected && (
        <div className="flex justify-center space-x-2 mb-4">
          {['⚽', '🎉', '😱', '👏', '💪', '🔥'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="text-2xl hover:scale-110 transition-transform duration-200 p-1 rounded hover:bg-gray-100"
              title={`Send ${emoji} reaction`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Match Events */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 border-b pb-1">Recent Events</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm">No events yet...</p>
            ) : (
              events.slice(-10).reverse().map((event, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-blue-600">{event.minute}'</span>
                    <span className="text-xs text-gray-500">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-800">{event.description}</p>
                  {event.player && (
                    <p className="text-xs text-gray-600 mt-1">
                      {event.player} ({event.team})
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 border-b pb-1">Live Chat</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {chatMessages.length === 0 ? (
              <p className="text-gray-500 text-sm">No messages yet...</p>
            ) : (
              chatMessages.slice(-20).map((msg, index) => (
                <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-blue-700">{msg.username}</span>
                    <span className="text-xs text-gray-500">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-800">{msg.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          {connected && (
            <form onSubmit={handleSendChat} className="flex space-x-2 mt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Connection Help */}
      {!connected && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Connection Issues?</strong> Live updates require an active connection. 
            The system will automatically try to reconnect.
          </p>
        </div>
      )}
    </div>
  );
}
