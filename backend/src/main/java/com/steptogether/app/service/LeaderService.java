package com.steptogether.app.service;

import com.google.firebase.database.DataSnapshot;
import com.steptogether.app.exception.ValidationException;
import com.steptogether.app.exception.ResourceNotFoundException;
import com.steptogether.app.model.Leader;
import com.steptogether.app.model.Todo;
import com.steptogether.app.dto.response.TodoToggleResponse;
import com.steptogether.app.websocket.WebSocketEventPublisher;
import com.steptogether.app.websocket.WebSocketEventType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;

@Service
public class LeaderService {

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private PartService partService;

    @Autowired
    private WebSocketEventPublisher eventPublisher;

    @Autowired
    private CacheService cacheService;

    public CompletableFuture<Leader> registerLeader(String name) {
        return getAllLeaders().thenCompose(leaders -> {
            // Check duplicate
            if (leaders.stream().anyMatch(l -> l.getName().equalsIgnoreCase(name))) {
                throw new ValidationException("Tên leader đã tồn tại");
            }

            // Get active part and copy its todos
            return partService.getActivePart().thenCompose(activePart -> {
                Leader leader = Leader.newLeader(name);
                
                // Copy todos from active part to leader
                if (activePart != null && activePart.getTodoList() != null) {
                    leader.setTodoList(new ArrayList<>(activePart.getTodoList()));
                }

                return firebaseService.setValue("leaders/" + leader.getId(), leader)
                    .thenCompose(v -> {
                        // Clear cache
                        cacheService.remove("leaders:all");
                        // Get all leaders and publish
                        return getAllLeaders().thenApply(allLeaders -> {
                            eventPublisher.publishLeaderEvent(WebSocketEventType.LEADER_REGISTERED, allLeaders);
                            return leader;
                        });
                    });
            });
        });
    }

    public CompletableFuture<List<Leader>> getAllLeaders() {
        // Try cache first
        @SuppressWarnings("unchecked")
        List<Leader> cachedLeaders = cacheService.get("leaders:all", List.class);
        if (cachedLeaders != null) {
            return CompletableFuture.completedFuture(cachedLeaders);
        }

        return firebaseService.getValue("leaders").thenApply(snapshot -> {
            List<Leader> leaders = new ArrayList<>();
            if (snapshot.exists()) {
                for (DataSnapshot child : snapshot.getChildren()) {
                    Leader leader = child.getValue(Leader.class);
                    if (leader != null) {
                        leaders.add(leader);
                    }
                }
            }
            // Cache the result
            cacheService.put("leaders:all", leaders);
            return leaders;
        });
    }

    public CompletableFuture<Leader> getLeaderById(String id) {
        return firebaseService.getValue("leaders/" + id).thenApply(snapshot -> {
            if (!snapshot.exists()) {
                throw new ResourceNotFoundException("Không tìm thấy leader với ID: " + id);
            }
            return snapshot.getValue(Leader.class);
        });
    }

    public CompletableFuture<Leader> completeLeader(String id) {
        return getLeaderById(id).thenCompose(leader -> {
            leader.setCompleted(true);
            leader.setNeedsHelp(false);

            return firebaseService.setValue("leaders/" + id, leader)
                .thenCompose(v -> {
                    // Clear cache
                    cacheService.remove("leaders:all");
                    // Get all leaders and publish
                    return getAllLeaders().thenApply(allLeaders -> {
                        eventPublisher.publishLeaderEvent(WebSocketEventType.LEADER_COMPLETED, allLeaders);
                        return leader;
                    });
                });
        });
    }

    public CompletableFuture<Leader> toggleHelp(String id, boolean needsHelp) {
        return getLeaderById(id).thenCompose(leader -> {
            leader.setNeedsHelp(needsHelp);

            return firebaseService.setValue("leaders/" + id, leader)
                .thenCompose(v -> {
                    // Clear cache
                    cacheService.remove("leaders:all");
                    // Get all leaders and publish
                    return getAllLeaders().thenApply(allLeaders -> {
                        eventPublisher.publishLeaderEvent(WebSocketEventType.LEADER_NEEDS_HELP, allLeaders);
                        return leader;
                    });
                });
        });
    }

    public CompletableFuture<TodoToggleResponse> toggleTodo(String leaderId, String todoId) {
        return getLeaderById(leaderId).thenCompose(leader -> {
            // Find the todo in leader's todo list
            Todo todo = leader.getTodoList().stream()
                .filter(t -> t.getId().equals(todoId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy todo"));

            // Toggle the todo completion status
            boolean newStatus = !todo.isCompleted();
            todo.setCompleted(newStatus);

            // Save leader
            return firebaseService.setValue("leaders/" + leaderId, leader)
                .thenCompose(v -> {
                    // Clear cache
                    cacheService.remove("leaders:all");
                    
                    TodoToggleResponse response = new TodoToggleResponse(todoId, newStatus);
                    
                    // Get all leaders and publish
                    return getAllLeaders().thenApply(allLeaders -> {
                        eventPublisher.publishLeaderEvent(WebSocketEventType.TODO_TOGGLED, allLeaders);
                        return response;
                    });
                });
        });
    }

    public CompletableFuture<Void> deleteLeader(String id) {
        return firebaseService.removeValue("leaders/" + id)
            .thenCompose(v -> {
                // Clear cache
                cacheService.remove("leaders:all");
                // Get all leaders and publish
                return getAllLeaders().thenApply(allLeaders -> {
                    eventPublisher.publishLeaderEvent(WebSocketEventType.LEADER_DELETED, allLeaders);
                    return v;
                });
            });
    }
}
