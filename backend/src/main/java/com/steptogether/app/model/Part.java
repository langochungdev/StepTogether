package com.steptogether.app.model;

import com.google.cloud.Timestamp;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Part {
    private String id;
    private String name;
    private String description;
    private boolean isActive;
    private List<Todo> todoList;
    private Timestamp createdAt;   // ✅ thay Instant bằng Timestamp

    public static Part newPart(String name, String description, List<Todo> todos) {
        return Part.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .description(description)
                .isActive(false)
                .todoList(todos)
                .createdAt(Timestamp.now())   // ✅ dùng Timestamp
                .build();
    }
}
