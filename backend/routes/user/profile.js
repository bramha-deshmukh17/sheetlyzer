const User = require('../../models/User');

// GET: View profile (already exists)
const Profile = async (req, res) => {
    const { sub, name, email, picture } = req.oidc.user;
    try {
        let user = await User.findOne({ auth0Id: sub });
        if (!user) {
            user = await User.create({ auth0Id: sub, name, email, picture });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve or create user', details: err.message });
    }
};

// PATCH: Update profile
const UpdateProfile = async (req, res) => {
    const { sub } = req.oidc.user;
    const { name, picture } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { auth0Id: sub },
            { name, picture },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile', details: err.message });
    }
};

module.exports = { Profile, UpdateProfile };