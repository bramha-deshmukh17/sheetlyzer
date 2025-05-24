const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    auth0Id: { type: String, required: true, unique: true },
    email: String,
    name: String,
    picture: String,
    accountStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
    filesData: [{
        fileName: String,
        fileType: String,
        fileData: [mongoose.Schema.Types.Mixed],
        createdAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
