const pool = require("../db");

const warehouseModel = {
    async getAll() {
        try {
            const result = await pool.query(
                "SELECT * FROM warehouses ORDER BY created_at DESC"
            );
            return result.rows;
        } catch (err) {
            console.error("[WAREHOUSE MODEL] getAll failed:", err.message);
            throw err;
        }
    },

    async getPublic(filters = {}) {
        try {
            let query = "SELECT * FROM warehouses WHERE status = 'Available'";
            const params = [];
            const { city, minArea, maxRate } = filters;

            if (city && typeof city === "string") {
                params.push(`%${city.trim()}%`);
                query += ` AND city ILIKE $${params.length}`;
            }
            if (minArea && !isNaN(minArea)) {
                params.push(parseInt(minArea));
                query += ` AND area_available >= $${params.length}`;
            }
            if (maxRate && !isNaN(maxRate)) {
                params.push(parseFloat(maxRate));
                query += ` AND rate <= $${params.length}`;
            }

            query += " ORDER BY is_prime DESC, created_at DESC";
            const result = await pool.query(query, params);
            return result.rows;
        } catch (err) {
            console.error("[WAREHOUSE MODEL] getPublic failed:", err.message);
            throw err;
        }
    },

    async getById(id) {
        if (!id || isNaN(id)) throw new Error("INVALID_ID");
        try {
            const result = await pool.query(
                "SELECT * FROM warehouses WHERE id = $1",
                [id]
            );
            return result.rows[0] || null;
        } catch (err) {
            console.error("[WAREHOUSE MODEL] getById failed:", err.message);
            throw err;
        }
    },

    async getByUserId(userId) {
        if (!userId) throw new Error("INVALID_USER_ID");
        try {
            const result = await pool.query(
                "SELECT * FROM warehouses WHERE user_id = $1 ORDER BY created_at DESC",
                [userId]
            );
            return result.rows;
        } catch (err) {
            console.error("[WAREHOUSE MODEL] getByUserId failed:", err.message);
            throw err;
        }
    },

    async create(data, userId) {
        if (!data.city) throw new Error("CITY_REQUIRED");
        if (!data.contact_phone) throw new Error("CONTACT_PHONE_REQUIRED");
        try {
            const warehouseCode = data.org_name
                ? data.org_name.replace(/\s+/g, "-").toLowerCase() + "-" + Date.now()
                : "PENDING-" + Date.now();

            const isLand = data.type === "land" || data.status === "Land Parcel";
            const status = isLand ? "Land Parcel" : "pending";

            const query = `
        INSERT INTO warehouses (
          warehouse_code, org_name, city, address, full_address,
          latitude, longitude, area_available, rate, status,
          is_prime, category, ceiling_height, docks, floor_strength,
          term_type, term_duration, description, industries, facilities,
          contact_person, contact_email, contact_phone, capacity_value, capacity_type,
          lister_type, website, user_id
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
          $16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
        ) RETURNING *`;

            const num = (v) => (v === "" || v === undefined ? null : Number(v));

            const values = [
                warehouseCode,
                data.org_name,
                data.city?.trim(),
                data.address,
                data.full_address,

                num(data.latitude),
                num(data.longitude),

                num(data.area_available) || num(data.land_size),

                num(data.rate) || num(data.rate_sqft),

                status,

                data.is_prime || false,

                data.category || (isLand ? "Land" : ""),

                num(data.ceiling_height),
                num(data.docks),
                num(data.floor_strength),

                data.term_type,
                data.term_duration,
                data.description,

                data.industries,
                data.facilities,

                data.contact_person,
                data.contact_email,
                data.contact_phone,

                num(data.capacity_value) || num(data.land_size),

                data.capacity_type || "sq_ft",
                data.lister_type,
                data.website,

                userId
            ];

            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            console.error("[WAREHOUSE MODEL] create failed:", err.message);
            throw err;
        }
    },

    async update(id, userId, data) {
        if (!id || isNaN(id)) throw new Error("INVALID_ID");
        if (!userId) throw new Error("INVALID_USER_ID");
        try {
            const result = await pool.query(
                "UPDATE warehouses SET org_name=$1, city=$2, address=$3, status='pending' WHERE id=$4 AND user_id=$5 RETURNING *",
                [data.org_name, data.city?.trim(), data.address, id, userId]
            );
            return result.rows[0] || null;
        } catch (err) {
            console.error("[WAREHOUSE MODEL] update failed:", err.message);
            throw err;
        }
    },

    async approve(id) {
        if (!id || isNaN(id)) throw new Error("INVALID_ID");
        try {
            const result = await pool.query(
                "UPDATE warehouses SET status = 'Available' WHERE id = $1 RETURNING *",
                [id]
            );
            if (result.rows.length === 0) throw new Error("WAREHOUSE_NOT_FOUND");
            return result.rows[0];
        } catch (err) {
            console.error("[WAREHOUSE MODEL] approve failed:", err.message);
            throw err;
        }
    },

    async delete(id) {
        if (!id || isNaN(id)) throw new Error("INVALID_ID");
        try {
            const result = await pool.query(
                "DELETE FROM warehouses WHERE id = $1 RETURNING *",
                [id]
            );
            if (result.rows.length === 0) throw new Error("WAREHOUSE_NOT_FOUND");
            return result.rows[0];
        } catch (err) {
            console.error("[WAREHOUSE MODEL] delete failed:", err.message);
            throw err;
        }
    }
};

module.exports = warehouseModel;