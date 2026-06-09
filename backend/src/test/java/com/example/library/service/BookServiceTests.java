package com.example.library.service;

import com.example.library.dto.BookDto;
import com.example.library.exception.BadRequestException;
import com.example.library.model.Book;
import com.example.library.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookServiceTests {

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookService bookService;

    private BookDto bookDto;
    private Book book;

    @BeforeEach
    void setUp() {
        bookDto = new BookDto();
        bookDto.setTitle("Clean Code");
        bookDto.setAuthor("Robert C. Martin");
        bookDto.setIsbn("9780132350884");
        bookDto.setPublisher("Prentice Hall");
        bookDto.setPublishedYear(2008);
        bookDto.setGenre("Software Engineering");
        bookDto.setTotalCopies(3);

        book = new Book("Clean Code", "Robert C. Martin", "9780132350884", "Prentice Hall", 2008, "Software Engineering", 3, 3);
        book.setId(1L);
    }

    @Test
    void addBook_Success() {
        when(bookRepository.existsByIsbn(bookDto.getIsbn())).thenReturn(false);
        when(bookRepository.save(any(Book.class))).thenReturn(book);

        Book result = bookService.addBook(bookDto);

        assertNotNull(result);
        assertEquals("Clean Code", result.getTitle());
        assertEquals("9780132350884", result.getIsbn());
        verify(bookRepository, times(1)).save(any(Book.class));
    }

    @Test
    void addBook_DuplicateIsbn_ThrowsBadRequestException() {
        when(bookRepository.existsByIsbn(bookDto.getIsbn())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> bookService.addBook(bookDto));
        verify(bookRepository, never()).save(any(Book.class));
    }

    @Test
    void getBookById_NotFound_ThrowsResourceNotFoundException() {
        when(bookRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> bookService.getBookById(1L));
    }
}
