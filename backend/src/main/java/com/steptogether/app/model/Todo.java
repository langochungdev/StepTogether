package com.steptogether.app.model;

import lombok.*;

import java.time.Instant;
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
    private String createdAt;

    public static Todo newTodo(String title, String description) {
        return Todo.builder()
                .id(UUID.randomUUID().toString())
                .title(title)
                .description(description)
                .completed(false)
                .createdAt(Instant.now().toString())
                .build();
    }
}
