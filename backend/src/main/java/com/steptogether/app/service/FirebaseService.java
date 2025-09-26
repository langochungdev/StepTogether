package com.steptogether.app.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.database.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class FirebaseService {

    private final DatabaseReference database;

    @Autowired
    public FirebaseService(FirebaseApp firebaseApp) {
        this.database = FirebaseDatabase.getInstance(firebaseApp).getReference();
    }

    // Generic methods for Firebase operations
    public CompletableFuture<Void> setValue(String path, Object value) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        
        database.child(path).setValue(value, (error, ref) -> {
            if (error != null) {
                future.completeExceptionally(new RuntimeException("Firebase write error: " + error.getMessage()));
            } else {
                future.complete(null);
            }
        });
        
        return future;
    }

    public CompletableFuture<DataSnapshot> getValue(String path) {
        CompletableFuture<DataSnapshot> future = new CompletableFuture<>();
        
        database.child(path).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                future.complete(dataSnapshot);
            }

            @Override
            public void onCancelled(com.google.firebase.database.DatabaseError error) {
                future.completeExceptionally(new RuntimeException("Firebase read error: " + error.getMessage()));
            }
        });
        
        return future;
    }

    public CompletableFuture<Void> removeValue(String path) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        
        database.child(path).removeValue((error, ref) -> {
            if (error != null) {
                future.completeExceptionally(new RuntimeException("Firebase remove error: " + error.getMessage()));
            } else {
                future.complete(null);
            }
        });
        
        return future;
    }

    public CompletableFuture<Void> updateChildren(String path, java.util.Map<String, Object> updates) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        
        database.child(path).updateChildren(updates, (error, ref) -> {
            if (error != null) {
                future.completeExceptionally(new RuntimeException("Firebase update error: " + error.getMessage()));
            } else {
                future.complete(null);
            }
        });
        
        return future;
    }

    // Listen for real-time changes
    public void addValueEventListener(String path, ValueEventListener listener) {
        database.child(path).addValueEventListener(listener);
    }

    public void removeEventListener(String path, ValueEventListener listener) {
        database.child(path).removeEventListener(listener);
    }

    // Get database reference for specific operations
    public DatabaseReference getReference(String path) {
        return database.child(path);
    }
}