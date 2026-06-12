package com.example.library.service;

import com.example.library.dto.BookDto;
import com.example.library.exception.BadRequestException;
import com.example.library.exception.ResourceNotFoundException;
import com.example.library.model.Book;
import com.example.library.repository.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    }

    public List<Book> searchBooks(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllBooks();
        }
        return bookRepository.searchBooks(query.trim());
    }

    @Transactional
    public Book addBook(BookDto bookDto) {
        if (bookRepository.existsByIsbn(bookDto.getIsbn())) {
            throw new BadRequestException("Book with ISBN " + bookDto.getIsbn() + " already exists");
        }

        Book book = new Book(
                bookDto.getTitle(),
                bookDto.getAuthor(),
                bookDto.getIsbn(),
                bookDto.getPublisher(),
                bookDto.getPublishedYear(),
                bookDto.getGenre(),
                bookDto.getTotalCopies(),
                bookDto.getTotalCopies() // Initially, all copies are available
        );

        book.setFileUrl(bookDto.getFileUrl());
        book.setFileType(bookDto.getFileType());
        book.setFileContent(bookDto.getFileContent());

        return bookRepository.save(book);
    }

    @Transactional
    public Book updateBook(Long id, BookDto bookDto) {
        Book book = getBookById(id);

        if (!book.getIsbn().equals(bookDto.getIsbn()) && bookRepository.existsByIsbn(bookDto.getIsbn())) {
            throw new BadRequestException("Book with ISBN " + bookDto.getIsbn() + " already exists");
        }

        int borrowedCopies = book.getTotalCopies() - book.getAvailableCopies();
        if (bookDto.getTotalCopies() < borrowedCopies) {
            throw new BadRequestException("Cannot reduce total copies below currently borrowed copies (" + borrowedCopies + ")");
        }

        book.setTitle(bookDto.getTitle());
        book.setAuthor(bookDto.getAuthor());
        book.setIsbn(bookDto.getIsbn());
        book.setPublisher(bookDto.getPublisher());
        book.setPublishedYear(bookDto.getPublishedYear());
        book.setGenre(bookDto.getGenre());
        
        // Adjust available copies based on new total copies
        int diff = bookDto.getTotalCopies() - book.getTotalCopies();
        book.setTotalCopies(bookDto.getTotalCopies());
        book.setAvailableCopies(book.getAvailableCopies() + diff);

        book.setFileUrl(bookDto.getFileUrl());
        book.setFileType(bookDto.getFileType());
        book.setFileContent(bookDto.getFileContent());

        return bookRepository.save(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = getBookById(id);
        bookRepository.delete(book);
    }
}
