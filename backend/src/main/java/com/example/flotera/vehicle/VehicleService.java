package com.example.flotera.vehicle;

import com.example.flotera.storage.StorageService;
import com.example.flotera.user.User;
import com.example.flotera.user.UserRepository;
import com.example.flotera.vehicle.dto.VehicleRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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

        return vehicleRepository.save(vehicle);
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
}
