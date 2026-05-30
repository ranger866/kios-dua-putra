const db = require('../src/config/db');
const bcrypt = require("bcryptjs");

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const [rows] = await db.query("SELECT id, username FROM admins");
            return res.status(200).json(rows);
        }

        if (req.method === 'POST') {
            const { username, password } = req.body;
            
            // Hash password dengan salt round 10
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await db.query(
                "INSERT INTO admins (username, password) VALUES (?, ?)", 
                [username, hashedPassword]
            );
            return res.status(200).json({ success: true });
        }

        if (req.method === 'PUT') {
            const { id, username, password } = req.body;

            if (password && password.trim() !== '') {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                await db.query(
                    "UPDATE admins SET username = ?, password = ? WHERE id = ?",
                    [username, hashedPassword, id]
                );
            } else {
                await db.query(
                    "UPDATE admins SET username = ? WHERE id = ?",
                    [username, id]
                );
            }

            return res.status(200).json({ success: true });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            await db.query("DELETE FROM admins WHERE id = ?", [id]);
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};