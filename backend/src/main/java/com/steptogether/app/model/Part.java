package com.steptogether.app.model;

import lombok.*;

import java.time.Instant;
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
    private boolean active;
    private List<Todo> todoList;
    private String createdAt;

    public static Part newPart(String name, String description, List<Todo> todos) {
        return Part.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .description(description)
                .active(false)
                .todoList(todos)
                .createdAt(Instant.now().toString())
                .build();
    }
}
