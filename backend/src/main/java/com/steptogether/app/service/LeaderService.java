package com.steptogether.app.service;

import com.google.cloud.Timestamp;
import com.steptogether.app.exception.ConflictException;
import com.steptogether.app.exception.ResourceNotFoundException;
import com.steptogether.app.model.Leader;
import com.steptogether.app.repository.LeaderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class LeaderService {

    private final LeaderRepository leaderRepository;

    public LeaderService(LeaderRepository leaderRepository) {
        this.leaderRepository = leaderRepository;
    }

    public Leader registerLeader(String name) throws ExecutionException, InterruptedException {
        // Check duplicate
        List<Leader> leaders = getAllLeaders();
        if (leaders.stream().anyMatch(l -> l.getName().equalsIgnoreCase(name))) {
            throw new ConflictException("Tên leader đã tồn tại");
        }
        Leader leader = Leader.newLeader(name);
        leaderRepository.save(leader);
        return leader;
    }

    public List<Leader> getAllLeaders() throws ExecutionException, InterruptedException {
        return leaderRepository.findAll().stream()
                .map(doc -> doc.toObject(Leader.class))
                .collect(Collectors.toList());
    }

    public Leader completeLeader(String id) throws ExecutionException, InterruptedException {
        Leader leader = leaderRepository.findById(id);
        if (leader == null) throw new ResourceNotFoundException("Không tìm thấy leader");

        leader.setStatus("DONE");
        leader.setNeedsHelp(false);
        leader.setCompletedAt(Timestamp.now());   // ✅ dùng Timestamp

        leaderRepository.save(leader);
        return leader;
    }

    public Leader requestHelp(String id) throws ExecutionException, InterruptedException {
        Leader leader = leaderRepository.findById(id);
        if (leader == null) throw new ResourceNotFoundException("Không tìm thấy leader");

        leader.setNeedsHelp(true);
        leader.setHelpRequestedAt(Timestamp.now());   // ✅ dùng Timestamp

        leaderRepository.save(leader);
        return leader;
    }

    public void deleteLeader(String id) throws ExecutionException, InterruptedException {
        leaderRepository.delete(id);
    }
}
