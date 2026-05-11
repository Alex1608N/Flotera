package com.example.flotera.user.dto;

import com.example.flotera.user.Role;

public record UserDto(
        String id,
        String email,
        String name,
        Role role,
        String profilePictureUrl
) {}
