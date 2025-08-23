'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

interface MatchUpdate {
  type: string;
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  timestamp: string;
}

interface MatchEvent {
  type: string;
  matchId: number;
  eventType: string;
  minute: string;
  description: string;
  player?: string;
  team: string;
  isHomeTeam: boolean;
  homeScore?: number;
  awayScore?: number;
  timestamp: string;
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private maxReconnectAttempts: number = 5;
  private reconnectAttempts: number = 0;
  private isReconnecting: boolean = false;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private messageQueue: any[] = [];
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    // ✅ WebSocket enabled for real-time updates
    console.log('📡 Establishing WebSocket connection...');

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Use SockJS if available, otherwise fall back to native WebSocket
      const backendBase = (typeof window !== 'undefined' && (window as any).BACKEND_URL)
        || process.env.NEXT_PUBLIC_BACKEND_URL
        || 'http://localhost:8080';

      // Use HTTP base to construct WS endpoint safely
      const httpUrl = new URL(backendBase);
      const wsProtocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${httpUrl.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        
        // Send queued messages
        this.messageQueue.forEach(message => {
          this.send(message);
        });
        this.messageQueue = [];

        // Send connection success notification
        this.notifySubscribers('connection', { type: 'CONNECTED' });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        
        if (!this.isReconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        }
        
        this.notifySubscribers('connection', { type: 'DISCONNECTED' });
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifySubscribers('connection', { type: 'ERROR', error });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.reconnect();
    }
  }

  private reconnect(): void {
    // ✅ Reconnect enabled for WebSocket
    console.log('📡 Attempting to reconnect WebSocket...', this.reconnectAttempts);
    
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    // this.isReconnecting = true;
    // this.reconnectAttempts++;

    // console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    // setTimeout(() => {
    //   this.isReconnecting = false;
    //   this.connect();
    // }, this.reconnectInterval);
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.subscribers.clear();
  }

  public send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message);
    }
  }

  public subscribe(topic: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    
    this.subscribers.get(topic)!.add(callback);

    // Return unsubscribe function
    return () => {
      const topicSubscribers = this.subscribers.get(topic);
      if (topicSubscribers) {
        topicSubscribers.delete(callback);
        if (topicSubscribers.size === 0) {
          this.subscribers.delete(topic);
        }
      }
    };
  }

  private notifySubscribers(topic: string, data: any): void {
    const topicSubscribers = this.subscribers.get(topic);
    if (topicSubscribers) {
      topicSubscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    console.log('Received WebSocket message:', message);

    switch (message.type) {
      case 'MATCH_UPDATE':
        this.handleMatchUpdate(message as MatchUpdate);
        break;
      case 'MATCH_EVENT':
        this.handleMatchEvent(message as MatchEvent);
        break;
      case 'MATCH_STATUS_CHANGE':
        this.handleMatchStatusChange(message);
        break;
      case 'STANDINGS_UPDATE':
        this.handleStandingsUpdate(message);
        break;
      case 'PLAYER_STATS_UPDATE':
        this.handlePlayerStatsUpdate(message);
        break;
      case 'NOTIFICATION':
        this.handleNotification(message);
        break;
      case 'CHAT_MESSAGE':
        this.handleChatMessage(message);
        break;
      case 'MATCH_PREDICTION':
        this.handleMatchPrediction(message);
        break;
      case 'MATCH_REACTION':
        this.handleMatchReaction(message);
        break;
      case 'INJURY_UPDATE':
        this.handleInjuryUpdate(message);
        break;
      case 'TRANSFER_NEWS':
        this.handleTransferNews(message);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }

    // Notify all subscribers
    this.notifySubscribers('all', message);
  }

  private handleMatchUpdate(update: MatchUpdate): void {
    this.notifySubscribers('matches', update);
    this.notifySubscribers(`match-${update.matchId}`, update);
    
    // Show toast for score changes
    if (update.homeScore !== undefined && update.awayScore !== undefined) {
      toast(
        `⚽ ${update.homeTeam} ${update.homeScore} - ${update.awayScore} ${update.awayTeam}`,
        { duration: 5000 }
      );
    }
  }

  private handleMatchEvent(event: MatchEvent): void {
    this.notifySubscribers('events', event);
    this.notifySubscribers(`match-${event.matchId}-events`, event);

    // Show toast for important events
    const eventEmojis: { [key: string]: string } = {
      'GOAL': '⚽',
      'PENALTY_GOAL': '⚽',
      'OWN_GOAL': '⚽',
      'YELLOW_CARD': '🟨',
      'RED_CARD': '🟥',
      'SUBSTITUTION': '🔄',
      'HALF_TIME': '⏱️',
      'FULL_TIME': '🏁'
    };

    const emoji = eventEmojis[event.eventType] || '⚪';
    toast(
      `${emoji} ${event.description} (${event.minute}')`,
      { duration: 4000 }
    );
  }

  private handleMatchStatusChange(message: any): void {
    this.notifySubscribers('match-status', message);
    this.notifySubscribers(`match-${message.matchId}-status`, message);

    const statusEmojis: { [key: string]: string } = {
      'LIVE': '🔴',
      'COMPLETED': '✅',
      'CANCELLED': '❌',
      'POSTPONED': '⏰'
    };

    const emoji = statusEmojis[message.newStatus] || '⚪';
    toast(
      `${emoji} ${message.homeTeam} vs ${message.awayTeam} - ${message.newStatus}`,
      { duration: 3000 }
    );
  }

  private handleStandingsUpdate(message: any): void {
    this.notifySubscribers('standings', message);
    this.notifySubscribers(`league-${message.leagueId}-standings`, message);
  }

  private handlePlayerStatsUpdate(message: any): void {
    this.notifySubscribers('player-stats', message);
    this.notifySubscribers(`player-${message.playerId}-stats`, message);
  }

  private handleNotification(message: any): void {
    this.notifySubscribers('notifications', message);
    
    // Show toast notification
    switch (message.notificationType) {
      case 'info':
        toast(message.message);
        break;
      case 'success':
        toast(message.message);
        break;
      case 'warning':
        toast(message.message);
        break;
      case 'error':
        toast(message.message);
        break;
      default:
        toast(message.message);
    }
  }

  private handleChatMessage(message: any): void {
    this.notifySubscribers('chat', message);
    this.notifySubscribers(`match-${message.matchId}-chat`, message);
  }

  private handleMatchPrediction(message: any): void {
    this.notifySubscribers('predictions', message);
    this.notifySubscribers(`match-${message.matchId}-predictions`, message);
  }

  private handleMatchReaction(message: any): void {
    this.notifySubscribers('reactions', message);
    this.notifySubscribers(`match-${message.matchId}-reactions`, message);
  }

  private handleInjuryUpdate(message: any): void {
    this.notifySubscribers('injuries', message);
    this.notifySubscribers(`player-${message.playerId}-injury`, message);
    
    toast(`🩹 ${message.playerName}: ${message.injuryStatus}`, { duration: 5000 });
  }

  private handleTransferNews(message: any): void {
    this.notifySubscribers('transfers', message);
    
    toast(
      `🔄 ${message.playerName}: ${message.fromTeam} → ${message.toTeam}`,
      { duration: 6000 }
    );
  }

  // Convenience methods for common operations
  public joinMatch(matchId: number, username: string = 'Anonymous'): void {
    this.send({
      type: 'match.join',
      matchId,
      username
    });
  }

  public leaveMatch(matchId: number): void {
    this.send({
      type: 'match.leave',
      matchId
    });
  }

  public sendChatMessage(matchId: number, message: string, username: string = 'Anonymous'): void {
    this.send({
      type: 'match.chat',
      matchId,
      message,
      username
    });
  }

  public subscribeToLeague(leagueId: number, username: string = 'Anonymous'): void {
    this.send({
      type: 'league.subscribe',
      leagueId,
      username
    });
  }

  public subscribeToPlayer(playerId: number, username: string = 'Anonymous'): void {
    this.send({
      type: 'player.subscribe',
      playerId,
      username
    });
  }

  public submitPrediction(matchId: number, prediction: string, type: string, username: string = 'Anonymous'): void {
    this.send({
      type: 'match.prediction',
      matchId,
      prediction,
      predictionType: type,
      username
    });
  }

  public submitReaction(matchId: number, emoji: string, eventId?: string, username: string = 'Anonymous'): void {
    this.send({
      type: 'match.reaction',
      matchId,
      emoji,
      eventId,
      username
    });
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

// React hook for using WebSocket service
export const useWebSocket = () => {
  const ws = useRef<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    ws.current = WebSocketService.getInstance();
    ws.current.connect();

    const unsubscribe = ws.current.subscribe('connection', (data: any) => {
      setIsConnected(data.type === 'CONNECTED');
    });

    return () => {
      unsubscribe();
      // Don't disconnect here as other components might be using it
    };
  }, []);

  const subscribe = (topic: string, callback: (data: any) => void) => {
    return ws.current?.subscribe(topic, callback) || (() => {});
  };

  const send = (message: any) => {
    ws.current?.send(message);
  };

  const joinMatch = (matchId: number, username?: string) => {
    ws.current?.joinMatch(matchId, username);
  };

  const leaveMatch = (matchId: number) => {
    ws.current?.leaveMatch(matchId);
  };

  const sendChatMessage = (matchId: number, message: string, username?: string) => {
    ws.current?.sendChatMessage(matchId, message, username);
  };

  const subscribeToLeague = (leagueId: number, username?: string) => {
    ws.current?.subscribeToLeague(leagueId, username);
  };

  const subscribeToPlayer = (playerId: number, username?: string) => {
    ws.current?.subscribeToPlayer(playerId, username);
  };

  const submitPrediction = (matchId: number, prediction: string, type: string, username?: string) => {
    ws.current?.submitPrediction(matchId, prediction, type, username);
  };

  const submitReaction = (matchId: number, emoji: string, eventId?: string, username?: string) => {
    ws.current?.submitReaction(matchId, emoji, eventId, username);
  };

  return {
    isConnected,
    subscribe,
    send,
    joinMatch,
    leaveMatch,
    sendChatMessage,
    subscribeToLeague,
    subscribeToPlayer,
    submitPrediction,
    submitReaction
  };
};
