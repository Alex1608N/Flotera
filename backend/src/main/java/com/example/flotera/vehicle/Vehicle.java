package com.example.flotera.vehicle;

import com.example.flotera.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "license_plate", nullable = false, unique = true)
    private String licensePlate;

    @Column(nullable = false)
    private String model;

    @Column(name = "\"year\"", nullable = false)
    private Integer year;

    @Column(nullable = false, unique = true)
    private String vin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "itp_expiration")
    private java.time.LocalDate itpExpiration;

    @Column(name = "rca_expiration")
    private java.time.LocalDate rcaExpiration;

    @Column(name = "rovinieta_expiration")
    private java.time.LocalDate rovinietaExpiration;

    @Column(nullable = false)
    private Long odometer = 0L;

    @Column(name = "last_odometer_update")
    private java.time.LocalDate lastOdometerUpdate;

    @Column(name = "last_maintenance_km")
    private Long lastMaintenanceKm = 0L;

    @Column(name = "last_maintenance_date")
    private java.time.LocalDate lastMaintenanceDate;

    @Column(name = "maintenance_threshold_km")
    private Long maintenanceThresholdKm = 10000L;

    @Column(name = "maintenance_threshold_months")
    private Integer maintenanceThresholdMonths = 12;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<com.example.flotera.incident.Incident> incidents = new java.util.ArrayList<>();

    public Vehicle() {
    }

    public Vehicle(String licensePlate, String model, Integer year, String vin, User owner) {
        this.licensePlate = licensePlate;
        this.model = model;
        this.year = year;
        this.vin = vin;
        this.owner = owner;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public java.time.LocalDate getItpExpiration() { return itpExpiration; }
    public void setItpExpiration(java.time.LocalDate itpExpiration) { this.itpExpiration = itpExpiration; }

    public java.time.LocalDate getRcaExpiration() { return rcaExpiration; }
    public void setRcaExpiration(java.time.LocalDate rcaExpiration) { this.rcaExpiration = rcaExpiration; }

    public java.time.LocalDate getRovinietaExpiration() { return rovinietaExpiration; }
    public void setRovinietaExpiration(java.time.LocalDate rovinietaExpiration) { this.rovinietaExpiration = rovinietaExpiration; }

    public Long getOdometer() { return odometer; }
    public void setOdometer(Long odometer) { this.odometer = odometer; }

    public java.time.LocalDate getLastOdometerUpdate() { return lastOdometerUpdate; }
    public void setLastOdometerUpdate(java.time.LocalDate lastOdometerUpdate) { this.lastOdometerUpdate = lastOdometerUpdate; }

    public Long getLastMaintenanceKm() { return lastMaintenanceKm; }
    public void setLastMaintenanceKm(Long lastMaintenanceKm) { this.lastMaintenanceKm = lastMaintenanceKm; }

    public java.time.LocalDate getLastMaintenanceDate() { return lastMaintenanceDate; }
    public void setLastMaintenanceDate(java.time.LocalDate lastMaintenanceDate) { this.lastMaintenanceDate = lastMaintenanceDate; }

    public Long getMaintenanceThresholdKm() { return maintenanceThresholdKm; }
    public void setMaintenanceThresholdKm(Long maintenanceThresholdKm) { this.maintenanceThresholdKm = maintenanceThresholdKm; }

    public Integer getMaintenanceThresholdMonths() { return maintenanceThresholdMonths; }
    public void setMaintenanceThresholdMonths(Integer maintenanceThresholdMonths) { this.maintenanceThresholdMonths = maintenanceThresholdMonths; }

    public java.util.List<com.example.flotera.incident.Incident> getIncidents() { return incidents; }
    public void setIncidents(java.util.List<com.example.flotera.incident.Incident> incidents) { this.incidents = incidents; }
}
