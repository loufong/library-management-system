package com.example.library.service;

import com.example.library.dto.LoanRequest;
import com.example.library.exception.BadRequestException;
import com.example.library.exception.ResourceNotFoundException;
import com.example.library.model.Book;
import com.example.library.model.Loan;
import com.example.library.model.User;
import com.example.library.repository.BookRepository;
import com.example.library.repository.LoanRepository;
import com.example.library.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public LoanService(LoanRepository loanRepository, BookRepository bookRepository, UserRepository userRepository) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    public List<Loan> getAllLoans() {
        // Dynamically verify due dates and mark overdue before returning
        List<Loan> loans = loanRepository.findAll();
        checkAndMarkOverdue(loans);
        return loans;
    }

    public List<Loan> getLoansByUserId(Long userId) {
        List<Loan> loans = loanRepository.findByUserId(userId);
        checkAndMarkOverdue(loans);
        return loans;
    }

    public Loan getLoanById(Long id) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + id));
        if ("BORROWED".equals(loan.getStatus()) && LocalDate.now().isAfter(loan.getDueDate())) {
            loan.setStatus("OVERDUE");
            loanRepository.save(loan);
        }
        return loan;
    }

    @Transactional
    public Loan borrowBook(LoanRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        // Check if user has any active loans (not returned yet)
        List<Loan> userLoans = loanRepository.findByUserId(user.getId());
        for (Loan l : userLoans) {
            if (!"RETURNED".equals(l.getStatus())) {
                throw new BadRequestException("You must return your currently borrowed book before borrowing a new one");
            }
        }

        // Check availability
        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("No copies of this book are currently available");
        }

        // Create Loan (default loan period is 14 days)
        LocalDate borrowDate = LocalDate.now();
        LocalDate dueDate = borrowDate.plusDays(14);
        Loan loan = new Loan(book, user, borrowDate, dueDate, "BORROWED");

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        return loanRepository.save(loan);
    }

    @Transactional
    public Loan returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));

        if ("RETURNED".equals(loan.getStatus())) {
            throw new BadRequestException("This book has already been returned");
        }

        // Increment available copies
        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        // Update loan status
        loan.setReturnDate(LocalDate.now());
        loan.setStatus("RETURNED");

        return loanRepository.save(loan);
    }

    private void checkAndMarkOverdue(List<Loan> loans) {
        LocalDate today = LocalDate.now();
        for (Loan loan : loans) {
            if ("BORROWED".equals(loan.getStatus()) && today.isAfter(loan.getDueDate())) {
                loan.setStatus("OVERDUE");
                loanRepository.save(loan);
            }
        }
    }
}
