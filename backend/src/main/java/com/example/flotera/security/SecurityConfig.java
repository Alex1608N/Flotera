package com.example.flotera.security;

import com.example.flotera.user.UserRepository;
import com.example.flotera.user.User;
import com.example.flotera.user.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.security.oauth2.jwt.JwtException;

import javax.crypto.spec.SecretKeySpec;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${allowed.origins:http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174}")
    private String allowedOrigins;

    private final UserRepository userRepository;

    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/uploads/**", "/uploads/**").permitAll()
                    .requestMatchers("/h2-console/**", "/api/public/**").permitAll()
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/vehicles").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/vehicles").hasRole("OWNER")
                    .requestMatchers(HttpMethod.PUT, "/api/vehicles/*").hasRole("OWNER")
                    .requestMatchers(HttpMethod.DELETE, "/api/vehicles/*").hasRole("OWNER")
                    .requestMatchers(HttpMethod.POST, "/api/vehicles/*/image").hasRole("OWNER")
                    .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                ));

            return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
            CorsConfiguration configuration = new CorsConfiguration();
            
            // Permite orice origine
            configuration.setAllowedOriginPatterns(Collections.singletonList("*"));
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
            configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
            configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
            configuration.setAllowCredentials(true);
            
            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", configuration);
            return source;
        }

    @Bean
    public JwtDecoder jwtDecoder() {
        return token -> {
            try {
                // Fara validare semnatura local
                SignedJWT signedJWT = SignedJWT.parse(token);
                java.util.Map<String, Object> claims = new java.util.HashMap<>(signedJWT.getJWTClaimsSet().getClaims());
                
                // Instant conversion
                if (claims.get("iat") instanceof java.util.Date date) {
                    claims.put("iat", date.toInstant());
                }
                if (claims.get("exp") instanceof java.util.Date date) {
                    claims.put("exp", date.toInstant());
                }

                return Jwt.withTokenValue(token)
                        .header("alg", "HS256")
                        .claims(c -> c.putAll(claims))
                        .build();
            } catch (Exception e) {
                throw new JwtException("Token invalid: " + e.getMessage(), e);
            }
        };
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String userId = jwt.getSubject();
            String email = jwt.getClaimAsString("email");
            
            if (email == null) {
                email = "user_" + userId.substring(0, 5) + "@flotera.local";
            }

            // Sync user
            User user = userRepository.findById(userId).orElseGet(() -> {
                String actualEmail = jwt.getClaimAsString("email");
                
                // Extract name
                String fullName = "Utilizator Nou";
                java.util.Map<String, Object> metadata = jwt.getClaimAsMap("user_metadata");
                if (metadata != null && metadata.containsKey("full_name")) {
                    fullName = String.valueOf(metadata.get("full_name"));
                } else if (jwt.getClaimAsString("name") != null) {
                    fullName = jwt.getClaimAsString("name");
                }

                // Default: Driver
                Role defaultRole = Role.DRIVER;
                
                // Special case for admin
                if ("alex@flotera.ro".equalsIgnoreCase(actualEmail)) {
                    defaultRole = Role.OWNER;
                }
                
                User newUser = new User(userId, actualEmail != null ? actualEmail : "user@local", fullName, defaultRole);
                return userRepository.save(newUser);
            });

            return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        });
        return converter;
    }
}
