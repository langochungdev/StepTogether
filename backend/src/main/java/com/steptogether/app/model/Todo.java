package com.steptogether.app.model;

import com.google.cloud.Timestamp;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Todo {
    private String id;
    private String title;
    private String description;
    private boolean completed;
    private Timestamp createdAt;   // ✅ thay Instant bằng Timestamp

    public static Todo newTodo(String title, String description) {
        return Todo.builder()
                .id(UUID.randomUUID().toString())
                .title(title)
                .description(description)
                .completed(false)
                .createdAt(Timestamp.now())   // ✅ dùng Timestamp
                .build();
    }
}
