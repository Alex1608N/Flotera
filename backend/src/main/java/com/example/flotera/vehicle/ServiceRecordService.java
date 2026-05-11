package com.example.flotera.vehicle;

import com.example.flotera.vehicle.dto.ServiceRecordRequest;
import com.example.flotera.vehicle.dto.ServiceRecordResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceRecordService {

    private final ServiceRecordRepository serviceRecordRepository;
    private final VehicleRepository vehicleRepository;

    public ServiceRecordService(ServiceRecordRepository serviceRecordRepository, VehicleRepository vehicleRepository) {
        this.serviceRecordRepository = serviceRecordRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public ServiceRecordResponse addRecord(Long vehicleId, ServiceRecordRequest request, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul nu a fost găsit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveți permisiunea de a adăuga înregistrări pentru acest vehicul.");
        }

        ServiceRecord record = new ServiceRecord(
                vehicle,
                request.date(),
                request.odometer(),
                request.description(),
                request.cost(),
                request.type()
        );

        // Logica de sincronizare: Dacă e revizie, actualizăm și datele mașinii
        // Aceasta asigură că ExpirationEngineService va calcula corect noile praguri
        if (request.type() == ServiceType.ROUTINE_MAINTENANCE) {
            // Doar dacă e mai nouă decât cea existentă (pentru a nu strica datele dacă adăugăm istoric vechi)
            if (vehicle.getLastMaintenanceDate() == null || request.date().isAfter(vehicle.getLastMaintenanceDate())) {
                vehicle.setLastMaintenanceDate(request.date());
            }
            if (vehicle.getLastMaintenanceKm() == null || request.odometer() > vehicle.getLastMaintenanceKm()) {
                vehicle.setLastMaintenanceKm(request.odometer());
            }
            
            // Opțional: Actualizăm și odometrul total dacă înregistrarea e cea mai recentă
            if (request.odometer() > vehicle.getOdometer()) {
                vehicle.setOdometer(request.odometer());
            }
            
            vehicleRepository.save(vehicle);
        }

        ServiceRecord saved = serviceRecordRepository.save(record);
        return mapToResponse(saved);
    }

    public List<ServiceRecordResponse> getHistory(Long vehicleId, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul nu a fost găsit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveți permisiunea de a vedea istoricul acestui vehicul.");
        }

        return serviceRecordRepository.findByVehicleIdOrderByDateDesc(vehicleId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ServiceRecordResponse mapToResponse(ServiceRecord record) {
        return new ServiceRecordResponse(
                record.getId(),
                record.getVehicle().getId(),
                record.getDate(),
                record.getOdometer(),
                record.getDescription(),
                record.getCost(),
                record.getType()
        );
    }
}
