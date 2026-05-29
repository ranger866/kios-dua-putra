const db = require('../src/config/db');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Gunakan POST' });
    const { productId, qty, type } = req.body;

    try {
        // 1. Ambil harga saat ini
        const [product] = await db.query('SELECT price_buy, price_sell FROM products WHERE id = ?', [productId]);
        const { price_buy, price_sell } = product[0];

        // 2. Update Stok
        const operator = (type === 'IN') ? '+' : '-';
        await db.query(`UPDATE products SET stock = stock ${operator} ? WHERE id = ?`, [qty, productId]);

        // 3. Catat ke Log Transaksi untuk Laporan Keuangan
        await db.query(
            'INSERT INTO transaction_logs (product_id, qty, type, buy_price_at_time, sell_price_at_time) VALUES (?, ?, ?, ?, ?)',
            [productId, qty, type, price_buy, price_sell]
        );

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}