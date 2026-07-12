 package com.example.flotera.incident;

import com.example.flotera.incident.dto.IncidentResponse;
import com.example.flotera.vehicle.ServiceRecord;
import com.example.flotera.vehicle.ServiceRecordRepository;
import com.example.flotera.vehicle.ServiceType;
import com.example.flotera.vehicle.Vehicle;
import com.example.flotera.vehicle.VehicleRepository;
import com.example.flotera.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.flotera.notification.EmailService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final VehicleRepository vehicleRepository;
    private final StorageService storageService;
    private final ServiceRecordRepository serviceRecordRepository;
    private final EmailService emailService;

    public IncidentService(IncidentRepository incidentRepository, 
                           VehicleRepository vehicleRepository, 
                           StorageService storageService,
                           ServiceRecordRepository serviceRecordRepository,
                           EmailService emailService) {
        this.incidentRepository = incidentRepository;
        this.vehicleRepository = vehicleRepository;
        this.storageService = storageService;
        this.serviceRecordRepository = serviceRecordRepository;
        this.emailService = emailService;
    }

    @Transactional
    public IncidentResponse reportIncident(Long vehicleId, String description, MultipartFile file, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul nu a fost gasit."));

        // Verificam permisiunile
        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveti permisiunea de a raporta un incident pentru acest vehicul.");
        }

        Incident incident = new Incident(vehicle, description);
        
        if (file != null && !file.isEmpty()) {
            String imageUrl = storageService.store(file, "incidents");
            incident.setImageUrl(imageUrl);
        }

        Incident saved = incidentRepository.save(incident);

        emailService.sendEmail("alexandrunegoita1608@yahoo.com", "Incident Nou Raportat - " + vehicle.getLicensePlate(),
        "Salut, " + vehicle.getOwner().getName() + "!\n\n" + "A fost raportat un incident nou pentru vehiculul " + vehicle.getBrand()
        + " " + vehicle.getModel() + " (" + vehicle.getLicensePlate() + ").\n" + "Descriere incident: " + description
    );
    
        return mapToResponse(saved);
    }

    public List<IncidentResponse> getIncidentsByVehicle(Long vehicleId, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul nu a fost gasit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveti permisiunea de a vedea incidentele acestui vehicul.");
        }

        return incidentRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public IncidentResponse resolveIncident(Long incidentId, String requesterId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incidentul nu a fost gasit."));

        if (!incident.getVehicle().getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveti permisiunea de a modifica acest incident.");
        }

        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolvedAt(LocalDateTime.now());
        Incident saved = incidentRepository.save(incident);

        // Sincronizare cu Istoric Service
        ServiceRecord record = new ServiceRecord(
                incident.getVehicle(),
                saved.getResolvedAt().toLocalDate(),
                incident.getVehicle().getOdometer(), // Folosim odometrul curent al masinii
                "REPARATIE INCIDENT: " + incident.getDescription(),
                0.0, // Costul va fi editat ulterior in service history daca e cazul
                ServiceType.REPAIR
        );
        serviceRecordRepository.save(record);
        
        return mapToResponse(saved);
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
