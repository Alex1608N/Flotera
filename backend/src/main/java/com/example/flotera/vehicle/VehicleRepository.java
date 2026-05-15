package com.example.flotera.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    Optional<Vehicle> findByVin(String vin);
    boolean existsByLicensePlate(String licensePlate);
    boolean existsByVin(String vin);
    List<Vehicle> findByOwnerId(String ownerId);
    List<Vehicle> findByAssignedDriverId(String driverId);
}
