package com.example.library.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {}) // CORS configured via WebConfig or corsConfigurationSource
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                .requestMatchers("/actuator/**").permitAll() // Prometheus metrics endpoint
                
                // Books authorization
                .requestMatchers(HttpMethod.GET, "/api/books/**").hasAnyRole("ADMIN", "LIBRARIAN", "MEMBER")
                .requestMatchers("/api/books/**").hasAnyRole("ADMIN", "LIBRARIAN")
                
                // Members authorization
                .requestMatchers("/api/members/**").hasAnyRole("ADMIN", "LIBRARIAN")
                
                // Loans authorization
                .requestMatchers(HttpMethod.POST, "/api/loans/borrow").hasAnyRole("ADMIN", "LIBRARIAN", "MEMBER")
                .requestMatchers(HttpMethod.POST, "/api/loans/return/*").hasAnyRole("ADMIN", "LIBRARIAN", "MEMBER")
                .requestMatchers("/api/loans/my-loans").hasAnyRole("ADMIN", "LIBRARIAN", "MEMBER")
                .requestMatchers("/api/loans/**").hasAnyRole("ADMIN", "LIBRARIAN")
                
                // Any other request must be authenticated
                .anyRequest().authenticated()
            );

        // Add JWT token filter
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
