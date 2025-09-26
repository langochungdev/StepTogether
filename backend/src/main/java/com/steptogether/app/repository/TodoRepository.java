package com.steptogether.app.repository;

import com.google.cloud.firestore.*;
import com.steptogether.app.model.Todo;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class TodoRepository {

    private final Firestore firestore;

    public TodoRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    private CollectionReference collection() {
        return firestore.collection("todos");
    }

    public void save(Todo todo) throws ExecutionException, InterruptedException {
        collection().document(todo.getId()).set(todo).get();
    }

    public Todo findById(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = collection().document(id).get().get();
        return snapshot.exists() ? snapshot.toObject(Todo.class) : null;
    }

    public List<QueryDocumentSnapshot> findAll() throws ExecutionException, InterruptedException {
        return collection().get().get().getDocuments();
    }

    public void delete(String id) throws ExecutionException, InterruptedException {
        collection().document(id).delete().get();
    }
}
