package com.example.flotera.incident;

import com.example.flotera.incident.dto.IncidentRequest;
import com.example.flotera.incident.dto.IncidentResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping("/{id}/incidents")
    public ResponseEntity<IncidentResponse> reportIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(incidentService.reportIncident(id, request, jwt.getSubject()));
    }

    @GetMapping("/{id}/incidents")
    public ResponseEntity<List<IncidentResponse>> getIncidents(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(incidentService.getIncidentsByVehicle(id, jwt.getSubject()));
    }

    @PatchMapping("/incidents/{incidentId}/resolve")
    public ResponseEntity<IncidentResponse> resolveIncident(
            @PathVariable Long incidentId,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(incidentService.resolveIncident(incidentId, jwt.getSubject()));
    }
}
