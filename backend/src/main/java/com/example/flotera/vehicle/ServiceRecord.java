package com.example.flotera.vehicle;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "service_records")
public class ServiceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Long odometer;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column
    private Double cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType type;

    public ServiceRecord() {
    }

    public ServiceRecord(Vehicle vehicle, LocalDate date, Long odometer, String description, Double cost, ServiceType type) {
        this.vehicle = vehicle;
        this.date = date;
        this.odometer = odometer;
        this.description = description;
        this.cost = cost;
        this.type = type;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Long getOdometer() { return odometer; }
    public void setOdometer(Long odometer) { this.odometer = odometer; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }

    public ServiceType getType() { return type; }
    public void setType(ServiceType type) { this.type = type; }
}
