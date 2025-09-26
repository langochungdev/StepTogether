package com.steptogether.app.repository;

import com.google.cloud.firestore.*;
import com.steptogether.app.model.LeaderTodo;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class LeaderTodoRepository {

    private final Firestore firestore;

    public LeaderTodoRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    private CollectionReference collection() {
        return firestore.collection("leader_todos");
    }

    public void save(LeaderTodo leaderTodo) throws ExecutionException, InterruptedException {
        String docId = leaderTodo.getLeaderId() + "_" + leaderTodo.getTodoId();
        collection().document(docId).set(leaderTodo).get();
    }

    public LeaderTodo find(String leaderId, String todoId) throws ExecutionException, InterruptedException {
        String docId = leaderId + "_" + todoId;
        DocumentSnapshot snapshot = collection().document(docId).get().get();
        return snapshot.exists() ? snapshot.toObject(LeaderTodo.class) : null;
    }

    public void delete(String leaderId, String todoId) throws ExecutionException, InterruptedException {
        String docId = leaderId + "_" + todoId;
        collection().document(docId).delete().get();
    }

    /** 🔥 thêm method này */
    public int countCompletedByLeader(String leaderId) throws ExecutionException, InterruptedException {
        List<QueryDocumentSnapshot> docs = collection()
                .whereEqualTo("leaderId", leaderId)
                .whereEqualTo("completed", true)
                .get()
                .get()
                .getDocuments();
        return docs.size();
    }
}
