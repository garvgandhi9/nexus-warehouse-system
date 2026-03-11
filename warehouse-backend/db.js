const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
    console.error("[DB] FATAL: DATABASE_URL is not set in environment variables");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false }
});

pool.on("error", (err) => {
    console.error("[DB] Unexpected pool error:", err.message);
});

module.exports = pool;