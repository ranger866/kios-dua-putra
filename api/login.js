const db = require('../src/config/db');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Gunakan POST' });

    const { username, password } = req.body;

    try {
        const [rows] = await db.query(
            'SELECT * FROM admins WHERE username = ? AND password = ?', 
            [username, password]
        );

        if (rows.length > 0) {
            // Jika berhasil, kirim respon sukses
            res.status(200).json({ 
                success: true, 
                message: 'Login Berhasil',
                user: { id: rows[0].id, username: rows[0].username }
            });
        } else {
            res.status(401).json({ success: false, message: 'Username atau Password Salah' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}