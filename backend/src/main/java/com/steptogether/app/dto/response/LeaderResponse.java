package com.steptogether.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class LeaderResponse {
    private String id;
    private String name;
    private String status; // PENDING | DONE
    private boolean needsHelp;
    private TodoProgress todoProgress;
    private Instant createdAt;
    private Instant completedAt;
    private Instant helpRequestedAt;

    @Getter
    @Setter
    @Builder
    public static class TodoProgress {
        private int completed;
        private int total;
    }
}
