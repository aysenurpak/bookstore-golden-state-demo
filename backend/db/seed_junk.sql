-- ============================================================
-- JUNK DATA — Demo için sistemi kasıtlı olarak bozar
-- Admin Reset butonu ile golden state'e dönülür
-- ============================================================

-- Mevcut kitapları koru, üstüne kötü veri ekle
INSERT INTO books (title, author, price, image_url, stock) VALUES
('asdfasdf',        'test author', 999999.00, '/images/kirmizi.jpg',   0),
('book 1',          'me',               0.00, '/images/saatleri.jpg',  1),
('test_book_final', 'qwerty',           1.00, '/images/beyazkale.jpg', 99),
('a',               'a',             -100.00, '/images/kirmizi.jpg',  -5),
('Spam Book',       'Spam Author',   9999.99, '/images/saatleri.jpg', 1000);