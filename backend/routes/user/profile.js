const { ManagementClient } = require('auth0');
const User = require('../../models/User');

const auth0 = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN2,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    scope: 'delete:users'
});

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

// DELETE: Self-delete user
const DeleteSelf = async (req, res) => {
    const { sub } = req.oidc.user;
    try {
        const user = await User.findOne({ auth0Id: sub });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Delete from Auth0
        try {
            await auth0.users.delete({ id: sub });
        } catch (err) {
            // Log but don't block MongoDB deletion if Auth0 user is already gone
            console.error("Error deleting user from Auth0:", err.message || err);
        }

        // Delete from MongoDB
        await User.deleteOne({ auth0Id: sub });

        res.json({ message: "Account deleted from Auth0 and MongoDB" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting account", details: err.message });
    }
};

module.exports = { Profile, UpdateProfile, DeleteSelf };