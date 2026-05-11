package com.example.flotera.vehicle.dto;

import com.example.flotera.vehicle.ServiceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ServiceRecordRequest(
    @NotNull(message = "Data este obligatorie")
    LocalDate date,

    @NotNull(message = "Kilometrajul este obligatoriu")
    @Min(value = 0, message = "Kilometrajul nu poate fi negativ")
    Long odometer,

    @NotBlank(message = "Descrierea este obligatorie")
    String description,

    Double cost,

    @NotNull(message = "Tipul de service este obligatoriu")
    ServiceType type
) {}
