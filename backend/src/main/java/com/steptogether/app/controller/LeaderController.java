package com.steptogether.app.controller;

import com.steptogether.app.dto.request.LeaderRegisterRequest;
import com.steptogether.app.dto.response.ApiResponse;
import com.steptogether.app.model.Leader;
import com.steptogether.app.service.LeaderService;
import com.steptogether.app.websocket.UpdateEventPublisher;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/leaders")
public class LeaderController {

    private final LeaderService leaderService;
    private final UpdateEventPublisher publisher;

    public LeaderController(LeaderService leaderService, UpdateEventPublisher publisher) {
        this.leaderService = leaderService;
        this.publisher = publisher;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Leader>> registerLeader(@Valid @RequestBody LeaderRegisterRequest request)
            throws ExecutionException, InterruptedException {
        Leader leader = leaderService.registerLeader(request.getName());
        publisher.publish("LEADER_REGISTERED", leader);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(leader));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Leader>>> getAllLeaders()
            throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(ApiResponse.success(leaderService.getAllLeaders()));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Leader>> completeLeader(@PathVariable String id)
            throws ExecutionException, InterruptedException {
        Leader leader = leaderService.completeLeader(id);
        publisher.publish("LEADER_COMPLETED", leader);
        return ResponseEntity.ok(ApiResponse.success(leader));
    }

    @PostMapping("/{id}/help")
    public ResponseEntity<ApiResponse<Leader>> requestHelp(@PathVariable String id)
            throws ExecutionException, InterruptedException {
        Leader leader = leaderService.requestHelp(id);
        publisher.publish("LEADER_NEEDS_HELP", leader);
        return ResponseEntity.ok(ApiResponse.success(leader));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteLeader(@PathVariable String id)
            throws ExecutionException, InterruptedException {
        leaderService.deleteLeader(id);
        publisher.publish("LEADER_DELETED", Map.of("id", id));
        return ResponseEntity.ok(ApiResponse.success("Leader đã được xóa"));
    }
}
