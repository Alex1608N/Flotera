package com.example.flotera.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    // Logica generata automat
    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);
}
