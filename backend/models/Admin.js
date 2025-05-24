const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'superadmin'], required: true, default: 'admin' },
    accountStatus: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('Admin', AdminSchema);