package com.kooora.app.websocket;

import com.kooora.app.config.WebSocketConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

import static org.mockito.Mockito.*;

/**
 * Unit tests for WebSocket configuration
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
public class WebSocketConfigTest {

    @Test
    public void testConfigureMessageBroker() {
        // Given
        WebSocketConfig config = new WebSocketConfig();
        MessageBrokerRegistry registry = mock(MessageBrokerRegistry.class);
        
        // When
        config.configureMessageBroker(registry);
        
        // Then
        verify(registry).enableSimpleBroker("/topic", "/queue");
        verify(registry).setApplicationDestinationPrefixes("/app");
        verify(registry).setUserDestinationPrefix("/user");
    }

    @Test
    public void testRegisterStompEndpoints() {
        // Given
        WebSocketConfig config = new WebSocketConfig();
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class);
        org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration registration = 
            mock(org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration.class);
        org.springframework.web.socket.config.annotation.SockJsServiceRegistration sockJsRegistration = 
            mock(org.springframework.web.socket.config.annotation.SockJsServiceRegistration.class);
        
        // Mock the chained method calls
        when(registry.addEndpoint("/ws")).thenReturn(registration);
        when(registry.addEndpoint("/api/ws")).thenReturn(registration);
        when(registration.withSockJS()).thenReturn(sockJsRegistration);
        when(registration.setAllowedOriginPatterns("*")).thenReturn(registration);
        
        // When
        config.registerStompEndpoints(registry);
        
        // Then
        verify(registry, times(1)).addEndpoint("/ws");
        verify(registry, times(1)).addEndpoint("/api/ws");
        verify(registration, times(2)).withSockJS();
        verify(registration, times(2)).setAllowedOriginPatterns("*");
    }
}
