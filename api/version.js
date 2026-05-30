const db = require('../src/config/db');

export default async function handler(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT UNIX_TIMESTAMP(MAX(update_at)) AS version
            FROM products
        `);

        res.status(200).json({
            version: rows[0].version || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}