package com.example.flotera.notification;
import org.springframework.mail.javamail.JavaMailSender;                                                                                
import org.springframework.stereotype.Service; 
import org.springframework.mail.SimpleMailMessage;  
 @Service
public class EmailService {
    private final JavaMailSender mailsender;

    public EmailService(JavaMailSender mailsender) {
        this.mailsender = mailsender;
    }
    
    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("noreply@flotera.com");
        mailsender.send(message);
    }
}
