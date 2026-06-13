package com.example.library.controller;

import com.example.library.config.JwtTokenUtil;
import com.example.library.dto.LoginRequest;
import com.example.library.dto.LoginResponse;
import com.example.library.dto.RegisterRequest;
import com.example.library.model.User;
import com.example.library.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthController(AuthenticationManager authenticationManager, UserService userService, JwtTokenUtil jwtTokenUtil) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        registerRequest.setRole("MEMBER");
        User registeredUser = userService.registerUser(registerRequest);
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        final UserDetails userDetails = userService.loadUserByUsername(loginRequest.getUsername());
        final User user = userService.getUserByUsername(loginRequest.getUsername());
        
        final String token = jwtTokenUtil.generateToken(userDetails, user.getEmail(), user.getRole());

        return ResponseEntity.ok(new LoginResponse(
                token,
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        ));
    }
}
