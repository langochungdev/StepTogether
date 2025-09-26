package com.steptogether.app.service;

import com.google.cloud.Timestamp;
import com.steptogether.app.exception.ResourceNotFoundException;
import com.steptogether.app.model.Leader;
import com.steptogether.app.model.LeaderTodo;
import com.steptogether.app.model.Todo;
import com.steptogether.app.repository.LeaderRepository;
import com.steptogether.app.repository.LeaderTodoRepository;
import com.steptogether.app.repository.TodoRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ExecutionException;

@Service
public class TodoService {

    private final LeaderRepository leaderRepository;
    private final TodoRepository todoRepository;
    private final LeaderTodoRepository leaderTodoRepository;

    public TodoService(LeaderRepository leaderRepository,
                       TodoRepository todoRepository,
                       LeaderTodoRepository leaderTodoRepository) {
        this.leaderRepository = leaderRepository;
        this.todoRepository = todoRepository;
        this.leaderTodoRepository = leaderTodoRepository;
    }

    public LeaderTodo toggleTodo(String leaderId, String todoId) throws ExecutionException, InterruptedException {
        Leader leader = leaderRepository.findById(leaderId);
        if (leader == null) throw new ResourceNotFoundException("Không tìm thấy leader");

        Todo todo = todoRepository.findById(todoId);
        if (todo == null) throw new ResourceNotFoundException("Không tìm thấy todo");

        LeaderTodo leaderTodo = leaderTodoRepository.find(leaderId, todoId);
        if (leaderTodo == null) {
            leaderTodo = LeaderTodo.builder()
                    .leaderId(leaderId)
                    .todoId(todoId)
                    .completed(true)
                    .completedAt(Timestamp.now())
                    .build();
        } else {
            leaderTodo.setCompleted(!leaderTodo.isCompleted());
            leaderTodo.setCompletedAt(leaderTodo.isCompleted() ? Timestamp.now() : null);
        }

        leaderTodoRepository.save(leaderTodo);

        // ✅ Update progress
        int completed = leaderTodoRepository.countCompletedByLeader(leaderId);
        int total = leader.getTodoProgress().getTotal();

        leader.getTodoProgress().setCompleted(completed);
        leader.getTodoProgress().setTotal(total);

        leaderRepository.save(leader);
        return leaderTodo;
    }
}
