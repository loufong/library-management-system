package com.example.library.controller;

import com.example.library.dto.RegisterRequest;
import com.example.library.model.User;
import com.example.library.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName());

        if ("LIBRARIAN".equals(currentUser.getRole())) {
            if (!"MEMBER".equalsIgnoreCase(registerRequest.getRole())) {
                return ResponseEntity.status(403).build();
            }
        } else if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(userService.registerUser(registerRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateMember(@PathVariable Long id, @Valid @RequestBody RegisterRequest registerRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName());

        User userToBeUpdated = userService.getUserById(id);

        if ("LIBRARIAN".equals(currentUser.getRole())) {
            if (!"MEMBER".equals(userToBeUpdated.getRole()) || !"MEMBER".equalsIgnoreCase(registerRequest.getRole())) {
                return ResponseEntity.status(403).build();
            }
        } else if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(userService.updateUser(id, registerRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName());

        User userToBeDeleted = userService.getUserById(id);

        if ("LIBRARIAN".equals(currentUser.getRole())) {
            if (!"MEMBER".equals(userToBeDeleted.getRole())) {
                return ResponseEntity.status(403).build();
            }
        } else if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).build();
        }

        userService.deleteUser(id);
        return ResponseEntity.ok().body("Member deleted successfully");
    }
}
