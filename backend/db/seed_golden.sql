-- ============================================================
-- GOLDEN STATE — Admin Reset bu dosyayı çalıştırır
-- Her çağrıda sistemi temiz demo verisine döndürür
-- ============================================================

-- Mevcut verileri temizle (admin kullanıcısı hariç)
TRUNCATE cart RESTART IDENTITY CASCADE;
TRUNCATE orders RESTART IDENTITY CASCADE;
DELETE FROM books;
ALTER SEQUENCE books_id_seq RESTART WITH 1;
DELETE FROM users WHERE role = 'customer';

-- Admin şifresini her reset'te doğru hash'e güncelle (şifre: admin123)
UPDATE users SET password = '$2b$10$6OWZnfM3cgW7p6Rqy8fkh.3isjr5djlrMAUscd9ioRcuLRZctWXFK' WHERE username = 'admin';

-- Demo müşteri (şifre: pass123)
INSERT INTO users (username, password, role) VALUES
('customer1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p468rA2/VWY5LnRGr1KrKy', 'customer')
ON CONFLICT (username) DO NOTHING;

-- Golden State Kitaplar
INSERT INTO books (title, author, price, image_url, stock) VALUES
('Saatleri Ayarlama Enstitüsü', 'Ahmet Hamdi Tanpınar', 185.00, '/images/saatleri.jpg',  20),
('Benim Adım Kırmızı',          'Orhan Pamuk',          210.00, '/images/kirmizi.jpg',   15),
('Beyaz Kale',                  'Orhan Pamuk',          195.50, '/images/beyazkale.jpg', 12);

-- Geçmiş siparişler (grafik için — son 6 ay)
INSERT INTO orders (user_id, book_id, quantity, total_price, order_date) VALUES
(1, 1, 1, 185.00, NOW() - INTERVAL '5 months'),
(1, 2, 1, 210.00, NOW() - INTERVAL '5 months'),
(1, 3, 1, 195.50, NOW() - INTERVAL '4 months'),
(1, 1, 2, 370.00, NOW() - INTERVAL '3 months'),
(1, 2, 1, 210.00, NOW() - INTERVAL '3 months'),
(1, 3, 2, 391.00, NOW() - INTERVAL '2 months'),
(1, 1, 1, 185.00, NOW() - INTERVAL '2 months'),
(1, 2, 2, 420.00, NOW() - INTERVAL '1 month'),
(1, 3, 1, 195.50, NOW() - INTERVAL '1 month'),
(1, 1, 3, 555.00, NOW() - INTERVAL '7 days'),
(1, 2, 1, 210.00, NOW() - INTERVAL '3 days');
