package com.steptogether.app;

import com.steptogether.app.model.Leader;
import com.steptogether.app.model.Part;
import com.steptogether.app.dto.response.SystemStats;
import com.steptogether.app.service.SystemService;
import com.steptogether.app.service.FirebaseService;
import com.steptogether.app.service.LeaderService;
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

class SystemServiceTest {

    @Mock
    private FirebaseService firebaseService;

    @Mock
    private LeaderService leaderService;

    @Mock
    private PartService partService;

    @Mock
    private CacheService cacheService;

    @Mock
    private WebSocketEventPublisher eventPublisher;

    @InjectMocks
    private SystemService systemService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testResetSystem() {
        // Given
        when(firebaseService.removeValue(anyString()))
            .thenReturn(CompletableFuture.completedFuture(null));

        // When
        CompletableFuture<Void> result = systemService.resetSystem();

        // Then
        assertNotNull(result);
        verify(firebaseService, times(3)).removeValue(anyString());
    }

    @Test
    void testGetSystemStats() {
        // Given
        List<Leader> leaders = new ArrayList<>();
        Leader leader1 = Leader.newLeader("Leader 1");
        leader1.setCompleted(true);
        leaders.add(leader1);
        
        Leader leader2 = Leader.newLeader("Leader 2");
        leader2.setCompleted(false);
        leaders.add(leader2);
        
        List<Part> parts = new ArrayList<>();
        Part part = Part.newPart("Test Part", "Description", new ArrayList<>());
        parts.add(part);

        when(cacheService.get(anyString(), any())).thenReturn(null);
        when(leaderService.getAllLeaders()).thenReturn(CompletableFuture.completedFuture(leaders));
        when(partService.getAllParts()).thenReturn(CompletableFuture.completedFuture(parts));
        when(partService.getActivePart()).thenReturn(CompletableFuture.completedFuture(null));

        // When
        CompletableFuture<SystemStats> result = systemService.getSystemStats();

        // Then
        assertNotNull(result);
        SystemStats stats = result.join();
        assertEquals(2, stats.getTotalLeaders());
        assertEquals(1, stats.getCompletedLeaders());
    }
}
