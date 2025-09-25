package com.steptogether.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
public class PartResponse {
    private String id;
    private String name;
    private String description;
    private boolean isActive;
    private List<TodoResponse> todoList;
    private Instant createdAt;
}
