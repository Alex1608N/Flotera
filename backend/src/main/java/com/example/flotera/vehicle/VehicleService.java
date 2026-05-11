package com.example.flotera.vehicle;

import com.example.flotera.storage.StorageService;
import com.example.flotera.user.User;
import com.example.flotera.user.UserRepository;
import com.example.flotera.vehicle.dto.VehicleRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public VehicleService(VehicleRepository vehicleRepository, UserRepository userRepository, StorageService storageService) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    public List<Vehicle> getVehiclesByOwner(String ownerId) {
        return vehicleRepository.findByOwnerId(ownerId);
    }

    @Transactional
    public Vehicle createVehicle(VehicleRequest request, String ownerId) {
        if (vehicleRepository.existsByLicensePlate(request.licensePlate())) {
            throw new IllegalArgumentException("Numărul de înmatriculare " + request.licensePlate() + " există deja.");
        }
        if (vehicleRepository.existsByVin(request.vin())) {
            throw new IllegalArgumentException("Seria de șasiu " + request.vin() + " există deja.");
        }

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul cu ID-ul " + ownerId + " nu există."));

        Vehicle vehicle = new Vehicle(
                request.licensePlate(),
                request.model(),
                request.year(),
                request.vin(),
                owner
        );
        
        vehicle.setItpExpiration(request.itpExpiration());
        vehicle.setRcaExpiration(request.rcaExpiration());
        vehicle.setRovinietaExpiration(request.rovinietaExpiration());

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicle(Long id, VehicleRequest request, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul cu ID-ul " + id + " nu a fost găsit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveți permisiunea de a modifica acest vehicul.");
        }

        // Verificăm dacă noul număr de înmatriculare sau VIN-ul sunt deja folosite de ALTĂ mașină
        vehicleRepository.findByLicensePlate(request.licensePlate())
                .ifPresent(v -> {
                    if (!v.getId().equals(id)) throw new IllegalArgumentException("Numărul de înmatriculare există deja.");
                });
        
        vehicleRepository.findByVin(request.vin())
                .ifPresent(v -> {
                    if (!v.getId().equals(id)) throw new IllegalArgumentException("Seria de șasiu există deja.");
                });

        vehicle.setLicensePlate(request.licensePlate());
        vehicle.setModel(request.model());
        vehicle.setYear(request.year());
        vehicle.setVin(request.vin());
        
        vehicle.setItpExpiration(request.itpExpiration());
        vehicle.setRcaExpiration(request.rcaExpiration());
        vehicle.setRovinietaExpiration(request.rovinietaExpiration());

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicleDocuments(Long id, com.example.flotera.vehicle.dto.DocumentRequest request, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul cu ID-ul " + id + " nu a fost găsit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveți permisiunea de a modifica acest vehicul.");
        }

        vehicle.setItpExpiration(request.itpExpiration());
        vehicle.setRcaExpiration(request.rcaExpiration());
        vehicle.setRovinietaExpiration(request.rovinietaExpiration());

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateOdometer(Long id, Long newOdometer, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul cu ID-ul " + id + " nu a fost găsit."));

        // Verificăm permisiunile (Proprietarul sau Șoferul asignat pot actualiza)
        boolean isOwner = vehicle.getOwner().getId().equals(requesterId);
        boolean isAssignedDriver = vehicle.getAssignedDriver() != null && vehicle.getAssignedDriver().getId().equals(requesterId);
        
        if (!isOwner && !isAssignedDriver) {
             throw new SecurityException("Nu aveți permisiunea de a modifica kilometrajul acestui vehicul.");
        }

        if (newOdometer < vehicle.getOdometer()) {
            throw new IllegalArgumentException("Noul kilometraj (" + newOdometer + ") nu poate fi mai mic decât cel actual (" + vehicle.getOdometer() + ").");
        }

        vehicle.setOdometer(newOdometer);
        vehicle.setLastOdometerUpdate(java.time.LocalDate.now());

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul cu ID-ul " + id + " nu a fost găsit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveți permisiunea de a șterge acest vehicul.");
        }

        vehicleRepository.delete(vehicle);
    }

    @Transactional
    public String saveVehicleImage(Long vehicleId, MultipartFile file, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul cu ID-ul " + vehicleId + " nu a fost găsit."));

        // Verificăm dacă cel care face request-ul este proprietarul mașinii
        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveți permisiunea de a modifica acest vehicul.");
        }

        // Salvăm fișierul fizic
        String path = storageService.store(file, "vehicles");
        
        // Generăm URL-ul accesibil public (bazat pe maparea din StorageConfig)
        String imageUrl = "/api/uploads/" + path;
        
        vehicle.setImageUrl(imageUrl);
        vehicleRepository.save(vehicle);

        return imageUrl;
    }

    @Transactional
    public Vehicle assignDriver(Long vehicleId, String driverId, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul nu a fost găsit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Doar proprietarul poate asigna un șofer.");
        }

        if (driverId == null || driverId.trim().isEmpty()) {
            vehicle.setAssignedDriver(null);
        } else {
            User driver = userRepository.findById(driverId)
                    .orElseThrow(() -> new IllegalArgumentException("Șoferul nu a fost găsit."));
            if (driver.getRole() != com.example.flotera.user.Role.DRIVER) {
                throw new IllegalArgumentException("Utilizatorul selectat nu are rolul de ȘOFER.");
            }
            vehicle.setAssignedDriver(driver);
        }

        return vehicleRepository.save(vehicle);
    }
}
