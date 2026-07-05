package com.example.flotera.vehicle;

import com.example.flotera.storage.StorageService;
import com.example.flotera.user.Role;
import com.example.flotera.user.User;
import com.example.flotera.user.UserRepository;
import com.example.flotera.vehicle.dto.VehicleRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private OdometerReadingRepository odometerReadingRepository;

    @Mock
    private com.example.flotera.incident.IncidentRepository incidentRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private User owner;
    private VehicleRequest request;

    @BeforeEach
    void setUp() {
        owner = new User("owner-id", "owner@test.com", "Owner Name", Role.OWNER);
        request = new VehicleRequest("B-123-ABC", "Logan", "Dacia", "ALB", "BENZINA", 2022, "12345678901234567", null, null, null, null, null, null, null, null);
    }

    @Test
    void createVehicle_ShouldSaveVehicle_WhenDataIsValid() {
        // Arrange
        when(vehicleRepository.existsByLicensePlate(any())).thenReturn(false);
        when(vehicleRepository.existsByVin(any())).thenReturn(false);
        when(userRepository.findById("owner-id")).thenReturn(Optional.of(owner));
        when(vehicleRepository.save(any())).thenAnswer(invocation -> {
            Vehicle v = invocation.getArgument(0);
            v.setId(1L);
            return v;
        });

        // Act
        Vehicle result = vehicleService.createVehicle(request, "owner-id");

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("B-123-ABC", result.getLicensePlate());
        assertEquals(owner, result.getOwner());
        verify(vehicleRepository, times(1)).save(any());
    }

    @Test
    void getVehiclesByOwner_ShouldReturnList() {
        // Arrange
        Vehicle vehicle = new Vehicle("B-123-ABC", "Logan", "Dacia", 2022, "12345678901234567", owner);
        vehicle.setColor("ALB");
        when(vehicleRepository.findByOwnerId("owner-id")).thenReturn(List.of(vehicle));

        // Act
        List<Vehicle> result = vehicleService.getVehiclesByOwner("owner-id");

        // Assert
        assertEquals(1, result.size());
        assertEquals("B-123-ABC", result.get(0).getLicensePlate());
    }

    @Test
    void saveVehicleImage_ShouldUpdateImageUrl_WhenOwnerRequests() {
        // Arrange
        Vehicle vehicle = new Vehicle("B-123-ABC", "Logan", "Dacia", 2022, "12345678901234567", owner);
        vehicle.setColor("ALB");
        vehicle.setId(1L);
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "content".getBytes());
        
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(storageService.store(any(), anyString())).thenReturn("vehicles/random-uuid.jpg");

        // Act
        String result = vehicleService.saveVehicleImage(1L, file, "owner-id");

        // Assert
        assertEquals("vehicles/random-uuid.jpg", result);
        assertEquals("vehicles/random-uuid.jpg", vehicle.getImageUrl());
        verify(vehicleRepository, times(1)).save(vehicle);
    }

    @Test
    void updateVehicle_ShouldUpdate_WhenOwnerRequests() {
        // Arrange
        Vehicle vehicle = new Vehicle("B-123-ABC", "Logan", "Dacia", 2022, "12345678901234567", owner);
        vehicle.setId(1L);
        vehicle.setColor("ALB");
        VehicleRequest newRequest = new VehicleRequest("B-999-XYZ", "Dacia Jogger", "Dacia", "ALB", "BENZINA", 2024, "99945678901234567", null, null, null, null, null, null, null, null);

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any())).thenReturn(vehicle);

        // Act
        Vehicle result = vehicleService.updateVehicle(1L, newRequest, "owner-id");

        // Assert
        assertEquals("B-999-XYZ", result.getLicensePlate());
        assertEquals("Dacia Jogger", result.getModel());
        verify(vehicleRepository).save(vehicle);
    }

    @Test
    void deleteVehicle_ShouldDelete_WhenOwnerRequests() {
        // Arrange
        Vehicle vehicle = new Vehicle("B-123-ABC", "Logan", "Dacia", 2022, "12345678901234567", owner);
        vehicle.setColor("ALB");
        vehicle.setId(1L);
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        // Act
        vehicleService.deleteVehicle(1L, "owner-id");

        // Assert
        verify(vehicleRepository).delete(vehicle);
    }

    @Test
    void updateOdometer_ShouldUpdate_WhenValueIsGreater() {
        // Arrange
        Vehicle vehicle = new Vehicle("B-123-ABC", "Logan", "Dacia", 2022, "12345678901234567", owner);
        vehicle.setColor("ALB");
        vehicle.setId(1L);
        vehicle.setOdometer(1000L);
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any())).thenReturn(vehicle);

        // Act
        Vehicle result = vehicleService.updateOdometer(1L, 1100L, "owner-id");

        // Assert
        assertEquals(1100L, result.getOdometer());
        assertNotNull(result.getLastOdometerUpdate());
        verify(vehicleRepository).save(vehicle);
    }

    @Test
    void updateOdometer_ShouldThrowException_WhenValueIsSmaller() {
        // Arrange
        Vehicle vehicle = new Vehicle("B-123-ABC", "Logan", "Dacia", 2022, "12345678901234567", owner);
        vehicle.setColor("ALB");
        vehicle.setId(1L);
        vehicle.setOdometer(1000L);
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> 
            vehicleService.updateOdometer(1L, 900L, "owner-id")
        );
        verify(vehicleRepository, never()).save(any());
    }
}
