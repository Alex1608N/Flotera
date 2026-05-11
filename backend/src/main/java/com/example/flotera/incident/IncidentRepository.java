package com.example.flotera.incident;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);
    boolean existsByVehicleIdAndStatus(Long vehicleId, IncidentStatus status);
}
