package com.steptogether.app.service;

import com.steptogether.app.model.Leader;
import com.steptogether.app.model.Part;
import com.steptogether.app.dto.response.SystemStats;
import com.steptogether.app.websocket.WebSocketEventPublisher;
import com.steptogether.app.websocket.WebSocketEventType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class SystemService {

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private LeaderService leaderService;

    @Autowired
    private PartService partService;

    @Autowired
    private WebSocketEventPublisher eventPublisher;

    @Autowired
    private CacheService cacheService;

    public CompletableFuture<Void> resetSystem() {
        // Reset all leaders to uncompleted state instead of deleting them
        return leaderService.getAllLeaders().thenCompose(leaders -> {
            List<CompletableFuture<Void>> resetFutures = new ArrayList<>();
            
            // Reset each leader's status
            for (Leader leader : leaders) {
                leader.setCompleted(false);
                leader.setNeedsHelp(false);
                // Reset todos to uncompleted if they have any
                if (leader.getTodoList() != null) {
                    leader.getTodoList().forEach(todo -> todo.setCompleted(false));
                }
                
                resetFutures.add(firebaseService.setValue("leaders/" + leader.getId(), leader));
            }
            
            // Reset system state
            CompletableFuture<Void> clearActivePartFuture = firebaseService.removeValue("system/activePart");
            CompletableFuture<Void> clearStatsFuture = firebaseService.removeValue("system/stats");
            
            // Combine all futures
            resetFutures.add(clearActivePartFuture);
            resetFutures.add(clearStatsFuture);

            return CompletableFuture.allOf(resetFutures.toArray(new CompletableFuture[0]))
                .thenCompose(v -> {
                    // Clear all caches
                    cacheService.clear();
                    
                    // Get updated leaders and publish
                    return leaderService.getAllLeaders().thenCompose(updatedLeaders -> {
                        return partService.getAllParts().thenApply(allParts -> {
                            eventPublisher.publishLeaderEvent(WebSocketEventType.SYSTEM_RESET, updatedLeaders);
                            eventPublisher.publishPartEvent(WebSocketEventType.SYSTEM_RESET, allParts);
                            return null;
                        });
                    });
                });
        });
    }

    public CompletableFuture<SystemStats> getSystemStats() {
        // Try cache first
        SystemStats cachedStats = cacheService.get("system:stats", SystemStats.class);
        if (cachedStats != null) {
            return CompletableFuture.completedFuture(cachedStats);
        }

        CompletableFuture<List<Leader>> leadersFuture = leaderService.getAllLeaders();
        CompletableFuture<List<Part>> partsFuture = partService.getAllParts();
        CompletableFuture<Part> activePartFuture = partService.getActivePart();

        return CompletableFuture.allOf(leadersFuture, partsFuture, activePartFuture)
            .thenApply(v -> {
                List<Leader> leaders = leadersFuture.join();

                int totalLeaders = leaders.size();
                int completedLeaders = (int) leaders.stream()
                    .filter(Leader::isCompleted)
                    .count();

                SystemStats stats = new SystemStats(totalLeaders, completedLeaders);

                // Cache the result
                cacheService.put("system:stats", stats);
                return stats;
            });
    }
}
