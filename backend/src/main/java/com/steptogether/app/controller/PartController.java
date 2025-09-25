package com.steptogether.app.controller;

import com.steptogether.app.dto.request.PartCreateRequest;
import com.steptogether.app.dto.request.PartUpdateRequest;
import com.steptogether.app.dto.response.ApiResponse;
import com.steptogether.app.model.Part;
import com.steptogether.app.model.Todo;
import com.steptogether.app.service.PartService;
import com.steptogether.app.websocket.UpdateEventPublisher;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/parts")
public class PartController {

    private final PartService partService;
    private final UpdateEventPublisher publisher;

    public PartController(PartService partService, UpdateEventPublisher publisher) {
        this.partService = partService;
        this.publisher = publisher;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Part>>> getAllParts()
            throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(ApiResponse.success(partService.getAllParts()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Part>> createPart(@Valid @RequestBody PartCreateRequest request)
            throws ExecutionException, InterruptedException {
        List<Todo> todos = request.getTodoList() != null
                ? request.getTodoList().stream()
                    .map(t -> Todo.newTodo(t.getTitle(), t.getDescription()))
                    .collect(Collectors.toList())
                : List.of();
        Part part = partService.createPart(request.getName(), request.getDescription(), todos);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(part));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Part>> updatePart(@PathVariable String id,
                                                        @Valid @RequestBody PartUpdateRequest request)
            throws ExecutionException, InterruptedException {
        Part part = partService.findById(id);
        if (part == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Không tìm thấy part"));
        }
        if (request.getName() != null) part.setName(request.getName());
        if (request.getDescription() != null) part.setDescription(request.getDescription());
        if (request.getTodoList() != null) {
            part.setTodoList(request.getTodoList().stream()
                    .map(t -> t.getId() == null
                            ? Todo.newTodo(t.getTitle(), t.getDescription())
                            : Todo.builder()
                                .id(t.getId())
                                .title(t.getTitle())
                                .description(t.getDescription())
                                .completed(false)
                                .build())
                    .collect(Collectors.toList()));
        }
        Part updated = partService.updatePart(part);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePart(@PathVariable String id)
            throws ExecutionException, InterruptedException {
        partService.deletePart(id);
        return ResponseEntity.ok(ApiResponse.success("Part đã được xóa"));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Part>> activatePart(@PathVariable String id)
            throws ExecutionException, InterruptedException {
        Part active = partService.activatePart(id);
        publisher.publish("PART_ACTIVATED", active);
        return ResponseEntity.ok(ApiResponse.success(active));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<Part>> getActivePart()
            throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(ApiResponse.success(partService.getActivePart()));
    }
}
