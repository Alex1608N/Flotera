package com.example.flotera.vehicle;

import com.example.flotera.incident.IncidentRepository;
import com.example.flotera.incident.IncidentStatus;
import com.example.flotera.vehicle.dto.VehicleRequest;
import com.example.flotera.vehicle.dto.VehicleResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;
    private final ExpirationEngineService expirationEngineService;
    private final IncidentRepository incidentRepository;
    private final com.example.flotera.user.UserRepository userRepository;

    public VehicleController(VehicleService vehicleService, 
                             ExpirationEngineService expirationEngineService,
                             IncidentRepository incidentRepository,
                             com.example.flotera.user.UserRepository userRepository) {
        this.vehicleService = vehicleService;
        this.expirationEngineService = expirationEngineService;
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getAllVehicles(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        com.example.flotera.user.User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost gasit."));
        
        List<Vehicle> vehicles = vehicleService.getVehiclesForUser(user);

        List<VehicleResponse> response = vehicles.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> createVehicle(
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        // Sub din JWT
        String ownerId = jwt.getSubject();

        Vehicle vehicle = vehicleService.createVehicle(request, ownerId);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(vehicle));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String requesterId = jwt.getSubject();
        String imageUrl = vehicleService.saveVehicleImage(id, file, requesterId);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String requesterId = jwt.getSubject();
        Vehicle vehicle = vehicleService.updateVehicle(id, request, requesterId);

        return ResponseEntity.ok(toResponse(vehicle));
    }

    @PutMapping("/{id}/documents")
    public ResponseEntity<VehicleResponse> updateVehicleDocuments(
            @PathVariable Long id,
            @Valid @RequestBody com.example.flotera.vehicle.dto.DocumentRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String requesterId = jwt.getSubject();
        Vehicle vehicle = vehicleService.updateVehicleDocuments(id, request, requesterId);
        return ResponseEntity.ok(toResponse(vehicle));
    }

    @PostMapping("/{id}/odometer")
    public ResponseEntity<VehicleResponse> updateOdometer(
            @PathVariable Long id,
            @Valid @RequestBody com.example.flotera.vehicle.dto.OdometerRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String requesterId = jwt.getSubject();
        Vehicle vehicle = vehicleService.updateOdometer(id, request.odometer(), requesterId);
        return ResponseEntity.ok(toResponse(vehicle));
    }

    @GetMapping("/{id}/odometer-history")
    public ResponseEntity<List<Map<String, Object>>> getOdometerHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String requesterId = jwt.getSubject();
        List<OdometerReading> history = vehicleService.getOdometerHistory(id, requesterId);
        
        List<Map<String, Object>> response = history.stream()
                .map(r -> Map.of(
                        "date", r.getReadingDate().toString(),
                        "value", (Object)r.getOdometerValue()
                ))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/driver")
    public ResponseEntity<VehicleResponse> assignDriver(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String requesterId = jwt.getSubject();
        String driverId = request.get("driverId");
        Vehicle vehicle = vehicleService.assignDriver(id, driverId, requesterId);
        return ResponseEntity.ok(toResponse(vehicle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String requesterId = jwt.getSubject();
        vehicleService.deleteVehicle(id, requesterId);
        return ResponseEntity.noContent().build();
    }

    private VehicleResponse toResponse(Vehicle v) {
        boolean hasActiveIncidents = incidentRepository.existsByVehicleIdAndStatus(v.getId(), IncidentStatus.OPEN);
        VehicleStatus status = expirationEngineService.calculateStatus(v, hasActiveIncidents);

        return new VehicleResponse(
                v.getId(),
                v.getLicensePlate(),
                v.getModel(),
                v.getBrand(),
                v.getColor(),
                v.getYear(),
                v.getVin(),
                v.getOwner().getId(),
                v.getAssignedDriver() != null ? v.getAssignedDriver().getId() : null,
                v.getAssignedDriver() != null ? v.getAssignedDriver().getName() : null,
                v.getAssignedDriver() != null ? v.getAssignedDriver().getProfilePictureUrl() : null,
                v.getImageUrl(),
                v.getItpExpiration(),
                v.getRcaExpiration(),
                v.getRovinietaExpiration(),
                status,
                v.getOdometer(),
                v.getLastOdometerUpdate(),
                v.getLastMaintenanceKm(),
                v.getLastMaintenanceDate(),
                v.getMaintenanceThresholdKm(),
                v.getMaintenanceThresholdMonths(),
                hasActiveIncidents
        );
    }
}

