package com.steptogether.app.model;

import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Leader {
    private String id;
    private String name;
    private boolean needsHelp;
    private boolean completed;
    private String createdAt;
    private List<Todo> todoList;

    public static Leader newLeader(String name) {
        return Leader.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .needsHelp(false)
                .completed(false)
                .todoList(new ArrayList<>())
                .createdAt(Instant.now().toString())
                .build();
    }

    // Ensure todoList is never null
    public List<Todo> getTodoList() {
        if (todoList == null) {
            todoList = new ArrayList<>();
        }
        return todoList;
    }
    
    // Override setter to ensure it's never set to null
    public void setTodoList(List<Todo> todoList) {
        this.todoList = todoList != null ? todoList : new ArrayList<>();
    }
}
