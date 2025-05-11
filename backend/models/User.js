const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    auth0Id: { type: String, required: true, unique: true },
    email: String,
    name: String,
    picture: String,
    filesData: [{
        fileName: String,
        fileType: String,
        fileData: [mongoose.Schema.Types.Mixed],
        createdAt: { type: Date, default: Date.now }
    }],
});

module.exports = mongoose.model('User', UserSchema);
