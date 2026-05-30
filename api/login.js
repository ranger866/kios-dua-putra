const db = require('../src/config/db');
const bcrypt = require("bcryptjs");

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Gunakan POST' });

    const { username, password } = req.body;

    try {
        const [rows] = await db.query(
            'SELECT * FROM admins WHERE username = ?', 
            [username]
        );
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Username tidak ditemukan' });
        }
        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return res.status(200).json({success: true, message: "Login Berhasil"});
        } else {
            return res.status(401).json({success: false, message: "Password Salah"});
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}