const pool = require("../db");

const warehouseModel = {
    async getAll() {
        try {
            const result = await pool.query(
                "SELECT * FROM warehouses ORDER BY display_order DESC, created_at DESC"
            );
            return result.rows;
        } catch (err) {
            console.error("[WAREHOUSE MODEL] getAll failed:", err.message);
            throw err;
        }
    },

    async getPublic(filters = {}) {
        try {
            const {
                city,
                min_area,
                min_rate,
                max_rate,
                category,
                search,
                page = 1,
                limit = 12
            } = filters;

            let query = "SELECT * FROM warehouses WHERE status = 'Available'";
            let countQuery = "SELECT COUNT(*) FROM warehouses WHERE status = 'Available'";
            const params = [];
            let paramIndex = 1;

            if (city && city !== "All") {
                params.push(`%${city.trim()}%`);
                const filter = ` AND city ILIKE $${paramIndex++}`;
                query += filter;
                countQuery += filter;
            }

            if (min_area && !isNaN(min_area)) {
                params.push(parseInt(min_area));
                const filter = ` AND area_available >= $${paramIndex++}`;
                query += filter;
                countQuery += filter;
            }

            if (min_rate && !isNaN(min_rate)) {
                params.push(parseFloat(min_rate));
                const filter = ` AND rate >= $${paramIndex++}`;
                query += filter;
                countQuery += filter;
            }

            if (max_rate && !isNaN(max_rate)) {
                params.push(parseFloat(max_rate));
                const filter = ` AND rate <= $${paramIndex++}`;
                query += filter;
                countQuery += filter;
            }

            if (category && category !== "All") {
                params.push(`%${category.trim()}%`);
                const filter = ` AND category ILIKE $${paramIndex++}`;
                query += filter;
                countQuery += filter;
            }

            if (search) {
                params.push(`%${search.trim()}%`);
                const filter = ` AND (city ILIKE $${paramIndex} OR warehouse_code ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
                paramIndex++;
                query += filter;
                countQuery += filter;
            }

            // Ordering
            query += " ORDER BY display_order DESC, is_prime DESC, created_at DESC";

            // Pagination
            const offset = (page - 1) * limit;
            params.push(limit);
            query += ` LIMIT $${paramIndex++}`;
            params.push(offset);
            query += ` OFFSET $${paramIndex++}`;

            const [result, countResult] = await Promise.all([
                pool.query(query, params),
                pool.query(countQuery, params.slice(0, paramIndex - 3))
            ]);

            const total = parseInt(countResult.rows[0].count);

            return {
                data: result.rows,
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            };
        } catch (err) {
            console.error("[WAREHOUSE MODEL] getPublic failed:", err.message);
            throw err;
        }
    },

    async getFeatured() {
        try {
            const result = await pool.query(
                "SELECT * FROM warehouses WHERE is_prime = true AND status = 'Available' ORDER BY display_order DESC, created_at DESC LIMIT 6"
            );
            return result.rows;
        } catch (err) {
            console.error("[WAREHOUSE MODEL] getFeatured failed:", err.message);
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

    async adminUpdate(id, data) {
        if (!id || isNaN(id)) throw new Error("INVALID_ID");
        try {
            const num = (v) => (v === "" || v === undefined ? null : Number(v));

            const result = await pool.query(
                `UPDATE warehouses SET 
                    warehouse_code=$1, org_name=$2, city=$3, address=$4, full_address=$5,
                    latitude=$6, longitude=$7, area_available=$8, rate=$9, status=$10,
                    is_prime=$11, category=$12, ceiling_height=$13, docks=$14, floor_strength=$15,
                    term_type=$16, term_duration=$17, description=$18, industries=$19, facilities=$20,
                    contact_person=$21, contact_email=$22, contact_phone=$23, capacity_value=$24, capacity_type=$25,
                    lister_type=$26, website=$27, lease_type=$28, display_order=$29, source_name=$30, 
                    source_contact=$31, source_email=$32, source_designation=$33, nearest_port=$34, 
                    nearest_airport=$35, listing_mode=$36
                WHERE id=$37 RETURNING *`,
                [
                    data.warehouse_code, data.org_name, data.city?.trim(), data.address, data.full_address,
                    num(data.latitude), num(data.longitude), num(data.area_available), num(data.rate), data.status || 'Available',
                    data.is_prime || false, data.category, num(data.ceiling_height), num(data.docks), data.floor_strength,
                    data.term_type, data.term_duration, data.description, data.industries, data.facilities,
                    data.contact_person, data.contact_email, data.contact_phone, num(data.capacity_value), data.capacity_type,
                    data.lister_type, data.website, data.lease_type, num(data.display_order) || 0, data.source_name,
                    data.source_contact, data.source_email, data.source_designation, data.nearest_port,
                    data.nearest_airport, data.listing_mode,
                    id
                ]
            );
            return result.rows[0] || null;
        } catch (err) {
            console.error("[WAREHOUSE MODEL] adminUpdate failed:", err.message);
            throw err;
        }
    },

    async adminCreate(data) {
        try {
            const num = (v) => (v === "" || v === undefined ? null : Number(v));
            const warehouseCode = data.warehouse_code || ("NXS-" + Date.now());

            const query = `
                INSERT INTO warehouses (
                    warehouse_code, org_name, city, address, full_address,
                    latitude, longitude, area_available, rate, status,
                    is_prime, category, ceiling_height, docks, floor_strength,
                    term_type, term_duration, description, industries, facilities,
                    contact_person, contact_email, contact_phone, capacity_value, capacity_type,
                    lister_type, website, lease_type, display_order, source_name,
                    source_contact, source_email, source_designation, nearest_port,
                    nearest_airport, listing_mode
                ) VALUES (
                    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
                    $16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
                    $31,$32,$33,$34,$35,$36
                ) RETURNING *`;

            const values = [
                warehouseCode, data.org_name, data.city?.trim(), data.address, data.full_address,
                num(data.latitude), num(data.longitude), num(data.area_available), num(data.rate), data.status || 'Available',
                data.is_prime || false, data.category, num(data.ceiling_height), num(data.docks), data.floor_strength,
                data.term_type, data.term_duration, data.description, data.industries, data.facilities,
                data.contact_person, data.contact_email, data.contact_phone, num(data.capacity_value), data.capacity_type,
                data.lister_type, data.website, data.lease_type, num(data.display_order) || 0, data.source_name,
                data.source_contact, data.source_email, data.source_designation, data.nearest_port,
                data.nearest_airport, data.listing_mode
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            console.error("[WAREHOUSE MODEL] adminCreate failed:", err.message);
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
    },

    async getCities() {
        try {
            const result = await pool.query(
                "SELECT DISTINCT city FROM warehouses WHERE status = 'Available' AND city IS NOT NULL ORDER BY city ASC"
            );
            return result.rows.map(r => r.city);
        } catch (err) {
            console.error("[WAREHOUSE MODEL] getCities failed:", err.message);
            throw err;
        }
    }
};

module.exports = warehouseModel;