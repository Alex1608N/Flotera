package com.example.flotera.vehicle;

import org.springframework.stereotype.Service;
import java.time.Clock;
import java.time.LocalDate;

@Service
public class ExpirationEngineService {

    private final Clock clock;

    public ExpirationEngineService(Clock clock) {
        this.clock = clock;
    }

    public VehicleStatus calculateStatus(Vehicle v, boolean hasActiveIncidents) {
        LocalDate now = LocalDate.now(clock);

        if (hasActiveIncidents) {
            return VehicleStatus.CRITICAL;
        }

        VehicleStatus worst = VehicleStatus.OK;
        // 1. Verificam Documentele Legale (ITP, RCA, Rovinieta)
        worst = updateWorstStatusFromDate(worst, v.getItpExpiration(), now, 30);
        worst = updateWorstStatusFromDate(worst, v.getRcaExpiration(), now, 30);
        worst = updateWorstStatusFromDate(worst, v.getRovinietaExpiration(), now, 30);
        
        // 2. Verificam Mentenanta (Kilometraj)
        if (v.getOdometer() != null && v.getLastMaintenanceKm() != null) {
            long kmSinceLast = v.getOdometer() - v.getLastMaintenanceKm();
            long threshold = v.getMaintenanceThresholdKm() != null ? v.getMaintenanceThresholdKm() : 10000L;
            
            if (kmSinceLast >= threshold) {
                worst = VehicleStatus.CRITICAL;
            } else if (kmSinceLast >= threshold - 500) {
                if (worst != VehicleStatus.CRITICAL) worst = VehicleStatus.WARNING;
            }
        }
        
        // 3. Verificam Mentenanta (Timp)
        if (v.getLastMaintenanceDate() != null) {
            int monthsThreshold = v.getMaintenanceThresholdMonths() != null ? v.getMaintenanceThresholdMonths() : 12;
            LocalDate nextMaintenanceDate = v.getLastMaintenanceDate().plusMonths(monthsThreshold);
            // Prag warning: 1 luna
            worst = updateWorstStatusFromDate(worst, nextMaintenanceDate, now, 30);
        } else if (v.getYear() != null) {
            // Fallback: un an de la fabricatie
            LocalDate fallbackDate = LocalDate.of(v.getYear(), 1, 1).plusYears(1);
            worst = updateWorstStatusFromDate(worst, fallbackDate, now, 30);
        }
        
        return worst;
    }

    /**
     * Actualizeaza starea.
     */
    private VehicleStatus updateWorstStatusFromDate(VehicleStatus current, LocalDate expiration, LocalDate now, int warningDaysThreshold) {
        if (expiration == null) return current;
        
        // Expirat -> CRITICAL
        if (expiration.isBefore(now) || expiration.isEqual(now)) {
            return VehicleStatus.CRITICAL;
        }
        
        // Expira in fereastra de warning -> WARNING
        if (expiration.isBefore(now.plusDays(warningDaysThreshold))) {
            if (current != VehicleStatus.CRITICAL) {
                return VehicleStatus.WARNING;
            }
        }
        
        return current;
    }
}
