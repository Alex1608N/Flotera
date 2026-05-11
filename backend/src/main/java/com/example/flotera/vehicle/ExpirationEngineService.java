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
        // 1. Verificăm Documentele Legale (ITP, RCA, Rovinietă)
        worst = updateWorstStatusFromDate(worst, v.getItpExpiration(), now, 30);
        worst = updateWorstStatusFromDate(worst, v.getRcaExpiration(), now, 30);
        worst = updateWorstStatusFromDate(worst, v.getRovinietaExpiration(), now, 30);
        
        // 2. Verificăm Mentenanță (Kilometraj)
        if (v.getOdometer() != null && v.getLastMaintenanceKm() != null) {
            long kmSinceLast = v.getOdometer() - v.getLastMaintenanceKm();
            long threshold = v.getMaintenanceThresholdKm() != null ? v.getMaintenanceThresholdKm() : 10000L;
            
            if (kmSinceLast >= threshold) {
                worst = VehicleStatus.CRITICAL;
            } else if (kmSinceLast >= threshold - 500) {
                if (worst != VehicleStatus.CRITICAL) worst = VehicleStatus.WARNING;
            }
        }
        
        // 3. Verificăm Mentenanță (Timp)
        if (v.getLastMaintenanceDate() != null) {
            int monthsThreshold = v.getMaintenanceThresholdMonths() != null ? v.getMaintenanceThresholdMonths() : 12;
            LocalDate nextMaintenanceDate = v.getLastMaintenanceDate().plusMonths(monthsThreshold);
            // Pentru mentenanță timp, pragul de warning este de 1 lună (aprox 30 zile)
            worst = updateWorstStatusFromDate(worst, nextMaintenanceDate, now, 30);
        } else if (v.getYear() != null) {
            // Fallback: un an de la începutul anului fabricației (dacă nu avem dată revizie)
            LocalDate fallbackDate = LocalDate.of(v.getYear(), 1, 1).plusYears(1);
            worst = updateWorstStatusFromDate(worst, fallbackDate, now, 30);
        }
        
        return worst;
    }

    /**
     * Actualizează starea curentă bazându-se pe o dată de expirare și un prag de warning în zile.
     */
    private VehicleStatus updateWorstStatusFromDate(VehicleStatus current, LocalDate expiration, LocalDate now, int warningDaysThreshold) {
        if (expiration == null) return current;
        
        // Deja expirat sau expiră azi -> CRITICAL
        if (expiration.isBefore(now) || expiration.isEqual(now)) {
            return VehicleStatus.CRITICAL;
        }
        
        // Expiră în fereastra de warning -> WARNING
        if (expiration.isBefore(now.plusDays(warningDaysThreshold))) {
            if (current != VehicleStatus.CRITICAL) {
                return VehicleStatus.WARNING;
            }
        }
        
        return current;
    }
}
