package com.steptogether.app.repository;

import com.google.cloud.firestore.*;
import com.steptogether.app.model.Part;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class PartRepository {

    private final Firestore firestore;

    public PartRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    private CollectionReference collection() {
        return firestore.collection("parts");
    }

    public void save(Part part) throws ExecutionException, InterruptedException {
        collection().document(part.getId()).set(part).get();
    }

    public Part findById(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = collection().document(id).get().get();
        return snapshot.exists() ? snapshot.toObject(Part.class) : null;
    }

    public List<QueryDocumentSnapshot> findAll() throws ExecutionException, InterruptedException {
        return collection().get().get().getDocuments();
    }

    public void delete(String id) throws ExecutionException, InterruptedException {
        collection().document(id).delete().get();
    }

    public void deactivateAll() throws ExecutionException, InterruptedException {
        for (QueryDocumentSnapshot doc : findAll()) {
            collection().document(doc.getId()).update("active", false).get();
        }
    }
}
