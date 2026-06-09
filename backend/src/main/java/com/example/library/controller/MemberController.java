package com.example.library.controller;

import com.example.library.dto.RegisterRequest;
import com.example.library.model.User;
import com.example.library.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final UserService userService;

    public MemberController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllMembers(@RequestParam(value = "role", required = false) String role) {
        if (role != null) {
            return ResponseEntity.ok(userService.getUsersByRole(role));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getMemberById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<User> createMember(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(userService.registerUser(registerRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateMember(@PathVariable Long id, @Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(userService.updateUser(id, registerRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().body("Member deleted successfully");
    }
}
