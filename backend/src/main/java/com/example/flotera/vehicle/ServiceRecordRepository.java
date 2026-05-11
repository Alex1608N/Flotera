package com.example.flotera.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, Long> {
    List<ServiceRecord> findByVehicleIdOrderByDateDesc(Long vehicleId);
}
