package com.steptogether.app.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class UpdateEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi event ra /topic/updates
     * @param type loại event (LEADER_REGISTERED, PART_ACTIVATED, SYSTEM_RESET...)
     * @param data dữ liệu event (object hoặc map)
     */
    public void publish(String type, Object data) {
        Map<String, Object> payload = Map.of(
                "type", type,
                "data", data
        );
        messagingTemplate.convertAndSend("/topic/updates", payload);
    }
}
