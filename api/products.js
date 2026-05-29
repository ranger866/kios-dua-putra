const db = require('../src/config/db');

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Gunakan GET' });

    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY name ASC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}