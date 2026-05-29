const db = require('../src/config/db');

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Metode tidak diizinkan' });
    }

    try {
        // 1. Hitung Laba Hari Ini (Hanya dari tipe 'OUT' / Penjualan)
        // Rumus: (Harga Jual saat itu - Harga Beli saat itu) * Jumlah terjual
        const [profitResult] = await db.query(`
            SELECT 
                SUM((sell_price_at_time - buy_price_at_time) * qty) as daily_profit
            FROM transaction_logs 
            WHERE type = 'OUT' 
            AND DATE(created_at) = CURDATE()
        `);

        // 2. Ringkasan Penjualan per Kategori (Untuk Chart Penjualan)
        // Menghitung total qty barang keluar dikelompokkan berdasarkan kategori produk
        const [salesByCat] = await db.query(`
            SELECT 
                p.category, 
                SUM(t.qty) as total_sold
            FROM transaction_logs t
            JOIN products p ON t.product_id = p.id
            WHERE t.type = 'OUT'
            GROUP BY p.category
            ORDER BY total_sold DESC
        `);

        // 3. Tambahan: 5 Produk Paling Laris (Top Selling)
        const [topProducts] = await db.query(`
            SELECT 
                p.name, 
                SUM(t.qty) as total_qty
            FROM transaction_logs t
            JOIN products p ON t.product_id = p.id
            WHERE t.type = 'OUT'
            GROUP BY p.id
            ORDER BY total_qty DESC
            LIMIT 5
        `);

        // Kirim data ke Frontend
        res.status(200).json({
            success: true,
            dailyProfit: profitResult[0].daily_profit || 0,
            salesByCat: salesByCat,
            topProducts: topProducts
        });

    } catch (error) {
        console.error('Sales Report Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Gagal mengambil laporan penjualan: ' + error.message 
        });
    }
}