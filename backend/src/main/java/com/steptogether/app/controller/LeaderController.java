package com.steptogether.app.controller;

import com.steptogether.app.dto.request.LeaderRegisterRequest;
import com.steptogether.app.dto.response.ApiResponse;
import com.steptogether.app.dto.response.TodoToggleResponse;
import com.steptogether.app.model.Leader;
import com.steptogether.app.service.LeaderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/leaders")
public class LeaderController {

    @Autowired
    private LeaderService leaderService;

    @PostMapping("/register")
    public CompletableFuture<ApiResponse<Leader>> registerLeader(@Valid @RequestBody LeaderRegisterRequest request) {
        return leaderService.registerLeader(request.getName())
            .thenApply(ApiResponse::success);
    }

    @GetMapping
    public CompletableFuture<ApiResponse<List<Leader>>> getAllLeaders() {
        return leaderService.getAllLeaders()
            .thenApply(ApiResponse::success);
    }


    @PostMapping("/{id}/complete")
    public CompletableFuture<ApiResponse<Leader>> completeLeader(@PathVariable String id) {
        return leaderService.completeLeader(id)
            .thenApply(ApiResponse::success);
    }

    @PostMapping("/{id}/help")
    public CompletableFuture<ApiResponse<Leader>> toggleHelp(@PathVariable String id, 
                                                            @RequestParam boolean needsHelp) {
        return leaderService.toggleHelp(id, needsHelp)
            .thenApply(ApiResponse::success);
    }

    @PostMapping("/{leaderId}/todos/{todoId}/toggle")
    public CompletableFuture<ApiResponse<TodoToggleResponse>> toggleTodo(@PathVariable String leaderId, 
                                                                        @PathVariable String todoId) {
        return leaderService.toggleTodo(leaderId, todoId)
            .thenApply(ApiResponse::success);
    }

    @DeleteMapping("/{id}")
    public CompletableFuture<ApiResponse<String>> deleteLeader(@PathVariable String id) {
        return leaderService.deleteLeader(id)
            .thenApply(v -> ApiResponse.success("Leader đã được xóa"));
    }
}
