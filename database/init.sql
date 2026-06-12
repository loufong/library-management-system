-- Create database if not exists
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Drop tables in reverse order of dependency
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

-- Create Users table (Admins, Librarians, Members)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Create Books table
CREATE TABLE books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    publisher VARCHAR(100),
    published_year INT,
    genre VARCHAR(50),
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    file_url VARCHAR(500),
    file_type VARCHAR(50) DEFAULT 'NONE',
    file_content LONGTEXT
) ENGINE=InnoDB;

-- Create Loans table
CREATE TABLE loans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed Initial Data
-- BCrypt password hashes are for password: 'password'
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2a$10$vNIPD893bLNDW5M5hLw1gebCg.pQG0sB44a3K8J/rN9kM.H2p9pBO', 'admin@library.com', 'ADMIN'),
('librarian', '$2a$10$vNIPD893bLNDW5M5hLw1gebCg.pQG0sB44a3K8J/rN9kM.H2p9pBO', 'librarian@library.com', 'LIBRARIAN'),
('member1', '$2a$10$vNIPD893bLNDW5M5hLw1gebCg.pQG0sB44a3K8J/rN9kM.H2p9pBO', 'member1@library.com', 'MEMBER'),
('member2', '$2a$10$vNIPD893bLNDW5M5hLw1gebCg.pQG0sB44a3K8J/rN9kM.H2p9pBO', 'member2@library.com', 'MEMBER');

INSERT INTO books (title, author, isbn, publisher, published_year, genre, total_copies, available_copies) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Scribner', 1925, 'Classic Fiction', 5, 5),
('To Kill a Mockingbird', 'Harper Lee', '9780446310789', 'J. B. Lippincott & Co.', 1960, 'Classic Fiction', 3, 3),
('1984', 'George Orwell', '9780451524935', 'Signet Classic', 1949, 'Dystopian', 4, 3),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769488', 'Little, Brown', 1951, 'Fiction', 2, 2);

-- Insert one active loan (member1 borrowed 1984, due date is 14 days from 2026-06-01)
INSERT INTO loans (book_id, user_id, borrow_date, due_date, return_date, status) VALUES
(3, 3, '2026-06-01', '2026-06-15', NULL, 'BORROWED');

-- Update available copies for book with ID 3 (1984)
UPDATE books SET available_copies = 3 WHERE id = 3;
