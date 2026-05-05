package com.example.flotera.vehicle.dto;

public record VehicleResponse(
    Long id,
    String licensePlate,
    String model,
    Integer year,
    String vin,
    String ownerId
) {
}
