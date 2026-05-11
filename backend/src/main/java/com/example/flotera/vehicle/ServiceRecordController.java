package com.example.flotera.vehicle;

import com.example.flotera.vehicle.dto.ServiceRecordRequest;
import com.example.flotera.vehicle.dto.ServiceRecordResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles/{id}/service-history")
public class ServiceRecordController {

    private final ServiceRecordService serviceRecordService;

    public ServiceRecordController(ServiceRecordService serviceRecordService) {
        this.serviceRecordService = serviceRecordService;
    }

    @PostMapping
    public ResponseEntity<ServiceRecordResponse> addRecord(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRecordRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(serviceRecordService.addRecord(id, request, jwt.getSubject()));
    }

    @GetMapping
    public ResponseEntity<List<ServiceRecordResponse>> getHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(serviceRecordService.getHistory(id, jwt.getSubject()));
    }
}
