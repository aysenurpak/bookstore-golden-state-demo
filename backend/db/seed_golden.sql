TRUNCATE books, orders RESTART IDENTITY CASCADE;

INSERT INTO books (title, author, price, image_url, stock) VALUES
('Saatleri Ayarlama Enstitüsü', 'Ahmet Hamdi Tanpınar', 185.00, 'https://images.thulium.com/ex1.jpg', 20),
('Benim Adım Kırmızı', 'Orhan Pamuk', 210.00, 'https://images.thulium.com/ex2.jpg', 15),
('Beyaz Kale', 'Orhan Pamuk', 195.50, 'https://images.thulium.com/ex3.jpg', 12);