const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "nexus-fallback-secret-key";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-token-123";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authController = {
    async signup(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({ success: false, error: "Name is required", field: "name" });
            }
            if (!email || !emailRegex.test(email)) {
                return res.status(400).json({ success: false, error: "Valid email is required", field: "email" });
            }
            if (!password || password.length < 6) {
                return res.status(400).json({ success: false, error: "Password must be at least 6 characters", field: "password" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await userModel.create(name, email, hashedPassword);
            const token = jwt.sign({ id: newUser.id, isAdmin: false }, JWT_SECRET, { expiresIn: "7d" });

            res.status(201).json({ success: true, token, user: newUser });
        } catch (err) {
            console.error("[AUTH CONTROLLER] signup failed:", err.message);
            if (err.message === "EMAIL_ALREADY_EXISTS" || err.code === "23505") {
                return res.status(400).json({ success: false, error: "An account with this email already exists", field: "email" });
            }
            res.status(500).json({ success: false, error: "Signup failed. Please try again." });
        }
    },

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !emailRegex.test(email)) {
                return res.status(400).json({ success: false, error: "Valid email is required", field: "email" });
            }
            if (!password) {
                return res.status(400).json({ success: false, error: "Password is required", field: "password" });
            }

            const user = await userModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ success: false, error: "No account found with this email", field: "email" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, error: "Incorrect password", field: "password" });
            }

            const token = jwt.sign(
                { id: user.id, isAdmin: !!user.is_admin },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    isAdmin: !!user.is_admin
                }
            });
        } catch (err) {
            console.error("[AUTH CONTROLLER] loginUser failed:", err.message);
            res.status(500).json({ success: false, error: "Login failed. Please try again." });
        }
    },

    loginAdmin(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ success: false, error: "Username and password are required" });
            }

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                return res.json({ success: true, token: ADMIN_TOKEN });
            }

            res.status(401).json({ success: false, error: "Invalid admin credentials" });
        } catch (err) {
            console.error("[AUTH CONTROLLER] loginAdmin failed:", err.message);
            res.status(500).json({ success: false, error: "Admin login failed. Please try again." });
        }
    }
};

module.exports = authController;