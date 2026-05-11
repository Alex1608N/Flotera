package com.example.flotera.vehicle.dto;

import com.example.flotera.vehicle.ServiceType;
import java.time.LocalDate;

public record ServiceRecordResponse(
    Long id,
    Long vehicleId,
    LocalDate date,
    Long odometer,
    String description,
    Double cost,
    ServiceType type
) {}
