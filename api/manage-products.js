const db = require('../src/config/db');

export default async function handler(req, res) {
    const { method } = req;
    const { id, name, category, unit, price_buy, price_sell } = req.body;

    try {
        switch (method) {
            case 'POST':
                if (id) {
                    // --- LOGIKA EDIT PRODUK ---
                    await db.query(
                        `UPDATE products 
                         SET name = ?, category = ?, unit = ?, price_buy = ?, price_sell = ? 
                         WHERE id = ?`,
                        [name, category, unit, price_buy, price_sell, id]
                    );
                    return res.status(200).json({ success: true, message: 'Produk diperbarui' });
                } else {
                    // --- LOGIKA TAMBAH PRODUK BARU ---
                    // Default stok 0 untuk produk yang baru didaftarkan
                    await db.query(
                        `INSERT INTO products (name, category, unit, price_buy, price_sell, stock) 
                         VALUES (?, ?, ?, ?, ?, 0)`,
                        [name, category, unit, price_buy, price_sell]
                    );
                    return res.status(201).json({ success: true, message: 'Produk ditambahkan' });
                }

            case 'DELETE':
                // --- LOGIKA HAPUS PRODUK ---
                // Mengambil ID dari query params (misal: /api/manage-products?id=10)
                const deleteId = req.query.id;
                if (!deleteId) return res.status(400).json({ message: 'ID diperlukan' });

                // Hapus juga history transaksinya agar database tetap bersih (Optional)
                await db.query('DELETE FROM transaction_logs WHERE product_id = ?', [deleteId]);
                await db.query('DELETE FROM products WHERE id = ?', [deleteId]);
                
                return res.status(200).json({ success: true, message: 'Produk dihapus' });

            default:
                res.setHeader('Allow', ['POST', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('Manage Products Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Gagal memproses data produk: ' + error.message 
        });
    }
}