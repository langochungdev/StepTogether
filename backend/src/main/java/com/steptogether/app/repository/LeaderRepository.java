package com.steptogether.app.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.steptogether.app.model.Leader;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class LeaderRepository {

    private final Firestore firestore;

    public LeaderRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    private CollectionReference collection() {
        return firestore.collection("leaders");
    }

    public void save(Leader leader) throws ExecutionException, InterruptedException {
        collection().document(leader.getId()).set(leader).get();
    }

    public Leader findById(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = collection().document(id).get().get();
        return snapshot.exists() ? snapshot.toObject(Leader.class) : null;
    }

    public List<QueryDocumentSnapshot> findAll() throws ExecutionException, InterruptedException {
        return collection().get().get().getDocuments();
    }

    public void delete(String id) throws ExecutionException, InterruptedException {
        collection().document(id).delete().get();
    }
}
