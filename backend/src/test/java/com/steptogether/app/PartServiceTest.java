package com.steptogether.app;

import com.steptogether.app.model.Part;
import com.steptogether.app.model.Todo;
import com.steptogether.app.service.PartService;
import com.steptogether.app.service.FirebaseService;
import com.steptogether.app.service.CacheService;
import com.steptogether.app.websocket.WebSocketEventPublisher;
import com.steptogether.app.dto.request.PartCreateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PartServiceTest {

    @Mock
    private FirebaseService firebaseService;

    @Mock
    private CacheService cacheService;

    @Mock
    private WebSocketEventPublisher eventPublisher;

    @InjectMocks
    private PartService partService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreatePart() {
        // Given
        PartCreateRequest request = new PartCreateRequest();
        request.setName("Test Part");
        request.setDescription("Test Description");
        request.setTodoList(new ArrayList<>());
        
        when(firebaseService.setValue(anyString(), any(Part.class)))
            .thenReturn(CompletableFuture.completedFuture(null));

        // When
        CompletableFuture<Part> result = partService.createPart(request);

        // Then
        assertNotNull(result);
        verify(firebaseService).setValue(anyString(), any(Part.class));
    }

    @Test
    void testGetAllParts() {
        // Given
        when(cacheService.get(anyString(), any())).thenReturn(null);
        when(firebaseService.getValue(anyString())).thenReturn(CompletableFuture.completedFuture(null));

        // When
        CompletableFuture<List<Part>> result = partService.getAllParts();

        // Then
        assertNotNull(result);
        verify(firebaseService).getValue("parts");
    }

    @Test
    void testGetActivePart() {
        // Given
        when(cacheService.get(anyString(), any())).thenReturn(null);
        when(firebaseService.getValue(anyString())).thenReturn(CompletableFuture.completedFuture(null));

        // When
        CompletableFuture<Part> result = partService.getActivePart();

        // Then
        assertNotNull(result);
    }
}
