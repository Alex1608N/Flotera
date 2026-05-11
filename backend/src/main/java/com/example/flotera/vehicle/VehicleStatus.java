package com.example.flotera.vehicle;

public enum VehicleStatus {
    OK,       // Verde: Totul este în regulă (> 30 zile)
    WARNING,  // Galben: Expiră curând (0-30 zile)
    CRITICAL  // Roșu: Expirați sau Mentenanță necesară (<= 0 zile)
}
