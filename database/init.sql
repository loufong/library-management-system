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

INSERT INTO books (title, author, isbn, publisher, published_year, genre, total_copies, available_copies, file_url, file_type, file_content) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Scribner', 1925, 'Classic Fiction', 5, 5, '', 'NONE', ''),
('To Kill a Mockingbird', 'Harper Lee', '9780446310789', 'J. B. Lippincott & Co.', 1960, 'Classic Fiction', 3, 3, '', 'NONE', ''),
('1984', 'George Orwell', '9780451524935', 'Signet Classic', 1949, 'Dystopian', 4, 3, '', 'NONE', ''),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769488', 'Little, Brown', 1951, 'Fiction', 2, 2, '', 'NONE', ''),
('Clean Code', 'Robert C. Martin', '9780132350884', 'Prentice Hall', 2008, 'Technology', 5, 5, '', 'TEXT', 'Clean Code: Preface\n\nClean code is code that has been written by someone who cares. It is elegant, simple, and direct. In this book, we will explore methods for styling, structuring, and writing clean, maintainable software.\n\n---PAGE---\nClean Code: Chapter 1 - Meaningful Names\n\nUse intention-revealing names. The name of a variable, function, or class should answer all the big questions. It should tell you why it exists, what it does, and how it is used. If a name requires a comment, then the name does not reveal its intent.\n\n---PAGE---\nClean Code: Chapter 2 - Functions\n\nThe first rule of functions is that they should be small. The second rule of functions is that they should be smaller than that. Functions should do one thing. They should do it well. They should do it only.'),
('The Hobbit', 'J.R.R. Tolkien', '9780007487289', 'George Allen & Unwin', 1937, 'Fantasy', 3, 3, '', 'TEXT', 'The Hobbit: Chapter 1 - An Unexpected Party\n\nIn a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.\n\n---PAGE---\nThe Hobbit: An Unexpected Party (Cont.)\n\nThe door opened on to a tube-shaped hall like a tunnel: a very comfortable tunnel without smoke, with panelled walls, and floors tiled and carpeted, provided with polished chairs, and lots and lots of pegs for hats and coats - the hobbit was fond of visitors.\n\n---PAGE---\nThe Hobbit: Chapter 2 - Roast Mutton\n\nBilbo Baggins was standing in the doorway after breakfast, feeling very happy and comfortable. Suddenly Gandalf came by, Gandalf! If you had only heard a quarter of what I have heard about him, you would be prepared for any sort of remarkable story.'),
('Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'MIT Press', 2009, 'Education', 2, 2, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'PDF', ''),
('Design Patterns', 'Erich Gamma', '9780201633610', 'Addison-Wesley', 1994, 'Technology', 4, 4, '', 'TEXT', 'Design Patterns: Introduction\n\nDesign patterns are typical solutions to common problems in software design. Each pattern is like a blueprint that you can customize to solve a particular design problem in your code.\n\n---PAGE---\nDesign Patterns: Creational - Singleton Pattern\n\nSingleton is a creational design pattern that lets you ensure that a class has only one instance, while providing a global access point to this instance. It is useful for sharing database connections or configuration managers.\n\n---PAGE---\nDesign Patterns: Behavioral - Observer Pattern\n\nObserver is a behavioral design pattern that lets you define a subscription mechanism to notify multiple objects about any events that happen to the object they are observing.'),
('The Pragmatic Programmer', 'Andrew Hunt', '9780135957059', 'Addison-Wesley', 1999, 'Technology', 3, 3, '', 'TEXT', 'The Pragmatic Programmer: Chapter 1 - Pragmatic Philosophy\n\nProvide options, don''t make lame excuses. Don''t say it can''t be done; explain what can be done to salvage the situation. Be a catalyst for change. Participate in your project''s architecture and design.\n\n---PAGE---\nThe Pragmatic Programmer: Chapter 2 - A Pragmatic Approach\n\nGood design is easier to change than bad design. Keep your code Orthogonal. Orthogonality means that changes in one part of the system do not affect others. Avoid duplication: DRY (Don''t Repeat Yourself).'),
('Frankenstein', 'Mary Shelley', '9780141439471', 'Penguin Classics', 1818, 'Classic Fiction', 4, 4, '', 'TEXT', 'Frankenstein: Chapter 1\n\nI am by birth a Genevese, and my family is one of the most distinguished of that republic. My ancestors had been for many years counsellors and syndics, and my father had filled several public situations with honour and reputation.\n\n---PAGE---\nFrankenstein: Chapter 2\n\nWe witnessed a most violent and terrible thunderstorm. It advanced from behind the mountains of Jura, and the thunder burst at once with frightful loudness from various quarters of the heaven. I remained watching its progress with curiosity and delight.');

-- Insert one active loan (member1 borrowed 1984, due date is 14 days from 2026-06-01)
INSERT INTO loans (book_id, user_id, borrow_date, due_date, return_date, status) VALUES
(3, 3, '2026-06-01', '2026-06-15', NULL, 'BORROWED');

-- Update available copies for book with ID 3 (1984)
UPDATE books SET available_copies = 3 WHERE id = 3;
