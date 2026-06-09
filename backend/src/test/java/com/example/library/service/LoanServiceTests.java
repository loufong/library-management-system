package com.example.library.service;

import com.example.library.dto.LoanRequest;
import com.example.library.exception.BadRequestException;
import com.example.library.model.Book;
import com.example.library.model.Loan;
import com.example.library.model.User;
import com.example.library.repository.BookRepository;
import com.example.library.repository.LoanRepository;
import com.example.library.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LoanServiceTests {

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LoanService loanService;

    private User user;
    private Book book;
    private LoanRequest loanRequest;

    @BeforeEach
    void setUp() {
        user = new User("member1", "password", "member1@library.com", "MEMBER");
        user.setId(1L);

        book = new Book("Clean Code", "Robert C. Martin", "9780132350884", "Prentice Hall", 2008, "Software Engineering", 1, 1);
        book.setId(1L);

        loanRequest = new LoanRequest();
        loanRequest.setBookId(1L);
        loanRequest.setUserId(1L);
    }

    @Test
    void borrowBook_Success() {
        when(bookRepository.findById(loanRequest.getBookId())).thenReturn(Optional.of(book));
        when(userRepository.findById(loanRequest.getUserId())).thenReturn(Optional.of(user));
        when(loanRepository.findByUserIdAndStatus(user.getId(), "BORROWED")).thenReturn(new ArrayList<>());
        
        Loan savedLoan = new Loan(book, user, LocalDate.now(), LocalDate.now().plusDays(14), "BORROWED");
        when(loanRepository.save(any(Loan.class))).thenReturn(savedLoan);

        Loan result = loanService.borrowBook(loanRequest);

        assertNotNull(result);
        assertEquals("BORROWED", result.getStatus());
        assertEquals(0, book.getAvailableCopies()); // Copy availability should decrement
        verify(bookRepository, times(1)).save(book);
        verify(loanRepository, times(1)).save(any(Loan.class));
    }

    @Test
    void borrowBook_NoCopiesAvailable_ThrowsBadRequestException() {
        book.setAvailableCopies(0); // Mark book unavailable
        when(bookRepository.findById(loanRequest.getBookId())).thenReturn(Optional.of(book));
        when(userRepository.findById(loanRequest.getUserId())).thenReturn(Optional.of(user));
        when(loanRepository.findByUserIdAndStatus(user.getId(), "BORROWED")).thenReturn(new ArrayList<>());

        assertThrows(BadRequestException.class, () -> loanService.borrowBook(loanRequest));
        verify(loanRepository, never()).save(any(Loan.class));
    }

    @Test
    void returnBook_Success() {
        Loan loan = new Loan(book, user, LocalDate.now().minusDays(5), LocalDate.now().plusDays(9), "BORROWED");
        loan.setId(1L);
        book.setAvailableCopies(0); // Decremented previously

        when(loanRepository.findById(1L)).thenReturn(Optional.of(loan));
        when(loanRepository.save(any(Loan.class))).thenReturn(loan);

        Loan result = loanService.returnBook(1L);

        assertNotNull(result);
        assertEquals("RETURNED", result.getStatus());
        assertNotNull(result.getReturnDate());
        assertEquals(1, book.getAvailableCopies()); // Copy availability should increment
        verify(bookRepository, times(1)).save(book);
        verify(loanRepository, times(1)).save(loan);
    }
}
