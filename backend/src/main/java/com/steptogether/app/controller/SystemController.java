package com.steptogether.app.controller;

import com.steptogether.app.dto.response.ApiResponse;
import com.steptogether.app.dto.response.SystemStats;
import com.steptogether.app.service.SystemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    @Autowired
    private SystemService systemService;

    @PostMapping("/reset")
    public CompletableFuture<ApiResponse<String>> resetSystem() {
        return systemService.resetSystem()
            .thenApply(v -> ApiResponse.success("Hệ thống đã được reset"));
    }

    @GetMapping("/stats")
    public CompletableFuture<ApiResponse<SystemStats>> getSystemStats() {
        return systemService.getSystemStats()
            .thenApply(ApiResponse::success);
    }
}
