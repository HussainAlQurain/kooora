package com.kooora.app.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CompletableFuture;

/**
 * Service for managing push notifications to PWA clients
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Service
public class PushNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);
    
    private final ObjectMapper objectMapper;
    
    // In-memory storage for push subscriptions (in production, use database)
    private final Set<PushSubscription> activeSubscriptions = ConcurrentHashMap.newKeySet();
    
    @Value("${app.notifications.vapid.public-key:}")
    private String vapidPublicKey;
    
    @Value("${app.notifications.vapid.private-key:}")
    private String vapidPrivateKey;
    
    @Value("${app.notifications.vapid.subject:mailto:admin@kooora.com}")
    private String vapidSubject;

    public PushNotificationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Register a new push subscription
     */
    public void subscribeToPushNotifications(PushSubscription subscription) {
        logger.info("Registering new push subscription: {}", subscription.getEndpoint());
        activeSubscriptions.add(subscription);
    }

    /**
     * Unregister a push subscription
     */
    public void unsubscribeFromPushNotifications(String endpoint) {
        logger.info("Unregistering push subscription: {}", endpoint);
        activeSubscriptions.removeIf(sub -> sub.getEndpoint().equals(endpoint));
    }

    /**
     * Send notification to all subscribed users
     */
    public CompletableFuture<Void> sendNotificationToAll(PushNotificationPayload payload) {
        return CompletableFuture.runAsync(() -> {
            logger.info("Sending push notification to {} subscribers", activeSubscriptions.size());
            
            for (PushSubscription subscription : activeSubscriptions) {
                try {
                    sendNotificationToSubscription(subscription, payload);
                } catch (Exception e) {
                    logger.error("Failed to send notification to subscription {}: {}", 
                               subscription.getEndpoint(), e.getMessage());
                    // Remove invalid subscriptions
                    activeSubscriptions.remove(subscription);
                }
            }
        });
    }

    /**
     * Send notification for match updates
     */
    public void sendMatchUpdateNotification(Long matchId, String homeTeam, String awayTeam, 
                                          Integer homeScore, Integer awayScore, String event) {
        PushNotificationPayload payload = new PushNotificationPayload(
            "Match Update",
            String.format("%s vs %s - %s", homeTeam, awayTeam, event),
            "/matches/" + matchId,
            "match-update",
            Map.of(
                "matchId", matchId,
                "homeTeam", homeTeam,
                "awayTeam", awayTeam,
                "homeScore", homeScore != null ? homeScore : 0,
                "awayScore", awayScore != null ? awayScore : 0,
                "event", event
            )
        );
        
        sendNotificationToAll(payload);
    }

    /**
     * Send notification for goal alerts
     */
    public void sendGoalNotification(Long matchId, String homeTeam, String awayTeam, 
                                   Integer homeScore, Integer awayScore, String scorer) {
        PushNotificationPayload payload = new PushNotificationPayload(
            "⚽ GOAL!",
            String.format("%s scored! %s %d-%d %s", scorer, homeTeam, homeScore, awayScore, awayTeam),
            "/matches/" + matchId,
            "goal",
            Map.of(
                "matchId", matchId,
                "homeTeam", homeTeam,
                "awayTeam", awayTeam,
                "homeScore", homeScore,
                "awayScore", awayScore,
                "scorer", scorer
            )
        );
        
        sendNotificationToAll(payload);
    }

    /**
     * Send notification for match start
     */
    public void sendMatchStartNotification(Long matchId, String homeTeam, String awayTeam) {
        PushNotificationPayload payload = new PushNotificationPayload(
            "Match Started",
            String.format("🏈 %s vs %s is now live!", homeTeam, awayTeam),
            "/matches/" + matchId,
            "match-start",
            Map.of(
                "matchId", matchId,
                "homeTeam", homeTeam,
                "awayTeam", awayTeam
            )
        );
        
        sendNotificationToAll(payload);
    }

    /**
     * Send custom notification
     */
    public void sendCustomNotification(String title, String body, String url, String tag, Map<String, Object> data) {
        PushNotificationPayload payload = new PushNotificationPayload(title, body, url, tag, data);
        sendNotificationToAll(payload);
    }

    /**
     * Get VAPID public key for client configuration
     */
    public String getVapidPublicKey() {
        return vapidPublicKey;
    }

    /**
     * Get subscription count
     */
    public int getActiveSubscriptionCount() {
        return activeSubscriptions.size();
    }

    /**
     * Send notification to specific subscription
     * In a real implementation, this would use a push notification library like web-push
     */
    private void sendNotificationToSubscription(PushSubscription subscription, PushNotificationPayload payload) {
        try {
            // Placeholder for actual push notification sending
            // In production, you would use libraries like:
            // - nl.martijndwars:web-push
            // - or implement Web Push Protocol manually
            
            logger.info("Sending notification '{}' to endpoint: {}", 
                       payload.getTitle(), subscription.getEndpoint());
            
            // Simulate sending (in real implementation, make HTTP request to push service)
            simulatePushDelivery(subscription, payload);
            
        } catch (Exception e) {
            logger.error("Failed to send push notification: {}", e.getMessage());
            throw new RuntimeException("Push notification failed", e);
        }
    }

    /**
     * Simulate push notification delivery (for development/testing)
     */
    private void simulatePushDelivery(PushSubscription subscription, PushNotificationPayload payload) {
        logger.info("📱 PUSH NOTIFICATION DELIVERED:");
        logger.info("  📧 To: {}", subscription.getEndpoint());
        logger.info("  📌 Title: {}", payload.getTitle());
        logger.info("  📝 Body: {}", payload.getBody());
        logger.info("  🏷️ Tag: {}", payload.getTag());
        logger.info("  🔗 URL: {}", payload.getUrl());
        logger.info("  📊 Data: {}", payload.getData());
    }

    /**
     * Push Subscription model
     */
    public static class PushSubscription {
        private String endpoint;
        private Keys keys;

        public PushSubscription() {}

        public PushSubscription(String endpoint, Keys keys) {
            this.endpoint = endpoint;
            this.keys = keys;
        }

        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        
        public Keys getKeys() { return keys; }
        public void setKeys(Keys keys) { this.keys = keys; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof PushSubscription)) return false;
            PushSubscription that = (PushSubscription) o;
            return endpoint.equals(that.endpoint);
        }

        @Override
        public int hashCode() {
            return endpoint.hashCode();
        }

        public static class Keys {
            private String p256dh;
            private String auth;

            public Keys() {}

            public Keys(String p256dh, String auth) {
                this.p256dh = p256dh;
                this.auth = auth;
            }

            public String getP256dh() { return p256dh; }
            public void setP256dh(String p256dh) { this.p256dh = p256dh; }
            
            public String getAuth() { return auth; }
            public void setAuth(String auth) { this.auth = auth; }
        }
    }

    /**
     * Push Notification Payload model
     */
    public static class PushNotificationPayload {
        private String title;
        private String body;
        private String url;
        private String tag;
        private Map<String, Object> data;

        public PushNotificationPayload() {}

        public PushNotificationPayload(String title, String body, String url, String tag, Map<String, Object> data) {
            this.title = title;
            this.body = body;
            this.url = url;
            this.tag = tag;
            this.data = data;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
        
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        
        public String getTag() { return tag; }
        public void setTag(String tag) { this.tag = tag; }
        
        public Map<String, Object> getData() { return data; }
        public void setData(Map<String, Object> data) { this.data = data; }
    }
}
