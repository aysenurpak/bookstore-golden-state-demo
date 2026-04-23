TRUNCATE books, orders RESTART IDENTITY CASCADE;

INSERT INTO books (title, author, price, image_url, stock) VALUES
('asdfasdf', 'test author', 999999.00, '', 0),
('book 1', 'me', 0.00, '', 1),
('test_book_final', 'qwerty', 1.00, '', 99);