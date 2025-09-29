package com.steptogether.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // client subscribe /topic/*
        config.setApplicationDestinationPrefixes("/app"); // client gửi /app/*
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String frontendUrl = System.getenv("FRONTEND_URL");
        if (frontendUrl == null) {
            frontendUrl = "http://localhost:3000"; // Default for development
        }
        registry.addEndpoint("/ws/updates")
<<<<<<< HEAD
                .setAllowedOrigins(frontendUrl)
                .withSockJS();
=======
                .setAllowedOriginPatterns("http://localhost:3000", "https://step-together.vercel.app");
>>>>>>> 3d98cc74dadfd38b5ef48d7eed376a7d8fe7e59c
    }
}
