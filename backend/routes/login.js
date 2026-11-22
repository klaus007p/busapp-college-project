const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.post("/login", async (req, res, next) => {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const publicUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            gender: user.gender
        };
        const token = jwt.sign({ user: publicUser }, process.env.JWT_SECRET, { expiresIn: "7d" });

        return res.status(200).json({ token, user: publicUser });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
