package com.example.library.controller;

import com.example.library.dto.BookDto;
import com.example.library.model.Book;
import com.example.library.model.User;
import com.example.library.service.BookService;
import com.example.library.service.UserService;
import com.example.library.repository.LoanRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final UserService userService;
    private final LoanRepository loanRepository;

    public BookController(BookService bookService, UserService userService, LoanRepository loanRepository) {
        this.bookService = bookService;
        this.userService = userService;
        this.loanRepository = loanRepository;
    }

    @GetMapping
    public ResponseEntity<List<Book>> getBooks(@RequestParam(value = "search", required = false) String search) {
        List<Book> books;
        if (search != null) {
            books = bookService.searchBooks(search);
        } else {
            books = bookService.getAllBooks();
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            User currentUser = userService.getUserByUsername(auth.getName());
            if ("MEMBER".equals(currentUser.getRole())) {
                Set<Long> borrowedBookIds = loanRepository.findByUserId(currentUser.getId()).stream()
                        .filter(loan -> !"RETURNED".equals(loan.getStatus()))
                        .map(loan -> loan.getBook().getId())
                        .collect(Collectors.toSet());

                books = books.stream()
                        .map(book -> sanitizeBook(book, !borrowedBookIds.contains(book.getId())))
                        .collect(Collectors.toList());
            }
        }

        return ResponseEntity.ok(books);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Book book = bookService.getBookById(id);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            User currentUser = userService.getUserByUsername(auth.getName());
            if ("MEMBER".equals(currentUser.getRole())) {
                boolean hasBorrowed = loanRepository.findByUserId(currentUser.getId()).stream()
                        .anyMatch(loan -> !"RETURNED".equals(loan.getStatus()) && loan.getBook().getId().equals(id));

                book = sanitizeBook(book, !hasBorrowed);
            }
        }

        return ResponseEntity.ok(book);
    }

    @PostMapping
    public ResponseEntity<Book> addBook(@Valid @RequestBody BookDto bookDto) {
        return ResponseEntity.ok(bookService.addBook(bookDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @Valid @RequestBody BookDto bookDto) {
        return ResponseEntity.ok(bookService.updateBook(id, bookDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().body("Book deleted successfully");
    }

    private Book sanitizeBook(Book book, boolean hideDigital) {
        if (!hideDigital) {
            return book;
        }
        Book clean = new Book(
                book.getTitle(),
                book.getAuthor(),
                book.getIsbn(),
                book.getPublisher(),
                book.getPublishedYear(),
                book.getGenre(),
                book.getTotalCopies(),
                book.getAvailableCopies()
        );
        clean.setId(book.getId());
        clean.setFileType(book.getFileType());
        clean.setFileUrl(null);
        clean.setFileContent(null);
        return clean;
    }
}
