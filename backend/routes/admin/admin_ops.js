const Admin = require('../../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

// Middleware to check JWT and role
function verifySuperAdmin(req, res, next) {
    const token = req.cookies.authToken;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.adminId = decoded.userId;
        Admin.findById(decoded.userId).then(admin => {
            if (!admin || admin.role !== 'superadmin') {
                return res.status(403).json({ error: "Forbidden" });
            }
            next();
        });
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}

// Create Admin
async function createAdmin(req, res) {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    // Always set role to 'admin'
    let newRole = 'admin';

    // Prevent creation of another superadmin
    if (role === 'superadmin') {
        const superadminExists = await Admin.exists({ role: 'superadmin' });
        if (superadminExists) {
            return res.status(400).json({ error: "Only one superadmin allowed" });
        }
        newRole = 'superadmin';
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const admin = new Admin({ username, password: hash, role: newRole });
        await admin.save();
        res.status(201).json({ message: "Admin created", adminId: admin._id });
    } catch (err) {
        res.status(500).json({ error: "Error creating admin" });
    }
}

// Helper to check if only one superadmin exists
async function isOnlySuperadmin(id) {
    const superadmins = await Admin.find({ role: 'superadmin', accountStatus: 'active' });
    return superadmins.length === 1 && superadmins[0]._id.toString() === id.toString();
}

// Suspend Admin
async function suspendAdmin(req, res) {
    const { id } = req.params;
    try {
        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ error: "Admin not found" });
        if (admin.role === 'superadmin' && await isOnlySuperadmin(id)) {
            return res.status(400).json({ error: "Cannot suspend the only superadmin" });
        }
        admin.accountStatus = 'inactive';
        await admin.save();
        res.json({ message: "Admin suspended", adminId: admin._id });
    } catch {
        res.status(500).json({ error: "Error suspending admin" });
    }
}

// Activate Admin (no restriction needed)
async function activateAdmin(req, res) {
    const { id } = req.params;
    try {
        const admin = await Admin.findByIdAndUpdate(id, { accountStatus: 'active' }, { new: true });
        if (!admin) return res.status(404).json({ error: "Admin not found" });
        res.json({ message: "Admin activated", adminId: admin._id });
    } catch {
        res.status(500).json({ error: "Error activating admin" });
    }
}

// Delete Admin
async function deleteAdmin(req, res) {
    const { id } = req.params;
    try {
        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ error: "Admin not found" });
        if (admin.role === 'superadmin' && await isOnlySuperadmin(id)) {
            return res.status(400).json({ error: "Cannot delete the only superadmin" });
        }
        await Admin.findByIdAndDelete(id);
        res.json({ message: "Admin deleted", adminId: id });
    } catch {
        res.status(500).json({ error: "Error deleting admin" });
    }
}

// Get all admins (superadmin only)
async function getAllAdmins(req, res) {
    try {
        const admins = await Admin.find({}, "-password"); // Exclude password field
        res.json({ success: true, admins });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch admins" });
    }
}

module.exports = {
    verifySuperAdmin,
    createAdmin,
    suspendAdmin,
    activateAdmin,
    deleteAdmin,
    getAllAdmins
};