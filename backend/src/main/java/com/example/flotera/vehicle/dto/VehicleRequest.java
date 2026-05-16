package com.example.flotera.vehicle.dto;

import jakarta.validation.constraints.*;

public record VehicleRequest(
    @NotBlank(message = "Numărul de înmatriculare este obligatoriu")
    @Size(min = 2, max = 20, message = "Numărul de înmatriculare trebuie să aibă între 2 și 20 caractere")
    String licensePlate,

    @NotBlank(message = "Modelul este obligatoriu")
    String model,

    @NotNull(message = "Anul este obligatoriu")
    @Min(value = 1900, message = "Anul trebuie să fie minim 1900")
    @Max(value = 2100, message = "Anul trebuie să fie maxim 2100")
    Integer year,

    @NotBlank(message = "Seria de șasiu (VIN) este obligatorie")
    @Size(min = 17, max = 17, message = "Seria de șasiu trebuie să aibă exact 17 caractere")
    String vin,

    java.time.LocalDate itpExpiration,
    java.time.LocalDate rcaExpiration,
    java.time.LocalDate rovinietaExpiration,
    
    Long lastMaintenanceKm,
    java.time.LocalDate lastMaintenanceDate,
    Long maintenanceThresholdKm,
    Integer maintenanceThresholdMonths,
    String assignedDriverId
) {
}
