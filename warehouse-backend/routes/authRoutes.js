const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const admin = require('../config/firebase-admin');
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.post("/signup", authController.signup);
router.post("/login", authController.loginUser);
router.post("/admin/login", authController.loginAdmin);

// Google Sign-In via Firebase
router.post('/google', async (req, res) => {
    try {
        const { idToken } = req.body;

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, uid } = decodedToken;

        let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            user = await pool.query(
                'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING *',
                [email, name, `google_${uid}`]
            );
        }

        const token = jwt.sign(
            { id: user.rows[0].id, email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ success: true, data: { token, user: user.rows[0] } });

    } catch (err) {
        console.error(err);
        res.status(401).json({ success: false, error: 'Invalid Google token' });
    }
});

module.exports = router;