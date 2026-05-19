package com.example.flotera.user;

import com.example.flotera.storage.StorageService;
import com.example.flotera.user.dto.UserDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final StorageService storageService;

    public UserController(UserRepository userRepository, StorageService storageService) {
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));
        
        return ResponseEntity.ok(toDto(user));
    }

    @PostMapping("/me/profile-picture/upload")
    public ResponseEntity<UserDto> uploadMyProfilePicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));

        String imageUrl = storageService.store(file, "avatars");
        user.setProfilePictureUrl(imageUrl);
        userRepository.save(user);

        return ResponseEntity.ok(toDto(user));
    }

    @PutMapping("/me/profile-picture")
    public ResponseEntity<UserDto> updateProfilePicture(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));
        
        user.setProfilePictureUrl(request.get("profilePictureUrl"));
        userRepository.save(user);
        
        return ResponseEntity.ok(toDto(user));
    }

    @PutMapping("/me/name")
    public ResponseEntity<UserDto> updateName(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));
        
        String newName = request.get("name");
        if (newName != null && !newName.trim().isEmpty()) {
            user.setName(newName);
            userRepository.save(user);
        }
        
        return ResponseEntity.ok(toDto(user));
    }

    @PostMapping("/me/toggle-role")
    public ResponseEntity<UserDto> toggleRole(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));
        
        // Simulation for admin
        if (!"alex@flotera.ro".equalsIgnoreCase(user.getEmail())) {
            throw new SecurityException("Nu aveți permisiunea de a folosi funcția de simulare rol.");
        }
        
        if (user.getRole() == Role.OWNER) {
            user.setRole(Role.DRIVER);
        } else {
            user.setRole(Role.OWNER);
        }
        userRepository.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    @PostMapping("/{targetUserId}/profile-picture/upload")
    public ResponseEntity<UserDto> uploadOtherUserProfilePicture(
            @PathVariable String targetUserId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String requesterId = jwt.getSubject();
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));

        if (requester.getRole() != Role.OWNER) {
            throw new SecurityException("Doar proprietarii pot încărca profilele altor utilizatori.");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul țintă nu a fost găsit."));

        String imageUrl = storageService.store(file, "avatars");
        targetUser.setProfilePictureUrl(imageUrl);
        userRepository.save(targetUser);

        return ResponseEntity.ok(toDto(targetUser));
    }

    @PutMapping("/{targetUserId}/profile-picture")
    public ResponseEntity<UserDto> updateOtherUserProfilePicture(
            @PathVariable String targetUserId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String requesterId = jwt.getSubject();
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));

        if (requester.getRole() != Role.OWNER) {
            throw new SecurityException("Doar proprietarii pot modifica profilele altor utilizatori.");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul țintă nu a fost găsit."));

        targetUser.setProfilePictureUrl(request.get("profilePictureUrl"));
        userRepository.save(targetUser);

        return ResponseEntity.ok(toDto(targetUser));
    }

    @PutMapping("/{targetUserId}/role")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable String targetUserId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String requesterId = jwt.getSubject();
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));

        // Admin only role change
        if (!"alex@flotera.ro".equalsIgnoreCase(requester.getEmail())) {
            throw new SecurityException("Nu aveți permisiunea de a schimba rolurile altor utilizatori.");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul țintă nu a fost găsit."));

        String newRoleStr = request.get("role");
        if (newRoleStr != null) {
            targetUser.setRole(Role.valueOf(newRoleStr.toUpperCase()));
            userRepository.save(targetUser);
        }

        return ResponseEntity.ok(toDto(targetUser));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(@AuthenticationPrincipal Jwt jwt) {
        String requesterId = jwt.getSubject();
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));

        if (requester.getRole() != Role.OWNER) {
            throw new SecurityException("Doar proprietarii pot vedea lista completă de utilizatori.");
        }

        List<User> users = userRepository.findAll();
        List<UserDto> dtos = users.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<UserDto>> getAllDrivers(@AuthenticationPrincipal Jwt jwt) {
        // TODO: filter by org
        List<User> drivers = userRepository.findByRole(Role.DRIVER);
        
        List<UserDto> dtos = drivers.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    private UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getProfilePictureUrl()
        );
    }
}
