const pool = require("../db");

const userModel = {
    async findByEmail(email) {
        if (!email) throw new Error("Email is required");
        try {
            const result = await pool.query(
                "SELECT * FROM users WHERE email = $1",
                [email.toLowerCase().trim()]
            );
            return result.rows[0] || null;
        } catch (err) {
            console.error("[USER MODEL] findByEmail failed:", err.message);
            throw err;
        }
    },

    async create(name, email, hashedPassword) {
        if (!name || !email || !hashedPassword) throw new Error("Name, email and password are required");
        try {
            const result = await pool.query(
                "INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, name, email",
                [name.trim(), email.toLowerCase().trim(), hashedPassword, false]
            );
            return result.rows[0];
        } catch (err) {
            console.error("[USER MODEL] create failed:", err.message);
            if (err.code === "23505") throw new Error("EMAIL_ALREADY_EXISTS");
            throw err;
        }
    },

    async getAll() {
        try {
            const result = await pool.query(
                "SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC"
            );
            return result.rows;
        } catch (err) {
            console.error("[USER MODEL] getAll failed:", err.message);
            throw err;
        }
    },

    async update(id, data) {
        if (!id || isNaN(id)) throw new Error("INVALID_ID");
        try {
            const { name, email, is_admin } = data;
            const result = await pool.query(
                "UPDATE users SET name=$1, email=$2, is_admin=$3 WHERE id=$4 RETURNING id, name, email, is_admin, created_at",
                [name.trim(), email.toLowerCase().trim(), is_admin, id]
            );
            return result.rows[0];
        } catch (err) {
            console.error("[USER MODEL] update failed:", err.message);
            throw err;
        }
    },

    async delete(id) {
        if (!id || isNaN(id)) throw new Error("INVALID_ID");
        try {
            await pool.query("DELETE FROM users WHERE id = $1", [id]);
        } catch (err) {
            console.error("[USER MODEL] delete failed:", err.message);
            throw err;
        }
    }
};

module.exports = userModel;