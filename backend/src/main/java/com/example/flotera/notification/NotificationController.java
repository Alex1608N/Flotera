package com.example.flotera.notification;

import com.example.flotera.user.User;
import com.example.flotera.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal Jwt jwt) {
        User user = getUser(jwt);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal Jwt jwt) {
        User user = getUser(jwt);
        return ResponseEntity.ok(notificationService.getUnreadCount(user));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        User user = getUser(jwt);
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        User user = getUser(jwt);
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/test-scan")
    public ResponseEntity<String> triggerScan(@AuthenticationPrincipal Jwt jwt) {
        notificationService.checkExpirations();
        return ResponseEntity.ok("Scanare manuală declanșată!");
    }

    private User getUser(Jwt jwt) {
        return userRepository.findById(jwt.getSubject())
                .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu a fost găsit."));
    }
}
