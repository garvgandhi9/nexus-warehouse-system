const { Pool } = require("pg");

const pool = new Pool({
    user: "garvgandhi",
    host: "localhost",
    database: "warehouse_system",
    password: "",
    port: 5432,
});

async function migrate_contacts() {
    try {
        console.log("Starting contact_messages migration...");

        await pool.query(`
      ALTER TABLE contact_messages 
      ADD COLUMN IF NOT EXISTS source VARCHAR(100),
      ADD COLUMN IF NOT EXISTS context VARCHAR(255),
      ADD COLUMN IF NOT EXISTS category VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tier VARCHAR(50);
    `);

        await pool.query(`
      ALTER TABLE contact_messages 
      DROP COLUMN IF EXISTS company,
      DROP COLUMN IF EXISTS requirement;
    `);

        console.log("Migration successful.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

migrate_contacts();
