package com.example.flotera.vehicle;

import com.example.flotera.vehicle.dto.VehicleRequest;
import com.example.flotera.vehicle.dto.VehicleResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> createVehicle(
            @Valid @RequestBody VehicleRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        // Sub-ul din JWT este ID-ul utilizatorului din Supabase
        String ownerId = jwt.getSubject();
        
        Vehicle vehicle = vehicleService.createVehicle(request, ownerId);
        
        VehicleResponse response = new VehicleResponse(
                vehicle.getId(),
                vehicle.getLicensePlate(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getVin(),
                vehicle.getOwner().getId()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
}
