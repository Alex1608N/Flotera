package com.example.flotera.vehicle;

import com.example.flotera.security.SecurityConfig;
import com.example.flotera.user.Role;
import com.example.flotera.user.User;
import com.example.flotera.user.UserRepository;
import com.example.flotera.vehicle.dto.VehicleRequest;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.mock.web.MockMultipartFile;

@WebMvcTest(VehicleController.class)
@Import(SecurityConfig.class)
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private VehicleService vehicleService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private com.example.flotera.storage.StorageService storageService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createVehicle_ShouldReturnCreated_WhenUserIsOwner() throws Exception {
        // Arrange
        String ownerId = "owner-id";
        User owner = new User(ownerId, "owner@test.com", "Owner Name", Role.OWNER);
        Vehicle vehicle = new Vehicle("B-123-ABC", "Dacia Logan", 2022, "12345678901234567", owner);
        vehicle.setId(1L);

        VehicleRequest request = new VehicleRequest("B-123-ABC", "Dacia Logan", 2022, "12345678901234567");

        // Mock security: load user from DB during JWT conversion
        when(userRepository.findById(ownerId)).thenReturn(Optional.of(owner));
        when(vehicleService.createVehicle(any(VehicleRequest.class), eq(ownerId))).thenReturn(vehicle);

        // Act & Assert
        mockMvc.perform(post("/api/vehicles")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_OWNER")).jwt(j -> j.subject(ownerId)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.licensePlate").value("B-123-ABC"));
    }

    @Test
    void uploadImage_ShouldReturnOk_WhenUserIsOwner() throws Exception {
        // Arrange
        String ownerId = "owner-id";
        User owner = new User(ownerId, "owner@test.com", "Owner Name", Role.OWNER);
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "content".getBytes());

        when(userRepository.findById(ownerId)).thenReturn(Optional.of(owner));
        when(vehicleService.saveVehicleImage(eq(1L), any(), eq(ownerId)))
                .thenReturn("/api/uploads/vehicles/test.jpg");

        // Act & Assert
        mockMvc.perform(multipart("/api/vehicles/1/image")
                .file(file)
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_OWNER")).jwt(j -> j.subject(ownerId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value("/api/uploads/vehicles/test.jpg"));
    }

    @Test
    void createVehicle_ShouldReturnForbidden_WhenUserIsDriver() throws Exception {

        // Arrange
        String driverId = "driver-id";
        User driver = new User(driverId, "driver@test.com", "Driver Name", Role.DRIVER);
        VehicleRequest request = new VehicleRequest("B-123-ABC", "Dacia Logan", 2022, "12345678901234567");

        when(userRepository.findById(driverId)).thenReturn(Optional.of(driver));

        // Act & Assert
        mockMvc.perform(post("/api/vehicles")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_DRIVER")).jwt(j -> j.subject(driverId)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createVehicle_ShouldReturnBadRequest_WhenValidationFails() throws Exception {
        // Arrange
        VehicleRequest invalidRequest = new VehicleRequest("", "", 1800, "too-short");

        // Act & Assert
        mockMvc.perform(post("/api/vehicles")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_OWNER")).jwt(j -> j.subject("any-id")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}
