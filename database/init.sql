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
    file_content LONGTEXT,
    cover_url VARCHAR(500),
    description VARCHAR(1000)
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

INSERT INTO books (title, author, isbn, publisher, published_year, genre, total_copies, available_copies, file_url, file_type, file_content, cover_url, description) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Scribner', 1925, 'Classic Fiction', 5, 5, '', 'NONE', '', 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg', 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former love, Daisy Buchanan.'),
('To Kill a Mockingbird', 'Harper Lee', '9780446310789', 'J. B. Lippincott & Co.', 1960, 'Classic Fiction', 3, 3, '', 'NONE', '', 'https://covers.openlibrary.org/b/isbn/9780446310789-L.jpg', 'Harper Lee\'s Pulitzer Prize-winning masterwork of honor and injustice in the deep South—and the heroism of one man in the face of blind and violent hatred. An American classic that has been translated into more than forty languages.'),
('1984', 'George Orwell', '9780451524935', 'Signet Classic', 1949, 'Dystopian', 4, 3, '', 'NONE', '', 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', 'Among the seminal texts of the 20th century, 1984 is a dystopian social science fiction novel by George Orwell. It explores a totalitarian regime where Big Brother exercises complete control over public and private life through omnipresent surveillance and propaganda.'),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769488', 'Little, Brown', 1951, 'Fiction', 2, 2, '', 'NONE', '', 'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg', 'The Catcher in the Rye is a novel by J. D. Salinger, partially published in serial form in 1945–1946 and as a novel in 1951. It follows sixteen-year-old Holden Caulfield after his expulsion from an elite prep school, capturing the angst of teenage disillusionment.'),
('Clean Code', 'Robert C. Martin', '9780132350884', 'Prentice Hall', 2008, 'Technology', 5, 5, '', 'TEXT', 'Clean Code: Preface\n\nClean code is code that has been written by someone who cares. It is elegant, simple, and direct. In this book, we will explore methods for styling, structuring, and writing clean, maintainable software.\n\n---PAGE---\nClean Code: Chapter 1 - Meaningful Names\n\nUse intention-revealing names. The name of a variable, function, or class should answer all the big questions. It should tell you why it exists, what it does, and how it is used. If a name requires a comment, then the name does not reveal its intent.\n\n---PAGE---\nClean Code: Chapter 2 - Functions\n\nThe first rule of functions is that they should be small. The second rule of functions is that they should be smaller than that. Functions should do one thing. They should do it well. They should do it only.', 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. In Clean Code, legendary software expert Robert C. Martin presents a revolutionary paradigm to help write better, cleaner code.'),
('The Hobbit', 'J.R.R. Tolkien', '9780007487289', 'George Allen & Unwin', 1937, 'Fantasy', 3, 3, '', 'TEXT', 'The Hobbit: Chapter 1 - An Unexpected Party\n\nIn a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.\n\n---PAGE---\nThe Hobbit: An Unexpected Party (Cont.)\n\nThe door opened on to a tube-shaped hall like a tunnel: a very comfortable tunnel without smoke, with panelled walls, and floors tiled and carpeted, provided with polished chairs, and lots and lots of pegs for hats and coats - the hobbit was fond of visitors.\n\n---PAGE---\nThe Hobbit: Chapter 2 - Roast Mutton\n\nBilbo Baggins was standing in the doorway after breakfast, feeling very happy and comfortable. Suddenly Gandalf came by, Gandalf! If you had only heard a quarter of what I have heard about him, you would be prepared for any sort of remarkable story.', 'https://covers.openlibrary.org/b/isbn/9780007487289-L.jpg', 'Written for J.R.R. Tolkien\'s own children, The Hobbit is a classic fantasy novel that follows the quest of home-loving hobbit Bilbo Baggins to win a share of the treasure guarded by Smaug the dragon.'),
('Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'MIT Press', 2009, 'Education', 2, 2, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'PDF', '', 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg', 'A comprehensive introduction to the modern study of computer algorithms. It covers a broad range of algorithms in depth, yet makes their design and analysis accessible to all levels of readers.'),
('Design Patterns', 'Erich Gamma', '9780201633610', 'Addison-Wesley', 1994, 'Technology', 4, 4, '', 'TEXT', 'Design Patterns: Introduction\n\nDesign patterns are typical solutions to common problems in software design. Each pattern is like a blueprint that you can customize to solve a particular design problem in your code.\n\n---PAGE---\nDesign Patterns: Creational - Singleton Pattern\n\nSingleton is a creational design pattern that lets you ensure that a class has only one instance, while providing a global access point to this instance. It is useful for sharing database connections or configuration managers.\n\n---PAGE---\nDesign Patterns: Behavioral - Observer Pattern\n\nObserver is a behavioral design pattern that lets you define a subscription mechanism to notify multiple objects about any events that happen to the object they are observing.', 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg', 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.'),
('The Pragmatic Programmer', 'Andrew Hunt', '9780135957059', 'Addison-Wesley', 1999, 'Technology', 3, 3, '', 'TEXT', 'The Pragmatic Programmer: Chapter 1 - Pragmatic Philosophy\n\nProvide options, don''t make lame excuses. Don''t say it can''t be done; explain what can be done to salvage the situation. Be a catalyst for change. Participate in your project''s architecture and design.\n\n---PAGE---\nThe Pragmatic Programmer: Chapter 2 - A Pragmatic Approach\n\nGood design is easier to change than bad design. Keep your code Orthogonal. Orthogonality means that changes in one part of the system do not affect others. Avoid duplication: DRY (Don''t Repeat Yourself).', 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg', 'The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process--taking a requirement and producing working, maintainable code.'),
('Frankenstein', 'Mary Shelley', '9780141439471', 'Penguin Classics', 1818, 'Classic Fiction', 4, 4, '', 'TEXT', 'Frankenstein: Chapter 1\n\nI am by birth a Genevese, and my family is one of the most distinguished of that republic. My ancestors had been for many years counsellors and syndics, and my father had filled several public situations with honour and reputation.\n\n---PAGE---\nFrankenstein: Chapter 2\n\nWe witnessed a most violent and terrible thunderstorm. It advanced from behind the mountains of Jura, and the thunder burst at once with frightful loudness from various quarters of the heaven. I remained watching its progress with curiosity and delight.', 'https://covers.openlibrary.org/b/isbn/9780141439471-L.jpg', 'Frankenstein; or, The Modern Prometheus is an 1818 novel written by English author Mary Shelley. It tells the story of Victor Frankenstein, a young scientist who creates a sapient creature in an unorthodox scientific experiment.'),
('Alice in Wonderland', 'Lewis Carroll', '9780199558292', 'Oxford University Press', 1865, 'Classic Fiction', 5, 5, '', 'TEXT', 'Alice\'s Adventures in Wonderland: Chapter 1 - Down the Rabbit-Hole\n\nAlice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, \'and what is the use of a book,\' thought Alice \'without pictures or conversations?\'\n\n---PAGE---\nAlice\'s Adventures in Wonderland: Down the Rabbit-Hole (Cont.)\n\nSo she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.', 'https://covers.openlibrary.org/b/isbn/9780199558292-L.jpg', 'Alice\'s Adventures in Wonderland is an 1865 novel by English author Lewis Carroll. It tells of a young girl named Alice, who falls through a rabbit hole into a subterranean fantasy world populated by peculiar, anthropomorphic creatures.');

-- Insert one active loan (member1 borrowed 1984, due date is 14 days from 2026-06-01)
INSERT INTO loans (book_id, user_id, borrow_date, due_date, return_date, status) VALUES
(3, 3, '2026-06-01', '2026-06-15', NULL, 'BORROWED');

-- Update available copies for book with ID 3 (1984)
UPDATE books SET available_copies = 3 WHERE id = 3;
