package com.steptogether.app.controller;

import com.steptogether.app.dto.request.PartCreateRequest;
import com.steptogether.app.dto.request.PartUpdateRequest;
import com.steptogether.app.dto.response.ApiResponse;
import com.steptogether.app.model.Part;
import com.steptogether.app.service.PartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/parts")
public class PartController {

    @Autowired
    private PartService partService;

    @GetMapping
    public CompletableFuture<ApiResponse<List<Part>>> getAllParts() {
        return partService.getAllParts()
            .thenApply(ApiResponse::success);
    }


    @GetMapping("/active")
    public CompletableFuture<ApiResponse<Part>> getActivePart() {
        return partService.getActivePart()
            .thenApply(ApiResponse::success);
    }

    @PostMapping
    public CompletableFuture<ApiResponse<Part>> createPart(@Valid @RequestBody PartCreateRequest request) {
        return partService.createPart(request)
            .thenApply(ApiResponse::success);
    }

    @PutMapping("/{id}")
    public CompletableFuture<ApiResponse<Part>> updatePart(@PathVariable String id,
                                                          @Valid @RequestBody PartUpdateRequest request) {
        return partService.updatePart(id, request)
            .thenApply(ApiResponse::success);
    }

    @PostMapping("/{id}/activate")
    public CompletableFuture<ApiResponse<Part>> activatePart(@PathVariable String id) {
        return partService.activatePart(id)
            .thenApply(ApiResponse::success);
    }

    @PostMapping("/{partId}/todos/{todoId}/toggle")
    public CompletableFuture<ApiResponse<Part>> toggleTodo(@PathVariable String partId, 
                                                          @PathVariable String todoId) {
        return partService.toggleTodo(partId, todoId)
            .thenApply(ApiResponse::success);
    }

    @DeleteMapping("/{id}")
    public CompletableFuture<ApiResponse<String>> deletePart(@PathVariable String id) {
        return partService.deletePart(id)
            .thenApply(v -> ApiResponse.success("Part đã được xóa"));
    }
}
