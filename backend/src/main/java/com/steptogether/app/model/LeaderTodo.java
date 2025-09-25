package com.steptogether.app.model;

import com.google.cloud.Timestamp;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderTodo {
    private String leaderId;
    private String todoId;
    private boolean completed;
    private Timestamp completedAt;   // ✅ thay Instant bằng Timestamp
}
