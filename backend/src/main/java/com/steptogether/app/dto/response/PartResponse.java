package com.steptogether.app.dto.response;

import com.steptogether.app.model.Todo;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class PartResponse {
    private String id;
    private String name;
    private String description;
    private boolean active;
    private List<Todo> todoList;
    private String createdAt;
}
