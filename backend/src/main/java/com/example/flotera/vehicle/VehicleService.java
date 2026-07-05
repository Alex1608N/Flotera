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
    private final OdometerReadingRepository odometerReadingRepository;
    private final StorageService storageService;

    public VehicleService(VehicleRepository vehicleRepository, 
                          UserRepository userRepository, 
                          StorageService storageService, 
                          OdometerReadingRepository odometerReadingRepository) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.odometerReadingRepository = odometerReadingRepository;
    }

    public List<Vehicle> getVehiclesByOwner(String ownerId) {
        return vehicleRepository.findByOwnerId(ownerId);
    }

    public List<Vehicle> getVehiclesForUser(User user) {
        if (user.getRole() == com.example.flotera.user.Role.OWNER) {
            // Proprietar vede tot ce a creat
            return vehicleRepository.findByOwnerId(user.getId());
        } else {
            // Sofer vede doar masina asignata
            return vehicleRepository.findByAssignedDriverId(user.getId());
        }
    }

    @Transactional
    public Vehicle createVehicle(VehicleRequest request, String ownerId) {
        if (vehicleRepository.existsByLicensePlate(request.licensePlate())) {
            throw new IllegalArgumentException("Numarul de inmatriculare " + request.licensePlate() + " exista deja.");
        }
        if (vehicleRepository.existsByVin(request.vin())) {
            throw new IllegalArgumentException("Seria de sasiu " + request.vin() + " exista deja.");
        }

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul cu ID-ul " + ownerId + " nu exista."));

        Vehicle vehicle = new Vehicle(
                request.licensePlate(),
                request.model(),
                request.brand(),
                request.year(),
                request.vin(),
                owner
        );
        
        vehicle.setColor(request.color());
        vehicle.setFuelType(request.fuelType());
        vehicle.setItpExpiration(request.itpExpiration());
        vehicle.setRcaExpiration(request.rcaExpiration());
        vehicle.setRovinietaExpiration(request.rovinietaExpiration());
        
        vehicle.setLastMaintenanceKm(request.lastMaintenanceKm() != null ? request.lastMaintenanceKm() : 0L);
        vehicle.setLastMaintenanceDate(request.lastMaintenanceDate());
        vehicle.setMaintenanceThresholdKm(request.maintenanceThresholdKm() != null ? request.maintenanceThresholdKm() : 10000L);
        vehicle.setMaintenanceThresholdMonths(request.maintenanceThresholdMonths() != null ? request.maintenanceThresholdMonths() : 12);

        if (request.assignedDriverId() != null && !request.assignedDriverId().isEmpty()) {
            User driver = userRepository.findById(request.assignedDriverId())
                    .orElseThrow(() -> new IllegalArgumentException("Soferul nu a fost gasit."));
            vehicle.setAssignedDriver(driver);
        }

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicle(Long id, VehicleRequest request, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul cu ID-ul " + id + " nu a fost gasit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveti permisiunea de a modifica acest vehicul.");
        }

        // Verificam daca noul numar sau VIN sunt folosite de alta masina
        vehicleRepository.findByLicensePlate(request.licensePlate())
                .ifPresent(v -> {
                    if (!v.getId().equals(id)) throw new IllegalArgumentException("Numarul de inmatriculare exista deja.");
                });
        
        vehicleRepository.findByVin(request.vin())
                .ifPresent(v -> {
                    if (!v.getId().equals(id)) throw new IllegalArgumentException("Seria de sasiu exista deja.");
                });

        vehicle.setLicensePlate(request.licensePlate());
        vehicle.setModel(request.model());
        vehicle.setBrand(request.brand());
        vehicle.setColor(request.color());
        vehicle.setFuelType(request.fuelType());
        vehicle.setYear(request.year());
        vehicle.setVin(request.vin());
        
        vehicle.setItpExpiration(request.itpExpiration());
        vehicle.setRcaExpiration(request.rcaExpiration());
        vehicle.setRovinietaExpiration(request.rovinietaExpiration());
        
        vehicle.setLastMaintenanceKm(request.lastMaintenanceKm() != null ? request.lastMaintenanceKm() : vehicle.getLastMaintenanceKm());
        vehicle.setLastMaintenanceDate(request.lastMaintenanceDate());
        vehicle.setMaintenanceThresholdKm(request.maintenanceThresholdKm() != null ? request.maintenanceThresholdKm() : vehicle.getMaintenanceThresholdKm());
        vehicle.setMaintenanceThresholdMonths(request.maintenanceThresholdMonths() != null ? request.maintenanceThresholdMonths() : vehicle.getMaintenanceThresholdMonths());

        if (request.assignedDriverId() == null || request.assignedDriverId().isEmpty()) {
            vehicle.setAssignedDriver(null);
        } else {
            User driver = userRepository.findById(request.assignedDriverId())
                    .orElseThrow(() -> new IllegalArgumentException("Soferul nu a fost gasit."));
            vehicle.setAssignedDriver(driver);
        }

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicleDocuments(Long id, com.example.flotera.vehicle.dto.DocumentRequest request, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul cu ID-ul " + id + " nu a fost gasit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveti permisiunea de a modifica acest vehicul.");
        }

        vehicle.setItpExpiration(request.itpExpiration());
        vehicle.setRcaExpiration(request.rcaExpiration());
        vehicle.setRovinietaExpiration(request.rovinietaExpiration());

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateOdometer(Long id, Long newOdometer, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul cu ID-ul " + id + " nu a fost gasit."));

        // Verificam permisiunile (Proprietar sau Sofer asignat)
        boolean isOwner = vehicle.getOwner().getId().equals(requesterId);
        boolean isAssignedDriver = vehicle.getAssignedDriver() != null && vehicle.getAssignedDriver().getId().equals(requesterId);
        
        if (!isOwner && !isAssignedDriver) {
             throw new SecurityException("Nu aveti permisiunea de a modifica kilometrajul acestui vehicul.");
        }

        if (newOdometer < vehicle.getOdometer()) {
            throw new IllegalArgumentException("Noul kilometraj (" + newOdometer + ") nu poate fi mai mic decat cel actual (" + vehicle.getOdometer() + ").");
        }

        vehicle.setOdometer(newOdometer);
        vehicle.setLastOdometerUpdate(java.time.LocalDate.now());

        // Inregistram in istoric
        odometerReadingRepository.save(new OdometerReading(vehicle, newOdometer, java.time.LocalDate.now()));

        return vehicleRepository.save(vehicle);
    }

    public List<OdometerReading> getOdometerHistory(Long vehicleId, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul nu a fost gasit."));
        
        // Verificam accesul
        boolean isOwner = vehicle.getOwner().getId().equals(requesterId);
        boolean isAssignedDriver = vehicle.getAssignedDriver() != null && vehicle.getAssignedDriver().getId().equals(requesterId);
        
        if (!isOwner && !isAssignedDriver) {
            throw new SecurityException("Nu aveti permisiunea de a vedea istoricul acestui vehicul.");
        }

        return odometerReadingRepository.findByVehicleIdOrderByReadingDateAsc(vehicleId);
    }

    @Transactional
    public void deleteVehicle(Long id, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul cu ID-ul " + id + " nu a fost gasit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveti permisiunea de a sterge acest vehicul.");
        }

        vehicleRepository.delete(vehicle);
    }

    @Transactional
    public String saveVehicleImage(Long vehicleId, MultipartFile file, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul cu ID-ul " + vehicleId + " nu a fost gasit."));

        // Verificam daca cel care face request-ul este proprietarul
        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Nu aveti permisiunea de a modifica acest vehicul.");
        }

        // Salvam fisierul
        String imageUrl = storageService.store(file, "vehicles");
        
        vehicle.setImageUrl(imageUrl);
        vehicleRepository.save(vehicle);

        return imageUrl;
    }

    @Transactional
    public Vehicle assignDriver(Long vehicleId, String driverId, String requesterId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehiculul nu a fost gasit."));

        if (!vehicle.getOwner().getId().equals(requesterId)) {
            throw new SecurityException("Doar proprietarul poate asigna un sofer.");
        }

        if (driverId == null || driverId.trim().isEmpty()) {
            vehicle.setAssignedDriver(null);
        } else {
            User driver = userRepository.findById(driverId)
                    .orElseThrow(() -> new IllegalArgumentException("Soferul nu a fost gasit."));
            if (driver.getRole() != com.example.flotera.user.Role.DRIVER) {
                throw new IllegalArgumentException("Utilizatorul selectat nu are rolul de SOFER.");
            }
            vehicle.setAssignedDriver(driver);
        }

        return vehicleRepository.save(vehicle);
    }
}
