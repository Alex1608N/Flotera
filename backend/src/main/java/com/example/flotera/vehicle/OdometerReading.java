package com.example.flotera.vehicle;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "odometer_readings")
public class OdometerReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private Long odometerValue;

    @Column(nullable = false)
    private LocalDate readingDate;

    public OdometerReading() {}

    public OdometerReading(Vehicle vehicle, Long odometerValue, LocalDate readingDate) {
        this.vehicle = vehicle;
        this.odometerValue = odometerValue;
        this.readingDate = readingDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public Long getOdometerValue() { return odometerValue; }
    public void setOdometerValue(Long odometerValue) { this.odometerValue = odometerValue; }

    public LocalDate getReadingDate() { return readingDate; }
    public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }
}
