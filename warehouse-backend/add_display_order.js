const pool = require("./db");

async function run() {
    try {
        await pool.query("ALTER TABLE warehouses ADD COLUMN display_order integer DEFAULT 0;");
        console.log("Successfully added display_order column");
    } catch (e) {
        console.error("Error or column already exists:", e.message);
    } finally {
        pool.end();
    }
}

run();
