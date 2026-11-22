const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Register Here");
});

router.post("/", async (req, res, next) => {
    const body = req.body || {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const mobile = typeof body.mobile === "string" ? body.mobile.trim() : "";
    const gender = typeof body.gender === "string" ? body.gender.trim() : "";

    if (!name || !email || !password || !mobile || !gender) {
        return res.status(400).json({ message: "Please complete all required fields." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Enter a valid email address." });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        const user = await User.create({
            name,
            email,
            password: await bcrypt.hash(password, 10),
            mobile,
            gender
        });

        return res.status(201).json({
            message: "Your account has been created.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                gender: user.gender
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        return next(error);
    }
});

module.exports = router;