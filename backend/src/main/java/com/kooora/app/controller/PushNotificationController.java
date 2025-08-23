package com.kooora.app.controller;

import com.kooora.app.service.PushNotificationService;
import com.kooora.app.service.PushNotificationService.PushSubscription;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for managing push notifications and PWA features
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/push-notifications")
@Tag(name = "Push Notifications", description = "PWA push notification management APIs")
@CrossOrigin(origins = "*")
public class PushNotificationController {

    private static final Logger logger = LoggerFactory.getLogger(PushNotificationController.class);

    @Autowired
    private PushNotificationService pushNotificationService;

    @PostMapping("/subscribe")
    @Operation(summary = "Subscribe to push notifications", description = "Register a new push notification subscription")
    @ApiResponse(responseCode = "200", description = "Successfully subscribed to push notifications")
    @ApiResponse(responseCode = "400", description = "Invalid subscription data")
    public ResponseEntity<Map<String, Object>> subscribe(@RequestBody PushSubscription subscription) {
        try {
            logger.info("Received push notification subscription request");
            
            if (subscription.getEndpoint() == null || subscription.getEndpoint().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid subscription data",
                    "message", "Endpoint is required"
                ));
            }
            
            pushNotificationService.subscribeToPushNotifications(subscription);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully subscribed to push notifications",
                "subscriptionCount", pushNotificationService.getActiveSubscriptionCount()
            ));
            
        } catch (Exception e) {
            logger.error("Error subscribing to push notifications: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Subscription failed",
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/unsubscribe")
    @Operation(summary = "Unsubscribe from push notifications", description = "Remove a push notification subscription")
    @ApiResponse(responseCode = "200", description = "Successfully unsubscribed from push notifications")
    public ResponseEntity<Map<String, Object>> unsubscribe(@RequestBody Map<String, String> request) {
        try {
            String endpoint = request.get("endpoint");
            
            if (endpoint == null || endpoint.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid request",
                    "message", "Endpoint is required"
                ));
            }
            
            pushNotificationService.unsubscribeFromPushNotifications(endpoint);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully unsubscribed from push notifications",
                "subscriptionCount", pushNotificationService.getActiveSubscriptionCount()
            ));
            
        } catch (Exception e) {
            logger.error("Error unsubscribing from push notifications: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Unsubscription failed",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/vapid-public-key")
    @Operation(summary = "Get VAPID public key", description = "Get the VAPID public key for push notification subscription")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved VAPID public key")
    public ResponseEntity<Map<String, Object>> getVapidPublicKey() {
        try {
            String publicKey = pushNotificationService.getVapidPublicKey();
            
            return ResponseEntity.ok(Map.of(
                "publicKey", publicKey != null ? publicKey : "",
                "available", publicKey != null && !publicKey.isEmpty()
            ));
            
        } catch (Exception e) {
            logger.error("Error retrieving VAPID public key: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to retrieve VAPID key",
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/test")
    @Operation(summary = "Send test notification", description = "Send a test push notification to all subscribers")
    @ApiResponse(responseCode = "200", description = "Test notification sent successfully")
    public ResponseEntity<Map<String, Object>> sendTestNotification(@RequestBody(required = false) Map<String, String> request) {
        try {
            String title = request != null ? request.getOrDefault("title", "Test Notification") : "Test Notification";
            String body = request != null ? request.getOrDefault("body", "This is a test notification from Kooora!") : "This is a test notification from Kooora!";
            
            pushNotificationService.sendCustomNotification(
                title,
                body,
                "/",
                "test",
                Map.of("timestamp", System.currentTimeMillis())
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Test notification sent",
                "recipientCount", pushNotificationService.getActiveSubscriptionCount()
            ));
            
        } catch (Exception e) {
            logger.error("Error sending test notification: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to send test notification",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "Get push notification statistics", description = "Get statistics about active push notification subscriptions")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved push notification statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            return ResponseEntity.ok(Map.of(
                "activeSubscriptions", pushNotificationService.getActiveSubscriptionCount(),
                "vapidKeyConfigured", pushNotificationService.getVapidPublicKey() != null && !pushNotificationService.getVapidPublicKey().isEmpty(),
                "serviceStatus", "active"
            ));
            
        } catch (Exception e) {
            logger.error("Error retrieving push notification stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to retrieve stats",
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/send-match-update")
    @Operation(summary = "Send match update notification", description = "Send a push notification for match updates")
    @ApiResponse(responseCode = "200", description = "Match update notification sent successfully")
    public ResponseEntity<Map<String, Object>> sendMatchUpdateNotification(@RequestBody Map<String, Object> request) {
        try {
            Long matchId = Long.valueOf(request.get("matchId").toString());
            String homeTeam = (String) request.get("homeTeam");
            String awayTeam = (String) request.get("awayTeam");
            Integer homeScore = request.get("homeScore") != null ? Integer.valueOf(request.get("homeScore").toString()) : null;
            Integer awayScore = request.get("awayScore") != null ? Integer.valueOf(request.get("awayScore").toString()) : null;
            String event = (String) request.get("event");
            
            pushNotificationService.sendMatchUpdateNotification(matchId, homeTeam, awayTeam, homeScore, awayScore, event);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Match update notification sent",
                "recipientCount", pushNotificationService.getActiveSubscriptionCount()
            ));
            
        } catch (Exception e) {
            logger.error("Error sending match update notification: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to send match update notification",
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/send-goal-notification")
    @Operation(summary = "Send goal notification", description = "Send a push notification for goals")
    @ApiResponse(responseCode = "200", description = "Goal notification sent successfully")
    public ResponseEntity<Map<String, Object>> sendGoalNotification(@RequestBody Map<String, Object> request) {
        try {
            Long matchId = Long.valueOf(request.get("matchId").toString());
            String homeTeam = (String) request.get("homeTeam");
            String awayTeam = (String) request.get("awayTeam");
            Integer homeScore = Integer.valueOf(request.get("homeScore").toString());
            Integer awayScore = Integer.valueOf(request.get("awayScore").toString());
            String scorer = (String) request.get("scorer");
            
            pushNotificationService.sendGoalNotification(matchId, homeTeam, awayTeam, homeScore, awayScore, scorer);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Goal notification sent",
                "recipientCount", pushNotificationService.getActiveSubscriptionCount()
            ));
            
        } catch (Exception e) {
            logger.error("Error sending goal notification: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to send goal notification",
                "message", e.getMessage()
            ));
        }
    }
}
