package com.example.library.controller;

import com.example.library.dto.LoanRequest;
import com.example.library.dto.LoanResponse;
import com.example.library.model.Loan;
import com.example.library.model.User;
import com.example.library.service.LoanService;
import com.example.library.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;
    private final UserService userService;

    public LoanController(LoanService loanService, UserService userService) {
        this.loanService = loanService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<LoanResponse>> getAllLoans() {
        List<LoanResponse> response = loanService.getAllLoans().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> getLoanById(@PathVariable Long id) {
        return ResponseEntity.ok(convertToResponse(loanService.getLoanById(id)));
    }

    @GetMapping("/my-loans")
    public ResponseEntity<List<LoanResponse>> getMyLoans() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName());
        
        List<LoanResponse> response = loanService.getLoansByUserId(currentUser.getId()).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/borrow")
    public ResponseEntity<LoanResponse> borrowBook(@Valid @RequestBody LoanRequest request) {
        // Double check permissions: members can only borrow books for themselves
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName());
        
        if ("MEMBER".equals(currentUser.getRole()) && !currentUser.getId().equals(request.getUserId())) {
            return ResponseEntity.status(403).build(); // Members cannot borrow for other users
        }

        Loan loan = loanService.borrowBook(request);
        return ResponseEntity.ok(convertToResponse(loan));
    }

    @PostMapping("/return/{loanId}")
    public ResponseEntity<LoanResponse> returnBook(@PathVariable Long loanId) {
        // Check permission: members can only return their own loans
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(auth.getName());
        Loan loan = loanService.getLoanById(loanId);

        if ("MEMBER".equals(currentUser.getRole()) && !loan.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build();
        }

        Loan returnedLoan = loanService.returnBook(loanId);
        return ResponseEntity.ok(convertToResponse(returnedLoan));
    }

    private LoanResponse convertToResponse(Loan loan) {
        return new LoanResponse(
                loan.getId(),
                loan.getBook().getId(),
                loan.getBook().getTitle(),
                loan.getBook().getIsbn(),
                loan.getUser().getId(),
                loan.getUser().getUsername(),
                loan.getBorrowDate(),
                loan.getDueDate(),
                loan.getReturnDate(),
                loan.getStatus()
        );
    }
}
