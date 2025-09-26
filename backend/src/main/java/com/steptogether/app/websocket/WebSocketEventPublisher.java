package com.steptogether.app.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class WebSocketEventPublisher {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Leader Events - publish actual leaders data
    public void publishLeaderEvent(WebSocketEventType eventType, Object data) {
        String topic = "/topic/leaders";
        System.out.println("🚀 Publishing to " + topic + ": " + eventType + " with data size: " + 
            (data instanceof java.util.List ? ((java.util.List<?>) data).size() : "not a list"));
        messagingTemplate.convertAndSend(topic, data); // Send data directly
    }

    // Part Events - publish actual parts data
    public void publishPartEvent(WebSocketEventType eventType, Object data) {
        String topic = "/topic/parts";
        System.out.println("🚀 Publishing to " + topic + ": " + eventType + " with data size: " + 
            (data instanceof java.util.List ? ((java.util.List<?>) data).size() : "not a list"));
        messagingTemplate.convertAndSend(topic, data); // Send data directly
    }

    // System Events
    public void publishSystemEvent(WebSocketEventType eventType, Object data) {
        String topic = "/topic/system";
        Map<String, Object> message = createMessage(eventType, data);
        messagingTemplate.convertAndSend(topic, message);
    }

    // Todo Events
    public void publishTodoEvent(WebSocketEventType eventType, Object data) {
        String topic = "/topic/todos";
        Map<String, Object> message = createMessage(eventType, data);
        messagingTemplate.convertAndSend(topic, message);
    }

    private Map<String, Object> createMessage(WebSocketEventType eventType, Object data) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", eventType.name());
        message.put("data", data);
        message.put("timestamp", System.currentTimeMillis());
        return message;
    }
}