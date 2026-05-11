package com.example.flotera.incident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IncidentRequest(
    @NotBlank(message = "Descrierea incidentului este obligatorie")
    @Size(max = 1000, message = "Descrierea nu poate depăși 1000 de caractere")
    String description
) {}
