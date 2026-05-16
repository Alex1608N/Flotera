package com.example.flotera.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OdometerReadingRepository extends JpaRepository<OdometerReading, Long> {
    List<OdometerReading> findByVehicleIdOrderByReadingDateAsc(Long vehicleId);
}
