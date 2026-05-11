package com.example.flotera.incident;

import com.example.flotera.incident.dto.IncidentResponse;
import com.example.flotera.vehicle.Vehicle;
import com.example.flotera.vehicle.VehicleRepository;
import com.example.flotera.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final VehicleRepository vehicleRepository;
    private final StorageService storageService;

    public IncidentService(IncidentRepository incidentRepository, VehicleRepository vehicleRepository, StorageService storageService) {
        this.incidentRepository = incidentRepository;
        this.vehicleRepository = vehicleRepository;
        this.storageService = storageService;
    }

    @Transactional
    public IncidentResponse reportIncident(Long vehicleId, String description, MultipartFile file, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul nu a fost găsit."));

        // Verificăm permisiunile
        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveți permisiunea de a raporta un incident pentru acest vehicul.");
        }

        Incident incident = new Incident(vehicle, description);
        
        if (file != null && !file.isEmpty()) {
            String imageUrl = storageService.store(file, "incidents");
            incident.setImageUrl(imageUrl);
        }

        Incident saved = incidentRepository.save(incident);

        return mapToResponse(saved);
    }

    public List<IncidentResponse> getIncidentsByVehicle(Long vehicleId, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul nu a fost găsit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveți permisiunea de a vedea incidentele acestui vehicul.");
        }

        return incidentRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public IncidentResponse resolveIncident(Long incidentId, String requesterId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incidentul nu a fost găsit."));

        if (!incident.getVehicle().getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveți permisiunea de a modifica acest incident.");
        }

        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolvedAt(LocalDateTime.now());
        
        return mapToResponse(incidentRepository.save(incident));
    }

    private IncidentResponse mapToResponse(Incident incident) {
        return new IncidentResponse(
                incident.getId(),
                incident.getVehicle().getId(),
                incident.getDescription(),
                incident.getImageUrl(),
                incident.getStatus(),
                incident.getCreatedAt(),
                incident.getResolvedAt()
        );
    }
}
