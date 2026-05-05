package com.example.flotera.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    // Spring Data JPA va genera automat logica pentru această metodă!
    Optional<User> findByEmail(String email);
}
