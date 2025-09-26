package com.steptogether.app;

import com.steptogether.app.model.Leader;
import com.steptogether.app.service.LeaderService;
import com.steptogether.app.service.FirebaseService;
import com.steptogether.app.service.PartService;
import com.steptogether.app.service.CacheService;
import com.steptogether.app.websocket.WebSocketEventPublisher;
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

class LeaderServiceTest {

    @Mock
    private FirebaseService firebaseService;

    @Mock
    private PartService partService;

    @Mock
    private CacheService cacheService;

    @Mock
    private WebSocketEventPublisher eventPublisher;

    @InjectMocks
    private LeaderService leaderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterLeader() {
        // Given
        String name = "Test Leader";
        List<Leader> existingLeaders = new ArrayList<>();
        
        when(firebaseService.getValue(anyString())).thenReturn(CompletableFuture.completedFuture(null));
        when(partService.getActivePart()).thenReturn(CompletableFuture.completedFuture(null));
        when(firebaseService.setValue(anyString(), any(Leader.class)))
            .thenReturn(CompletableFuture.completedFuture(null));

        // When
        CompletableFuture<Leader> result = leaderService.registerLeader(name);

        // Then
        assertNotNull(result);
        verify(firebaseService).setValue(anyString(), any(Leader.class));
    }

    @Test
    void testGetAllLeaders() {
        // Given
        when(cacheService.get(anyString(), any())).thenReturn(null);
        when(firebaseService.getValue(anyString())).thenReturn(CompletableFuture.completedFuture(null));

        // When
        CompletableFuture<List<Leader>> result = leaderService.getAllLeaders();

        // Then
        assertNotNull(result);
        verify(firebaseService).getValue("leaders");
    }

    @Test
    void testCompleteLeader() {
        // Given
        String leaderId = "test-id";
        Leader leader = Leader.newLeader("Test Leader");
        
        when(firebaseService.getValue(anyString())).thenReturn(CompletableFuture.completedFuture(null));
        when(firebaseService.setValue(anyString(), any(Leader.class)))
            .thenReturn(CompletableFuture.completedFuture(null));

        // When
        CompletableFuture<Leader> result = leaderService.completeLeader(leaderId);

        // Then
        assertNotNull(result);
    }
}
