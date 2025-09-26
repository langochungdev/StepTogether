package com.steptogether.app.service;

import com.steptogether.app.model.Leader;
import com.steptogether.app.repository.LeaderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class SystemService {

    private final LeaderRepository leaderRepository;

    public SystemService(LeaderRepository leaderRepository) {
        this.leaderRepository = leaderRepository;
    }

    public List<Leader> resetAllLeaders() throws ExecutionException, InterruptedException {
        List<Leader> leaders = leaderRepository.findAll().stream()
                .map(doc -> doc.toObject(Leader.class))
                .collect(Collectors.toList());

        for (Leader leader : leaders) {
            leader.setStatus("PENDING");
            leader.setNeedsHelp(false);
            leader.setCompletedAt(null);
            leader.setHelpRequestedAt(null);
            leaderRepository.save(leader);
        }

        return leaders;
    }
}
