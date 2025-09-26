package com.steptogether.app.model;

import com.google.cloud.Timestamp;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Leader {
    private String id;
    private String name;
    private String status; // PENDING | DONE
    private boolean needsHelp;
    private TodoProgress todoProgress;
    private Timestamp createdAt;
    private Timestamp completedAt;
    private Timestamp helpRequestedAt;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TodoProgress {
        private int completed;
        private int total;
    }

    public static Leader newLeader(String name) {
        return Leader.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .status("PENDING")
                .needsHelp(false)
                .todoProgress(TodoProgress.builder().completed(0).total(0).build())
                .createdAt(Timestamp.now())   // ✅ dùng Timestamp thay vì Instant
                .build();
    }
}
