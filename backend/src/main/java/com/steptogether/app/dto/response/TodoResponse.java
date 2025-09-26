package com.steptogether.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class TodoResponse {
    private String id;
    private String title;
    private String description;
    private boolean completed;
    private Instant createdAt;
}
