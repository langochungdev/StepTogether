package com.steptogether.app.service;

import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.steptogether.app.exception.ResourceNotFoundException;
import com.steptogether.app.model.Part;
import com.steptogether.app.model.Todo;
import com.steptogether.app.repository.PartRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class PartService {

    private final PartRepository partRepository;

    public PartService(PartRepository partRepository) {
        this.partRepository = partRepository;
    }

    public Part findById(String id) throws ExecutionException, InterruptedException {
        return partRepository.findById(id);
    }

    public Part createPart(String name, String description, List<Todo> todos) throws ExecutionException, InterruptedException {
        Part part = Part.newPart(name, description, todos);
        partRepository.save(part);
        return part;
    }

    public List<Part> getAllParts() throws ExecutionException, InterruptedException {
        return partRepository.findAll().stream()
                .map(doc -> doc.toObject(Part.class))
                .collect(Collectors.toList());
    }

    public Part updatePart(Part part) throws ExecutionException, InterruptedException {
        if (partRepository.findById(part.getId()) == null) {
            throw new ResourceNotFoundException("Không tìm thấy part");
        }
        partRepository.save(part);
        return part;
    }

    public void deletePart(String id) throws ExecutionException, InterruptedException {
        partRepository.delete(id);
    }

    public Part activatePart(String id) throws ExecutionException, InterruptedException {
        partRepository.deactivateAll();
        Part part = partRepository.findById(id);
        if (part == null) throw new ResourceNotFoundException("Không tìm thấy part");
        part.setActive(true);
        partRepository.save(part);
        return part;
    }

    public Part getActivePart() throws ExecutionException, InterruptedException {
        return getAllParts().stream()
                .filter(Part::isActive)
                .findFirst()
                .orElse(null);
    }
}
