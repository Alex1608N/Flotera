package com.example.flotera.vehicle.dto;

import java.time.LocalDate;

public record DocumentRequest(
        LocalDate itpExpiration,
        LocalDate rcaExpiration,
        LocalDate rovinietaExpiration
) {}
