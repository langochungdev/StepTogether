package com.steptogether.app.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class CacheService {
    private final ConcurrentMap<String, Object> cache = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Long> cacheTimestamps = new ConcurrentHashMap<>();
    private final long CACHE_DURATION = 30000; // 30 seconds

    public void put(String key, Object value) {
        cache.put(key, value);
        cacheTimestamps.put(key, System.currentTimeMillis());
    }

    public <T> T get(String key, Class<T> type) {
        if (isExpired(key)) {
            remove(key);
            return null;
        }
        Object value = cache.get(key);
        return type.isInstance(value) ? type.cast(value) : null;
    }

    public void remove(String key) {
        cache.remove(key);
        cacheTimestamps.remove(key);
    }

    public void clear() {
        cache.clear();
        cacheTimestamps.clear();
    }

    private boolean isExpired(String key) {
        Long timestamp = cacheTimestamps.get(key);
        if (timestamp == null) {
            return true;
        }
        return System.currentTimeMillis() - timestamp > CACHE_DURATION;
    }

    public boolean containsKey(String key) {
        return cache.containsKey(key) && !isExpired(key);
    }

    public int size() {
        // Clean expired entries first
        cacheTimestamps.entrySet().removeIf(entry -> 
            System.currentTimeMillis() - entry.getValue() > CACHE_DURATION);
        
        // Remove corresponding cache entries
        cache.keySet().retainAll(cacheTimestamps.keySet());
        
        return cache.size();
    }
}