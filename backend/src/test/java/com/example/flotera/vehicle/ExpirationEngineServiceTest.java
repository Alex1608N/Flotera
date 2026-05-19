package com.example.flotera.vehicle;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ExpirationEngineServiceTest {

    private ExpirationEngineService service;
    private Clock clock;
    private final LocalDate NOW = LocalDate.of(2026, 5, 6);

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(Instant.parse("2026-05-06T10:00:00Z"), ZoneId.of("UTC"));
        service = new ExpirationEngineService(clock);
    }

    @Test
    void shouldReturnOkWhenAllIsGood() {
        Vehicle v = new Vehicle();
        v.setItpExpiration(NOW.plusDays(31));
        v.setRcaExpiration(NOW.plusDays(31));
        v.setRovinietaExpiration(NOW.plusDays(31));
        v.setOdometer(1000L);
        v.setLastMaintenanceKm(0L);
        v.setMaintenanceThresholdKm(10000L);
        v.setLastMaintenanceDate(NOW.minusMonths(6));
        v.setMaintenanceThresholdMonths(12);

        assertEquals(VehicleStatus.OK, service.calculateStatus(v, false));
    }

    @Test
    void shouldReturnWarningWhenItpExpiresSoon() {
        Vehicle v = new Vehicle();
        v.setItpExpiration(NOW.plusDays(15));

        assertEquals(VehicleStatus.WARNING, service.calculateStatus(v, false));
    }

    @Test
    void shouldReturnCriticalWhenRcaExpired() {
        Vehicle v = new Vehicle();
        v.setRcaExpiration(NOW.minusDays(1));

        assertEquals(VehicleStatus.CRITICAL, service.calculateStatus(v, false));
    }

    @Test
    void shouldReturnCriticalWhenMaintenanceKmReached() {
        Vehicle v = new Vehicle();
        v.setOdometer(11000L);
        v.setLastMaintenanceKm(1000L);
        v.setMaintenanceThresholdKm(10000L);

        assertEquals(VehicleStatus.CRITICAL, service.calculateStatus(v, false));
    }

    @Test
    void shouldReturnWarningWhenMaintenanceKmSoon() {
        Vehicle v = new Vehicle();
        v.setOdometer(10600L);
        v.setLastMaintenanceKm(1000L);
        v.setMaintenanceThresholdKm(10000L);

        assertEquals(VehicleStatus.WARNING, service.calculateStatus(v, false));
    }

    @Test
    void shouldReturnCriticalWhenMaintenanceTimeReached() {
        Vehicle v = new Vehicle();
        v.setLastMaintenanceDate(NOW.minusMonths(13));
        v.setMaintenanceThresholdMonths(12);

        assertEquals(VehicleStatus.CRITICAL, service.calculateStatus(v, false));
    }

    @Test
    void shouldReturnWarningWhenMaintenanceTimeSoon() {
        Vehicle v = new Vehicle();
        v.setLastMaintenanceDate(NOW.minusMonths(11).minusDays(15)); // Expira curand
        v.setMaintenanceThresholdMonths(12);

        assertEquals(VehicleStatus.WARNING, service.calculateStatus(v, false));
    }

    @Test
    void shouldReturnWarningWhenKmOkButTimeWarning() {
        Vehicle v = new Vehicle();
        v.setOdometer(2000L);
        v.setLastMaintenanceKm(1000L);
        v.setMaintenanceThresholdKm(10000L); // KM OK

        v.setLastMaintenanceDate(NOW.minusMonths(11).minusDays(15)); // Timp WARNING
        v.setMaintenanceThresholdMonths(12);

        assertEquals(VehicleStatus.WARNING, service.calculateStatus(v, false));
    }

    @Test
    void shouldPrioritizeCriticalOverWarning() {
        Vehicle v = new Vehicle();
        v.setItpExpiration(NOW.plusDays(15)); // WARNING
        v.setRcaExpiration(NOW.minusDays(1));  // CRITICAL

        assertEquals(VehicleStatus.CRITICAL, service.calculateStatus(v, false));
    }

    @Test
    void shouldReturnCriticalWhenHasActiveIncidents() {
        Vehicle v = new Vehicle();
        v.setItpExpiration(NOW.plusDays(31)); // OK

        assertEquals(VehicleStatus.CRITICAL, service.calculateStatus(v, true));
    }

}
