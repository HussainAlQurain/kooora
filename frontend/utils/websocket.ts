/**
 * WebSocket client for real-time football match updates
 * Handles connection, subscription management, and message processing
 */

import { Client, StompConfig, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface MatchUpdate {
  type: string;
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  timestamp: string;
}

export interface MatchEvent {
  type: string;
  matchId: number;
  eventType: string;
  minute: string;
  description: string;
  player?: string;
  team: string;
  isHomeTeam: boolean;
  homeScore: number;
  awayScore: number;
  timestamp: string;
}

export interface ChatMessage {
  type: string;
  username: string;
  message: string;
  matchId: number;
  timestamp: string;
}

export interface SystemNotification {
  type: string;
  title: string;
  message: string;
  notificationType: string;
  timestamp: string;
}

export type WebSocketMessage = MatchUpdate | MatchEvent | ChatMessage | SystemNotification | any;

class KoooraWebSocket {
  private client: Client | null = null;
  private baseUrl: string;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscriptions: Map<string, string> = new Map();
  private messageHandlers: Map<string, (message: any) => void> = new Map();
  private connectionListeners: ((connected: boolean) => void)[] = [];

  constructor(baseUrl?: string) {
    // Prefer same-origin proxy to avoid CORS and handle backend context-path (/api)
    // Falls back to localhost for SSR/build-time contexts
    this.baseUrl = baseUrl
      ? baseUrl
      : (typeof window !== 'undefined'
          ? `${window.location.origin}/api`
          : 'http://localhost:8080/api');
    
    // Only setup client on the client side to prevent SSR issues
    if (typeof window !== 'undefined') {
      this.setupClient();
    }
  }

  private setupClient(): void {
    // Use SockJS for better browser compatibility
    const socket = () => new SockJS(`${this.baseUrl}/ws`);

    const stompConfig: StompConfig = {
      webSocketFactory: socket,
      connectHeaders: {
        // Add any authentication headers here if needed
      },
      debug: (str: string) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('STOMP Debug:', str);
        }
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log('🟢 WebSocket Connected:', frame);
        this.notifyConnectionListeners(true);
        this.resubscribeAll();
      },
      onDisconnect: (frame) => {
        this.connected = false;
        console.log('🔴 WebSocket Disconnected:', frame);
        this.notifyConnectionListeners(false);
      },
      onStompError: (frame) => {
        console.error('❌ WebSocket STOMP Error:', frame);
        this.connected = false;
        this.notifyConnectionListeners(false);
      },
      onWebSocketError: (error) => {
        console.error('❌ WebSocket Error:', error);
        this.handleReconnection();
      },
      onWebSocketClose: (closeEvent) => {
        console.log('🔌 WebSocket Closed:', closeEvent);
        this.connected = false;
        this.notifyConnectionListeners(false);
        this.handleReconnection();
      }
    };

    this.client = new Client(stompConfig);
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (!this.connected && this.client) {
          this.connect();
        }
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach((destination, topic) => {
      this.subscribe(topic, this.messageHandlers.get(topic)!);
    });
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Ensure we're on the client side
      if (typeof window === 'undefined') {
        reject(new Error('WebSocket can only be used on the client side'));
        return;
      }

      if (!this.client) {
        this.setupClient();
      }

      if (this.connected) {
        resolve();
        return;
      }

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);

      // Create a new client for this connection attempt
      const connectionClient = this.client!;
      
      const cleanup = () => {
        clearTimeout(timeout);
      };

      // Override the connection handlers temporarily
      const originalConnect = connectionClient.onConnect;
      const originalError = connectionClient.onStompError;

      connectionClient.onConnect = (frame) => {
        cleanup();
        if (!resolved) {
          resolved = true;
          resolve();
        }
        originalConnect(frame);
      };

      connectionClient.onStompError = (frame) => {
        cleanup();
        if (!resolved) {
          resolved = true;
          reject(new Error(`STOMP Error: ${frame.headers['message'] || 'Unknown error'}`));
        }
        originalError(frame);
      };

      try {
        connectionClient.activate();
      } catch (error) {
        cleanup();
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.subscriptions.clear();
    this.messageHandlers.clear();
    if (this.client) {
      this.client.deactivate();
    }
    this.connected = false;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connected && this.client?.connected === true;
  }

  /**
   * Subscribe to a topic
   */
  subscribe(topic: string, handler: (message: WebSocketMessage) => void): string | null {
    if (!this.isConnected()) {
      console.warn('⚠️ WebSocket not connected. Storing subscription for later.');
      this.messageHandlers.set(topic, handler);
      return null;
    }

    if (!this.client) return null;

    try {
      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          handler(parsedMessage);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error, message.body);
        }
      });

      this.subscriptions.set(topic, subscription.id);
      this.messageHandlers.set(topic, handler);
      console.log(`✅ Subscribed to ${topic}`);
      
      return subscription.id;
    } catch (error) {
      console.error(`❌ Failed to subscribe to ${topic}:`, error);
      return null;
    }
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic: string): void {
    const subscriptionId = this.subscriptions.get(topic);
    if (subscriptionId && this.client) {
      try {
        this.client.unsubscribe(subscriptionId);
        this.subscriptions.delete(topic);
        this.messageHandlers.delete(topic);
        console.log(`❌ Unsubscribed from ${topic}`);
      } catch (error) {
        console.error(`❌ Failed to unsubscribe from ${topic}:`, error);
      }
    }
  }

  /**
   * Send a message to the server
   */
  send(destination: string, body: any): void {
    if (!this.isConnected() || !this.client) {
      console.error('❌ Cannot send message: WebSocket not connected');
      return;
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      });
      console.log(`📤 Sent message to ${destination}:`, body);
    } catch (error) {
      console.error(`❌ Failed to send message to ${destination}:`, error);
    }
  }

  /**
   * Join a match room for live updates
   */
  joinMatch(matchId: number, username: string): void {
    this.send('/app/match.join', { matchId, username });
  }

  /**
   * Leave a match room
   */
  leaveMatch(): void {
    this.send('/app/match.leave', {});
  }

  /**
   * Send a chat message
   */
  sendChatMessage(matchId: number, message: string): void {
    this.send('/app/match.chat', { matchId, message });
  }

  /**
   * Subscribe to league updates
   */
  subscribeToLeague(leagueId: number, username: string): void {
    this.send('/app/league.subscribe', { leagueId, username });
  }

  /**
   * Subscribe to player updates
   */
  subscribeToPlayer(playerId: number, username: string): void {
    this.send('/app/player.subscribe', { playerId, username });
  }

  /**
   * Submit a match prediction
   */
  submitPrediction(matchId: number, prediction: string, type: string): void {
    this.send('/app/match.prediction', { matchId, prediction, type });
  }

  /**
   * Send a reaction emoji
   */
  sendReaction(matchId: number, emoji: string, eventId?: string): void {
    this.send('/app/match.reaction', { matchId, emoji, eventId });
  }

  /**
   * Send a ping to keep connection alive
   */
  ping(): void {
    this.send('/app/ping', { ping: Date.now() });
  }

  /**
   * Add connection status listener
   */
  onConnectionChange(listener: (connected: boolean) => void): void {
    this.connectionListeners.push(listener);
  }

  /**
   * Remove connection status listener
   */
  removeConnectionListener(listener: (connected: boolean) => void): void {
    const index = this.connectionListeners.indexOf(listener);
    if (index > -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Convenience subscription methods
  subscribeToMatchUpdates(matchId: number, handler: (message: MatchUpdate) => void): string | null {
    return this.subscribe(`/topic/match/${matchId}`, handler);
  }

  subscribeToMatchEvents(matchId: number, handler: (message: MatchEvent) => void): string | null {
    return this.subscribe(`/topic/match/${matchId}/events`, handler);
  }

  subscribeToMatchChat(handler: (message: ChatMessage) => void): string | null {
    return this.subscribe('/topic/match/chat', handler);
  }

  subscribeToAllMatches(handler: (message: MatchUpdate) => void): string | null {
    return this.subscribe('/topic/matches', handler);
  }

  subscribeToAllEvents(handler: (message: MatchEvent) => void): string | null {
    return this.subscribe('/topic/events', handler);
  }

  subscribeToNotifications(handler: (message: SystemNotification) => void): string | null {
    return this.subscribe('/topic/notifications', handler);
  }

  subscribeToSystem(handler: (message: any) => void): string | null {
    return this.subscribe('/topic/system', handler);
  }
}

// Create singleton instance only on client side with lazy initialization
let webSocketClientInstance: KoooraWebSocket | null = null;

export const webSocketClient = {
  getInstance(): KoooraWebSocket {
    if (typeof window === 'undefined') {
      // Return a mock object for server-side rendering
      return {
        connect: () => Promise.resolve(),
        disconnect: () => {},
        isConnected: () => false,
        subscribe: () => null,
        unsubscribe: () => {},
        send: () => {},
        joinMatch: () => {},
        leaveMatch: () => {},
        sendChatMessage: () => {},
        subscribeToLeague: () => {},
        subscribeToPlayer: () => {},
        submitPrediction: () => {},
        sendReaction: () => {},
        ping: () => {},
        onConnectionChange: () => {},
        removeConnectionListener: () => {},
        getStatus: () => ({ connected: false, reconnectAttempts: 0 }),
        subscribeToMatchUpdates: () => null,
        subscribeToMatchEvents: () => null,
        subscribeToMatchChat: () => null,
        subscribeToAllMatches: () => null,
        subscribeToAllEvents: () => null,
        subscribeToNotifications: () => null,
        subscribeToSystem: () => null,
      } as any;
    }
    
    if (!webSocketClientInstance) {
      webSocketClientInstance = new KoooraWebSocket();
    }
    return webSocketClientInstance;
  },
  
  // Proxy all methods to the getInstance()
  connect: () => webSocketClient.getInstance().connect(),
  disconnect: () => webSocketClient.getInstance().disconnect(),
  isConnected: () => webSocketClient.getInstance().isConnected(),
  subscribe: (topic: string, handler: (message: any) => void) => webSocketClient.getInstance().subscribe(topic, handler),
  unsubscribe: (topic: string) => webSocketClient.getInstance().unsubscribe(topic),
  send: (destination: string, body: any) => webSocketClient.getInstance().send(destination, body),
  joinMatch: (matchId: number, username: string) => webSocketClient.getInstance().joinMatch(matchId, username),
  leaveMatch: () => webSocketClient.getInstance().leaveMatch(),
  sendChatMessage: (matchId: number, message: string) => webSocketClient.getInstance().sendChatMessage(matchId, message),
  subscribeToLeague: (leagueId: number, username: string) => webSocketClient.getInstance().subscribeToLeague(leagueId, username),
  subscribeToPlayer: (playerId: number, username: string) => webSocketClient.getInstance().subscribeToPlayer(playerId, username),
  submitPrediction: (matchId: number, prediction: string, type: string) => webSocketClient.getInstance().submitPrediction(matchId, prediction, type),
  sendReaction: (matchId: number, emoji: string, eventId?: string) => webSocketClient.getInstance().sendReaction(matchId, emoji, eventId),
  ping: () => webSocketClient.getInstance().ping(),
  onConnectionChange: (listener: (connected: boolean) => void) => webSocketClient.getInstance().onConnectionChange(listener),
  removeConnectionListener: (listener: (connected: boolean) => void) => webSocketClient.getInstance().removeConnectionListener(listener),
  getStatus: () => webSocketClient.getInstance().getStatus(),
  subscribeToMatchUpdates: (matchId: number, handler: (message: any) => void) => webSocketClient.getInstance().subscribeToMatchUpdates(matchId, handler),
  subscribeToMatchEvents: (matchId: number, handler: (message: any) => void) => webSocketClient.getInstance().subscribeToMatchEvents(matchId, handler),
  subscribeToMatchChat: (handler: (message: any) => void) => webSocketClient.getInstance().subscribeToMatchChat(handler),
  subscribeToAllMatches: (handler: (message: any) => void) => webSocketClient.getInstance().subscribeToAllMatches(handler),
  subscribeToAllEvents: (handler: (message: any) => void) => webSocketClient.getInstance().subscribeToAllEvents(handler),
  subscribeToNotifications: (handler: (message: any) => void) => webSocketClient.getInstance().subscribeToNotifications(handler),
  subscribeToSystem: (handler: (message: any) => void) => webSocketClient.getInstance().subscribeToSystem(handler),
};

export default KoooraWebSocket;
