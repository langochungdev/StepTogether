package com.steptogether.app.websocket;

public enum WebSocketEventType {
    // Leader Events
    LEADER_REGISTERED,
    LEADER_COMPLETED,
    LEADER_NEEDS_HELP,
    LEADER_DELETED,
    
    // Part Events
    PART_ACTIVATED,
    PART_CREATED,
    PART_UPDATED,
    PART_DELETED,
    
    // Todo Events
    TODO_TOGGLED,
    
    // System Events
    SYSTEM_RESET,
    STATS_UPDATED
}