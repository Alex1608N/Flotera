package com.example.flotera.notification;

import com.example.flotera.user.User;
import com.example.flotera.user.UserRepository;
import com.example.flotera.vehicle.Vehicle;
import com.example.flotera.vehicle.VehicleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, 
                               VehicleRepository vehicleRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notificarea nu există."));
        
        if (notification.getUser().getId().equals(user.getId())) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().filter(n -> !n.isRead()).toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void createNotification(User user, String title, String message, NotificationType type) {
        Notification notification = new Notification(user, title, message, type);
        notificationRepository.save(notification);
    }

    /**
     * Rulează zilnic la ora 01:00 pentru a verifica expirările documentelor.
     */
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void checkExpirations() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        LocalDate now = LocalDate.now();
        LocalDate warningThreshold = now.plusDays(30);

        for (Vehicle v : vehicles) {
            // Găsim proprietarul pentru a-i trimite notificarea
            // Într-o aplicație reală, am putea trimite și șoferului asignat
            userRepository.findByRole(com.example.flotera.user.Role.OWNER).forEach(owner -> {
                checkAndNotify(v, owner, v.getItpExpiration(), "ITP", now, warningThreshold);
                checkAndNotify(v, owner, v.getRcaExpiration(), "RCA", now, warningThreshold);
                checkAndNotify(v, owner, v.getRovinietaExpiration(), "Rovinieta", now, warningThreshold);
            });
        }
    }

    private void checkAndNotify(Vehicle v, User user, LocalDate expiration, String docType, LocalDate now, LocalDate threshold) {
        if (expiration == null) return;

        if (expiration.isBefore(now) || expiration.isEqual(now)) {
            String title = "DOCUMENT EXPIRAT: " + docType;
            String msg = "Documentul " + docType + " pentru vehiculul " + v.getLicensePlate() + " a expirat!";
            createIfNotExists(user, title, msg, NotificationType.CRITICAL);
        } else if (expiration.isBefore(threshold)) {
            String title = "Atenție: Expiră " + docType;
            String msg = "Documentul " + docType + " pentru vehiculul " + v.getLicensePlate() + " expiră în curând (" + expiration + ").";
            createIfNotExists(user, title, msg, NotificationType.WARNING);
        }
    }

    private void createIfNotExists(User user, String title, String message, NotificationType type) {
        // Evităm duplicatele pentru aceeași zi/mesaj
        List<Notification> existing = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        boolean alreadyNotified = existing.stream()
                .anyMatch(n -> n.getTitle().equals(title) && n.getCreatedAt().toLocalDate().equals(LocalDate.now()));
        
        if (!alreadyNotified) {
            createNotification(user, title, message, type);
        }
    }
}
