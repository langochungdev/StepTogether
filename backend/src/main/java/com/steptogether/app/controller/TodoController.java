package com.steptogether.app.controller;

import com.steptogether.app.dto.response.ApiResponse;
import com.steptogether.app.model.LeaderTodo;
import com.steptogether.app.service.TodoService;
import com.steptogether.app.websocket.UpdateEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/leaders/{leaderId}/todos")
public class TodoController {

    private final TodoService todoService;
    private final UpdateEventPublisher publisher;

    public TodoController(TodoService todoService, UpdateEventPublisher publisher) {
        this.todoService = todoService;
        this.publisher = publisher;
    }

    @PostMapping("/{todoId}/toggle")
    public ResponseEntity<ApiResponse<LeaderTodo>> toggleTodo(@PathVariable String leaderId,
                                                              @PathVariable String todoId)
            throws ExecutionException, InterruptedException {
        LeaderTodo leaderTodo = todoService.toggleTodo(leaderId, todoId);
        publisher.publish("TODO_TOGGLED", Map.of(
                "leaderId", leaderId,
                "todoId", todoId,
                "completed", leaderTodo.isCompleted()
        ));
        return ResponseEntity.ok(ApiResponse.success(leaderTodo));
    }
}
