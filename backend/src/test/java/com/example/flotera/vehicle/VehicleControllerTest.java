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

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
    private ExpirationEngineService expirationEngineService;

    @MockitoBean
    private com.example.flotera.incident.IncidentRepository incidentRepository;

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
        Vehicle vehicle = new Vehicle("B-123-ABC", "Logan", "Dacia", 2022, "12345678901234567", owner);
        vehicle.setId(1L);
        vehicle.setColor("ALB");

        VehicleRequest request = new VehicleRequest("B-123-ABC", "Logan", "Dacia", "ALB", "BENZINA", 2022, "12345678901234567", null, null, null, null, null, null, null, null);

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
    void getAllVehicles_ShouldReturnList() throws Exception {
        // Arrange
        String ownerId = "owner-id";
        User owner = new User(ownerId, "owner@test.com", "Owner Name", Role.OWNER);
        Vehicle vehicle = new Vehicle("B-123-ABC", "Logan", "Dacia", 2022, "12345678901234567", owner);
        vehicle.setId(1L);
        vehicle.setColor("ALB");

        when(userRepository.findById(ownerId)).thenReturn(Optional.of(owner));
        when(vehicleService.getVehiclesForUser(any(User.class))).thenReturn(List.of(vehicle));

        // Act & Assert
        mockMvc.perform(get("/api/vehicles")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_OWNER")).jwt(j -> j.subject(ownerId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].licensePlate").value("B-123-ABC"));
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
        VehicleRequest request = new VehicleRequest("B-123-ABC", "Logan", "Dacia", "ALB", "BENZINA", 2022, "12345678901234567", null, null, null, null, null, null, null, null);

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
        VehicleRequest invalidRequest = new VehicleRequest("", "", "", "", "", 1800, "too-short", null, null, null, null, null, null, null, null);

        // Act & Assert
        mockMvc.perform(post("/api/vehicles")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_OWNER")).jwt(j -> j.subject("any-id")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateVehicle_ShouldReturnOk_WhenUserIsOwner() throws Exception {
        // Arrange
        String ownerId = "owner-id";
        User owner = new User(ownerId, "owner@test.com", "Owner Name", Role.OWNER);
        Vehicle vehicle = new Vehicle("B-123-ABC", "Logan", "Dacia", 2022, "12345678901234567", owner);
        vehicle.setId(1L);
        vehicle.setColor("ALB");

        VehicleRequest request = new VehicleRequest("B-999-XYZ", "Logan", "Dacia", "ALB", "BENZINA", 2022, "12345678901234567", null, null, null, null, null, null, null, null);

        when(userRepository.findById(ownerId)).thenReturn(Optional.of(owner));
        when(vehicleService.updateVehicle(eq(1L), any(VehicleRequest.class), eq(ownerId))).thenReturn(vehicle);

        // Act & Assert
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/vehicles/1")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_OWNER")).jwt(j -> j.subject(ownerId)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void deleteVehicle_ShouldReturnNoContent_WhenUserIsOwner() throws Exception {
        // Arrange
        String ownerId = "owner-id";
        User owner = new User(ownerId, "owner@test.com", "Owner Name", Role.OWNER);

        when(userRepository.findById(ownerId)).thenReturn(Optional.of(owner));

        // Act & Assert
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/vehicles/1")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_OWNER")).jwt(j -> j.subject(ownerId))))
                .andExpect(status().isNoContent());
    }

    @Test
    void updateVehicleDocuments_ShouldReturnOk_WhenUserIsOwner() throws Exception {
        // Arrange
        String ownerId = "owner-id";
        User owner = new User(ownerId, "owner@test.com", "Owner Name", Role.OWNER);
        Vehicle vehicle = new Vehicle("B-123-ABC", "Logan", "Dacia", 2022, "12345678901234567", owner);
        vehicle.setId(1L);
        vehicle.setColor("ALB");

        java.time.LocalDate itp = java.time.LocalDate.now().plusDays(30);
        com.example.flotera.vehicle.dto.DocumentRequest request = new com.example.flotera.vehicle.dto.DocumentRequest(itp, itp, itp);

        when(userRepository.findById(ownerId)).thenReturn(Optional.of(owner));
        when(vehicleService.updateVehicleDocuments(eq(1L), any(com.example.flotera.vehicle.dto.DocumentRequest.class), eq(ownerId))).thenReturn(vehicle);

        // Act & Assert
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/vehicles/1/documents")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_OWNER")).jwt(j -> j.subject(ownerId)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
