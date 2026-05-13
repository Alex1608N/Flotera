package com.example.flotera.user;

import com.example.flotera.user.dto.UserDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));
        
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

    @GetMapping("/drivers")
    public ResponseEntity<List<UserDto>> getAllDrivers(@AuthenticationPrincipal Jwt jwt) {
        // În viitor se poate filtra și după un organizationId
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
