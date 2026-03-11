const pool = require("../db");

const messageModel = {
    async create(data) {
        if (!data.name || !data.name.trim()) throw new Error("NAME_REQUIRED");
        if (!data.email || !data.email.trim()) throw new Error("EMAIL_REQUIRED");
        if (!data.message || !data.message.trim()) throw new Error("MESSAGE_REQUIRED");
        try {
            const result = await pool.query(
                `INSERT INTO messages
          (name, email, phone, message, source, context, category, tier)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
                [
                    data.name.trim(),
                    data.email.toLowerCase().trim(),
                    data.phone || null,
                    data.message.trim(),
                    data.source || "Direct Contact",
                    data.context || "General",
                    data.category || "",
                    data.tier || "Standard"
                ]
            );
            return result.rows[0];
        } catch (err) {
            console.error("[MESSAGE MODEL] create failed:", err.message);
            throw err;
        }
    },

    async getAll() {
        try {
            const result = await pool.query(
                "SELECT * FROM messages ORDER BY created_at DESC"
            );
            return result.rows;
        } catch (err) {
            console.error("[MESSAGE MODEL] getAll failed:", err.message);
            throw err;
        }
    },

    async delete(id) {
        if (!id || isNaN(id)) throw new Error("INVALID_ID");
        try {
            const result = await pool.query(
                "DELETE FROM messages WHERE id = $1 RETURNING *",
                [id]
            );
            if (result.rows.length === 0) throw new Error("MESSAGE_NOT_FOUND");
            return result.rows[0];
        } catch (err) {
            console.error("[MESSAGE MODEL] delete failed:", err.message);
            throw err;
        }
    }
};

module.exports = messageModel;