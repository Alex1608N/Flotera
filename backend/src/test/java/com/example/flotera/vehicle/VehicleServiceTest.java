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

    @InjectMocks
    private VehicleService vehicleService;

    private User owner;
    private VehicleRequest request;

    @BeforeEach
    void setUp() {
        owner = new User("owner-id", "owner@test.com", "Owner Name", Role.OWNER);
        request = new VehicleRequest("B-123-ABC", "Dacia Logan", 2022, "12345678901234567");
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
    void saveVehicleImage_ShouldUpdateImageUrl_WhenOwnerRequests() {
        // Arrange
        Vehicle vehicle = new Vehicle("B-123-ABC", "Dacia Logan", 2022, "12345678901234567", owner);
        vehicle.setId(1L);
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "content".getBytes());
        
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(storageService.store(any(), anyString())).thenReturn("vehicles/random-uuid.jpg");

        // Act
        String result = vehicleService.saveVehicleImage(1L, file, "owner-id");

        // Assert
        assertEquals("/api/uploads/vehicles/random-uuid.jpg", result);
        assertEquals("/api/uploads/vehicles/random-uuid.jpg", vehicle.getImageUrl());
        verify(vehicleRepository, times(1)).save(vehicle);
    }

    @Test
    void saveVehicleImage_ShouldThrowException_WhenNotOwner() {
        // Arrange
        Vehicle vehicle = new Vehicle("B-123-ABC", "Dacia Logan", 2022, "12345678901234567", owner);
        vehicle.setId(1L);
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "content".getBytes());
        
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        // Act & Assert
        assertThrows(SecurityException.class, () -> 
                vehicleService.saveVehicleImage(1L, file, "other-user-id"));
        
        verify(vehicleRepository, never()).save(any());
    }
}
