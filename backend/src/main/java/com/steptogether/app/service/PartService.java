package com.steptogether.app.service;

import com.google.firebase.database.DataSnapshot;
import com.steptogether.app.exception.ResourceNotFoundException;
import com.steptogether.app.model.Part;
import com.steptogether.app.model.Todo;
import com.steptogether.app.dto.request.PartCreateRequest;
import com.steptogether.app.dto.request.PartUpdateRequest;
import com.steptogether.app.websocket.WebSocketEventPublisher;
import com.steptogether.app.websocket.WebSocketEventType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;

@Service
public class PartService {

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private WebSocketEventPublisher eventPublisher;

    @Autowired
    private CacheService cacheService;

    public CompletableFuture<Part> getPartById(String id) {
        return firebaseService.getValue("parts/" + id).thenApply(snapshot -> {
            if (!snapshot.exists()) {
                throw new ResourceNotFoundException("Không tìm thấy part với ID: " + id);
            }
            return snapshot.getValue(Part.class);
        });
    }

    public CompletableFuture<Part> createPart(PartCreateRequest request) {
        List<Todo> todos = new ArrayList<>();
        
        // Create todos from request
        if (request.getTodoList() != null) {
            for (var todoReq : request.getTodoList()) {
                Todo todo = Todo.newTodo(todoReq.getTitle(), todoReq.getDescription());
                todos.add(todo);
            }
        }

        Part part = Part.newPart(request.getName(), request.getDescription(), todos);
        
        return firebaseService.setValue("parts/" + part.getId(), part)
            .thenCompose(v -> {
                // Clear cache
                cacheService.remove("parts:all");
                // Get all parts and publish
                return getAllParts().thenApply(allParts -> {
                    eventPublisher.publishPartEvent(WebSocketEventType.PART_CREATED, allParts);
                    return part;
                });
            });
    }

    public CompletableFuture<List<Part>> getAllParts() {
        // Try cache first
        @SuppressWarnings("unchecked")
        List<Part> cachedParts = cacheService.get("parts:all", List.class);
        if (cachedParts != null) {
            return CompletableFuture.completedFuture(cachedParts);
        }

        return firebaseService.getValue("parts").thenApply(snapshot -> {
            List<Part> parts = new ArrayList<>();
            if (snapshot.exists()) {
                for (DataSnapshot child : snapshot.getChildren()) {
                    Part part = child.getValue(Part.class);
                    if (part != null) {
                        parts.add(part);
                    }
                }
            }
            // Cache the result
            cacheService.put("parts:all", parts);
            return parts;
        });
    }

    public CompletableFuture<Part> updatePart(String id, PartUpdateRequest request) {
        return getPartById(id).thenCompose(part -> {
            // Update basic info
            if (request.getName() != null) {
                part.setName(request.getName());
            }
            if (request.getDescription() != null) {
                part.setDescription(request.getDescription());
            }

            // Update todo list if provided
            if (request.getTodoList() != null) {
                List<Todo> newTodos = new ArrayList<>();
                for (var todoReq : request.getTodoList()) {
                    Todo todo;
                    if (todoReq.getId() != null) {
                        // Update existing todo
                        todo = part.getTodoList().stream()
                            .filter(t -> t.getId().equals(todoReq.getId()))
                            .findFirst()
                            .orElse(new Todo());
                        todo.setTitle(todoReq.getTitle());
                        todo.setDescription(todoReq.getDescription());
                    } else {
                        // Create new todo
                        todo = Todo.newTodo(todoReq.getTitle(), todoReq.getDescription());
                    }
                    newTodos.add(todo);
                }
                part.setTodoList(newTodos);
            }

            return firebaseService.setValue("parts/" + id, part)
                .thenCompose(v -> {
                    // Clear cache
                    cacheService.remove("parts:all");
                    cacheService.remove("parts:active");
                    // Get all parts and publish
                    return getAllParts().thenApply(allParts -> {
                        eventPublisher.publishPartEvent(WebSocketEventType.PART_UPDATED, allParts);
                        return part;
                    });
                });
        });
    }

    public CompletableFuture<Void> deletePart(String id) {
        return getPartById(id).thenCompose(part -> {
            // If this is the active part, clear the active part first
            CompletableFuture<Void> clearActiveFuture = CompletableFuture.completedFuture(null);
            if (part.isActive()) {
                clearActiveFuture = firebaseService.removeValue("system/activePart");
            }

            return clearActiveFuture.thenCompose(v -> 
                firebaseService.removeValue("parts/" + id)
                    .thenCompose(vv -> {
                        // Clear cache
                        cacheService.remove("parts:all");
                        cacheService.remove("parts:active");
                        // Force refresh cache and get all parts
                        return firebaseService.getValue("parts").thenApply(snapshot -> {
                            List<Part> parts = new ArrayList<>();
                            if (snapshot.exists()) {
                                for (DataSnapshot child : snapshot.getChildren()) {
                                    Part childPart  = child.getValue(Part.class);
                                    if (childPart  != null) {
                                        parts.add(part);
                                    }
                                }
                            }
                            // Cache the result
                            cacheService.put("parts:all", parts);
                            eventPublisher.publishPartEvent(WebSocketEventType.PART_DELETED, parts);
                            return vv;
                        });
                    })
            );
        });
    }

    public CompletableFuture<Part> activatePart(String id) {
        return getPartById(id).thenCompose(part -> {
            // First deactivate all parts
            return getAllParts().thenCompose(allParts -> {
                List<CompletableFuture<Void>> deactivateFutures = new ArrayList<>();
                
                for (Part p : allParts) {
                    if (p.isActive()) {
                        p.setActive(false);
                        deactivateFutures.add(
                            firebaseService.setValue("parts/" + p.getId(), p)
                        );
                    }
                }

                return CompletableFuture.allOf(deactivateFutures.toArray(new CompletableFuture[0]))
                    .thenCompose(v -> {
                        // Now activate the target part
                        part.setActive(true);
                        
                        CompletableFuture<Void> savePartFuture = firebaseService.setValue("parts/" + id, part);
                        CompletableFuture<Void> setActivePartFuture = firebaseService.setValue("system/activePart", id);
                        
                        return CompletableFuture.allOf(savePartFuture, setActivePartFuture)
                            .thenCompose(vv -> {
                                // Clear cache
                                cacheService.remove("parts:all");
                                cacheService.remove("parts:active");
                                // Get all parts and publish
                                return getAllParts().thenApply(updatedParts -> {
                                    System.out.println("🔥 PART ACTIVATED - Publishing " + updatedParts.size() + " parts via WebSocket");
                                    eventPublisher.publishPartEvent(WebSocketEventType.PART_ACTIVATED, updatedParts);
                                    return part;
                                });
                            });
                    });
            });
        });
    }

    public CompletableFuture<Part> getActivePart() {
        // Try cache first
        Part cachedActivePart = cacheService.get("parts:active", Part.class);
        if (cachedActivePart != null) {
            return CompletableFuture.completedFuture(cachedActivePart);
        }

        return getAllParts().thenApply(parts -> {
            Part activePart = parts.stream()
                .filter(Part::isActive)
                .findFirst()
                .orElse(null);
            
            // Cache the result
            if (activePart != null) {
                cacheService.put("parts:active", activePart);
            }
            
            return activePart;
        });
    }

    public CompletableFuture<Part> toggleTodo(String partId, String todoId) {
        return getPartById(partId).thenCompose(part -> {
            // Find and toggle the todo
            Todo todo = part.getTodoList().stream()
                .filter(t -> t.getId().equals(todoId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy todo"));

            todo.setCompleted(!todo.isCompleted());

            return firebaseService.setValue("parts/" + partId, part)
                .thenCompose(v -> {
                    // Clear cache
                    cacheService.remove("parts:all");
                    if (part.isActive()) {
                        cacheService.remove("parts:active");
                    }
                    // Get all parts and publish
                    return getAllParts().thenApply(allParts -> {
                        eventPublisher.publishPartEvent(WebSocketEventType.TODO_TOGGLED, allParts);
                        return part;
                    });
                });
        });
    }
}
