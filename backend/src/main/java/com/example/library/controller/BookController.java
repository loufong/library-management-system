package com.example.library.controller;

import com.example.library.dto.BookDto;
import com.example.library.model.Book;
import com.example.library.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public ResponseEntity<List<Book>> getBooks(@RequestParam(value = "search", required = false) String search) {
        if (search != null) {
            return ResponseEntity.ok(bookService.searchBooks(search));
        }
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
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
}
