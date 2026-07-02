package com.example.flotera.vehicle.dto;

import com.example.flotera.vehicle.VehicleStatus;
import java.time.LocalDate;

public record VehicleResponse(
        Long id,
        String licensePlate,
        String model,
        String brand,
        String color,
        Integer year,
        String vin,
        String ownerId,
        String assignedDriverId,
        String assignedDriverName,
        String assignedDriverProfilePictureUrl,
        String imageUrl,
        LocalDate itpExpiration,
        LocalDate rcaExpiration,
        LocalDate rovinietaExpiration,
        VehicleStatus status,
        Long odometer,
        LocalDate lastOdometerUpdate,
        Long lastMaintenanceKm,
        LocalDate lastMaintenanceDate,
        Long maintenanceThresholdKm,
        Integer maintenanceThresholdMonths,
        boolean hasActiveIncidents
) {}

