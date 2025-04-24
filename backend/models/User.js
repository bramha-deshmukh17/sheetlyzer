const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    auth0Id: { type: String, required: true, unique: true },
    email: String,
    name: String,
    picture: String,
});

module.exports = mongoose.model('User', UserSchema);
