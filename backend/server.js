require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// CORS Ayarı
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"], 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Manual Header Ekleme
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// PostgreSQL Bağlantı Havuzu
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test Bağlantısı
pool.query('SELECT NOW()', (err, res) => {
    if (err) console.error("DB Bağlantı Hatası:", err);
    else console.log("PostgreSQL Bağlantısı Başarılı!");
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
};

// --- ENDPOINTLER ---

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server çalışıyor' });
});

// Auth
app.post('/api/auth/login', async (req, res) => {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = result.rows[0];
        // Demo için esnek şifre kontrolü
        if (password === 'admin123' || password === 'pass123') {
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, 'secretkey');
            return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
        }
        res.status(400).json({ error: 'Invalid password' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// 1. SİSTEMİ RESETLEME (GOLDEN STATE)
app.post('/api/admin/reset', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const sqlPath = path.join(__dirname, 'db', 'seed_golden.sql');
        const seedQuery = fs.readFileSync(sqlPath).toString();
        await pool.query(seedQuery);
        res.json({ message: "Sistem 'Golden State' durumuna döndürüldü!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Resetleme başarısız." });
    }
});

// 2. SİSTEMİ BOZMA (JUNK DATA)
app.post('/api/admin/corrupt', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const sqlPath = path.join(__dirname, 'db', 'seed_junk.sql');
        const junkQuery = fs.readFileSync(sqlPath).toString();
        await pool.query(junkQuery);
        res.json({ message: "Sistem test verileriyle dolduruldu!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Veri bozma başarısız." });
    }
});

// 3. TÜM KİTAPLARI GETİR
app.get('/api/books', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM books ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Veriler alınamadı." });
    }
});

// Kitap ekleme (Admin)
app.post('/api/books', authenticateToken, requireAdmin, async (req, res) => {
    const { title, author, price, image_url, stock } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO books (title, author, price, image_url, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, author, price, image_url, stock]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kitap eklenemedi' });
    }
});

// Kitap güncelleme (Admin)
app.put('/api/books/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, author, price, image_url, stock } = req.body;
    try {
        const result = await pool.query(
            'UPDATE books SET title = $1, author = $2, price = $3, image_url = $4, stock = $5 WHERE id = $6 RETURNING *',
            [title, author, price, image_url, stock, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Kitap bulunamadı' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kitap güncellenemedi' });
    }
});

// Kitap silme (Admin)
app.delete('/api/books/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        // Önce bu kitaba ait siparişleri sil
        await pool.query('DELETE FROM orders WHERE book_id = $1', [id]);
        // Sonra sepetten sil
        await pool.query('DELETE FROM cart WHERE book_id = $1', [id]);
        // Sonra kitabı sil
        const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Kitap bulunamadı' });
        res.json({ message: 'Kitap silindi', deleted: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kitap silinemedi' });
    }
});

// Cart endpoints (Customer)
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT c.id, b.title, b.author, b.price, c.quantity FROM cart c JOIN books b ON c.book_id = b.id WHERE c.user_id = $1',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sepet alınamadı' });
    }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
    const { book_id, quantity } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO cart (user_id, book_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, book_id) DO UPDATE SET quantity = cart.quantity + $3 RETURNING *',
            [req.user.id, book_id, quantity]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sepete eklenemedi' });
    }
});

app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM cart WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        res.json({ message: 'Sepetten çıkarıldı' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sepetten çıkarılamadı' });
    }
});

// Checkout (Customer)
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const cartItems = await pool.query('SELECT * FROM cart WHERE user_id = $1', [req.user.id]);
        if (cartItems.rows.length === 0) return res.status(400).json({ error: 'Sepet boş' });

        for (const item of cartItems.rows) {
            const book = await pool.query('SELECT * FROM books WHERE id = $1', [item.book_id]);
            if (book.rows[0].stock < item.quantity) return res.status(400).json({ error: 'Yetersiz stok' });

            await pool.query('INSERT INTO orders (user_id, book_id, quantity, total_price) VALUES ($1, $2, $3, $4)',
                [req.user.id, item.book_id, item.quantity, book.rows[0].price * item.quantity]);

            await pool.query('UPDATE books SET stock = stock - $1 WHERE id = $2', [item.quantity, item.book_id]);
        }

        await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
        res.json({ message: 'Sipariş tamamlandı' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sipariş başarısız' });
    }
});

// Sales report (Admin)
app.get('/api/orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.id, u.username, b.title, o.quantity, o.total_price, o.order_date
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN books b ON o.book_id = b.id
            ORDER BY o.order_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Satış verileri alınamadı' });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda başarıyla çalışıyor...`);
});