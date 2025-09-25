package com.steptogether.app.controller;

import com.steptogether.app.dto.response.ApiResponse;
import com.steptogether.app.model.Leader;
import com.steptogether.app.service.SystemService;
import com.steptogether.app.websocket.UpdateEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api")
public class SystemController {

    private final SystemService systemService;
    private final UpdateEventPublisher publisher;

    public SystemController(SystemService systemService, UpdateEventPublisher publisher) {
        this.systemService = systemService;
        this.publisher = publisher;
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<List<Leader>>> resetSystem()
            throws ExecutionException, InterruptedException {
        List<Leader> leaders = systemService.resetAllLeaders();
        publisher.publish("SYSTEM_RESET", leaders);
        return ResponseEntity.ok(ApiResponse.success(leaders));
    }
}
