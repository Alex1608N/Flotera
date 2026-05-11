package com.example.flotera.incident.dto;

import com.example.flotera.incident.IncidentStatus;
import java.time.LocalDateTime;

public record IncidentResponse(
    Long id,
    Long vehicleId,
    String description,
    IncidentStatus status,
    LocalDateTime createdAt,
    LocalDateTime resolvedAt
) {}
