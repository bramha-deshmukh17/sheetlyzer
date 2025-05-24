const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");
const dotenv = require("dotenv");

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    console.error("JWT_SECRET is not defined in the environment variables.");
    process.exit(1);
}

const LoginAdmin = async (req, res) => {
    const { username, password } = req.body;

    //basic validation for username and password
    if (!username || username.length < 5 || username.length > 16 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: "Invalid username or password." });
    }

    if (!password || password.length < 6 || password.length > 16 || !/^[a-zA-Z0-9_@#$%&*]+$/.test(password)) {
        return res.status(400).json({ error: "Invalid username or password." });
    }

    try {
        const user = await Admin.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "Invalid username or password." });
        }

        // Check if admin is suspended
        if (user.accountStatus === 'inactive') {
            return res.status(403).json({ error: "Your account is suspended. Please contact the superadmin." });
        }

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "24h" });
        res.cookie("authToken", token, {
            httpOnly: true,// Can't be accessed from JS
            secure: false, // Use HTTPS in production and set to true
            sameSite: "Strict",// Protect against CSRF
            maxAge: 24 * 60 * 60 * 1000,//24 hours
        });
        res.status(200).json({
            message: "Login successful!",
            userId: user._id,
            role: user.role // <-- add this
        });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ message: "Server error." });
    }
};

const LogoutAdmin = (req, res) => {
    //clearing the admin login token to destroy the session
    res.clearCookie('authToken').status(200).json({ message: 'Logged out successfully' });
}

module.exports = { LoginAdmin, LogoutAdmin };
