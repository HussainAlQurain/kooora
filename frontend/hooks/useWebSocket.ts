'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { webSocketClient, WebSocketMessage, MatchUpdate, MatchEvent, ChatMessage, SystemNotification } from '../utils/websocket';

export interface WebSocketState {
  connected: boolean;
  reconnectAttempts: number;
  error: string | null;
}

/**
 * Hook for managing WebSocket connection state
 */
export function useWebSocketConnection() {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    reconnectAttempts: 0,
    error: null
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleConnectionChange = (connected: boolean) => {
      setState(prev => ({
        ...prev,
        connected,
        error: connected ? null : prev.error
      }));
    };

    webSocketClient.onConnectionChange(handleConnectionChange);

    // Initial connection
    webSocketClient.connect()
      .then(() => {
        setState(prev => ({ ...prev, connected: true, error: null }));
      })
      .catch((error) => {
        setState(prev => ({ ...prev, connected: false, error: error.message }));
      });

    return () => {
      webSocketClient.removeConnectionListener(handleConnectionChange);
    };
  }, []);

  const connect = useCallback(() => {
    webSocketClient.connect()
      .then(() => {
        setState(prev => ({ ...prev, connected: true, error: null }));
      })
      .catch((error) => {
        setState(prev => ({ ...prev, connected: false, error: error.message }));
      });
  }, []);

  const disconnect = useCallback(() => {
    webSocketClient.disconnect();
    setState(prev => ({ ...prev, connected: false, error: null }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    isConnected: webSocketClient.isConnected()
  };
}

/**
 * Hook for subscribing to WebSocket topics
 */
export function useWebSocketSubscription<T = WebSocketMessage>(
  topic: string,
  handler: (message: T) => void,
  dependencies: any[] = []
) {
  const handlerRef = useRef(handler);
  const subscriptionRef = useRef<string | null>(null);

  // Update handler reference when it changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const wrappedHandler = (message: T) => {
      handlerRef.current(message);
    };

    const subscribe = () => {
      if (webSocketClient.isConnected()) {
        subscriptionRef.current = webSocketClient.subscribe(topic, wrappedHandler);
      }
    };

    const handleConnectionChange = (connected: boolean) => {
      if (connected) {
        subscribe();
      } else if (subscriptionRef.current) {
        subscriptionRef.current = null;
      }
    };

    // Subscribe if already connected
    subscribe();

    // Listen for connection changes
    webSocketClient.onConnectionChange(handleConnectionChange);

    return () => {
      if (subscriptionRef.current) {
        webSocketClient.unsubscribe(topic);
        subscriptionRef.current = null;
      }
      webSocketClient.removeConnectionListener(handleConnectionChange);
    };
  }, [topic, ...dependencies]);

  return subscriptionRef.current !== null;
}

/**
 * Hook for match live updates
 */
export function useMatchLiveUpdates(matchId: number, enabled: boolean = true) {
  const [matchData, setMatchData] = useState<MatchUpdate | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleMatchUpdate = useCallback((message: MatchUpdate) => {
    if (message.matchId === matchId) {
      setMatchData(message);
    }
  }, [matchId]);

  const handleMatchEvent = useCallback((message: MatchEvent) => {
    if (message.matchId === matchId) {
      setEvents(prev => [...prev, message].slice(-50)); // Keep last 50 events
    }
  }, [matchId]);

  const handleChatMessage = useCallback((message: ChatMessage) => {
    if (message.matchId === matchId) {
      setChatMessages(prev => [...prev, message].slice(-100)); // Keep last 100 messages
    }
  }, [matchId]);

  useWebSocketSubscription(
    `/topic/match/${matchId}`, 
    handleMatchUpdate, 
    [matchId, enabled]
  );

  useWebSocketSubscription(
    `/topic/match/${matchId}/events`, 
    handleMatchEvent, 
    [matchId, enabled]
  );

  useWebSocketSubscription(
    '/topic/match/chat', 
    handleChatMessage, 
    [matchId, enabled]
  );

  const joinMatch = useCallback((username: string) => {
    if (enabled && webSocketClient.isConnected()) {
      webSocketClient.joinMatch(matchId, username);
    }
  }, [matchId, enabled]);

  const leaveMatch = useCallback(() => {
    if (webSocketClient.isConnected()) {
      webSocketClient.leaveMatch();
    }
  }, []);

  const sendChatMessage = useCallback((message: string) => {
    if (webSocketClient.isConnected()) {
      webSocketClient.sendChatMessage(matchId, message);
    }
  }, [matchId]);

  const sendReaction = useCallback((emoji: string, eventId?: string) => {
    if (webSocketClient.isConnected()) {
      webSocketClient.sendReaction(matchId, emoji, eventId);
    }
  }, [matchId]);

  return {
    matchData,
    events,
    chatMessages,
    joinMatch,
    leaveMatch,
    sendChatMessage,
    sendReaction,
    clearEvents: () => setEvents([]),
    clearChat: () => setChatMessages([])
  };
}

/**
 * Hook for global match updates (all matches)
 */
export function useGlobalMatchUpdates() {
  const [matches, setMatches] = useState<Map<number, MatchUpdate>>(new Map());
  const [recentEvents, setRecentEvents] = useState<MatchEvent[]>([]);

  const handleMatchUpdate = useCallback((message: MatchUpdate) => {
    setMatches(prev => new Map(prev.set(message.matchId, message)));
  }, []);

  const handleMatchEvent = useCallback((message: MatchEvent) => {
    setRecentEvents(prev => [message, ...prev].slice(0, 20)); // Keep last 20 events
  }, []);

  useWebSocketSubscription('/topic/matches', handleMatchUpdate);
  useWebSocketSubscription('/topic/events', handleMatchEvent);

  return {
    matches: Array.from(matches.values()),
    recentEvents,
    getMatchById: (matchId: number) => matches.get(matchId),
    clearRecentEvents: () => setRecentEvents([])
  };
}

/**
 * Hook for system notifications
 */
export function useSystemNotifications() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  const handleNotification = useCallback((message: SystemNotification) => {
    setNotifications(prev => [message, ...prev].slice(0, 50)); // Keep last 50 notifications
  }, []);

  useWebSocketSubscription('/topic/notifications', handleNotification);
  useWebSocketSubscription('/topic/system', handleNotification);

  const markAsRead = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    markAsRead,
    clearAll,
    unreadCount: notifications.length
  };
}

/**
 * Hook for WebSocket actions (sending messages)
 */
export function useWebSocketActions() {
  const sendMessage = useCallback((destination: string, body: any) => {
    webSocketClient.send(destination, body);
  }, []);

  const joinMatch = useCallback((matchId: number, username: string) => {
    webSocketClient.joinMatch(matchId, username);
  }, []);

  const leaveMatch = useCallback(() => {
    webSocketClient.leaveMatch();
  }, []);

  const sendChatMessage = useCallback((matchId: number, message: string) => {
    webSocketClient.sendChatMessage(matchId, message);
  }, []);

  const subscribeToLeague = useCallback((leagueId: number, username: string) => {
    webSocketClient.subscribeToLeague(leagueId, username);
  }, []);

  const subscribeToPlayer = useCallback((playerId: number, username: string) => {
    webSocketClient.subscribeToPlayer(playerId, username);
  }, []);

  const submitPrediction = useCallback((matchId: number, prediction: string, type: string) => {
    webSocketClient.submitPrediction(matchId, prediction, type);
  }, []);

  const sendReaction = useCallback((matchId: number, emoji: string, eventId?: string) => {
    webSocketClient.sendReaction(matchId, emoji, eventId);
  }, []);

  const ping = useCallback(() => {
    webSocketClient.ping();
  }, []);

  return {
    sendMessage,
    joinMatch,
    leaveMatch,
    sendChatMessage,
    subscribeToLeague,
    subscribeToPlayer,
    submitPrediction,
    sendReaction,
    ping,
    isConnected: webSocketClient.isConnected()
  };
}
