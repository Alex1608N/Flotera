package com.example.flotera.vehicle.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record OdometerRequest(
    @NotNull(message = "Kilometrajul este obligatoriu")
    @Min(value = 0, message = "Kilometrajul nu poate fi negativ")
    Long odometer
) {}
