const User = require('../../models/User');
const mongoose = require('mongoose');
const auth0 = require('../../utils/auth0');

// Get all users
async function getAllUsers(req, res) {
    try {
        const users = await User.find({}, "-filesData"); // Exclude filesData for summary
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
}
// Suspend user (both in MongoDB and Auth0)
async function suspendUser(req, res) {
    const { id } = req.params;

    // 1) Look up the user to get their Auth0 ID
    const userRecord = await User.findById(id).select('auth0Id');
    if (!userRecord) {
        return res.status(404).json({ error: 'User not found' });
    }

    try {
        // 2) Block them in Auth0
        if (userRecord.auth0Id) {
            await auth0.users.update(
                { id: userRecord.auth0Id },
                { blocked: true }
            );
        }

        // 3) Mark them inactive in Mongo
        const user = await User.findByIdAndUpdate(
            id,
            { accountStatus: 'inactive' },
            { new: true }
        );

        return res.json({ message: 'User suspended', userId: user._id });
    } catch (err) {
        console.error('Error suspending user:', err);
        return res.status(500).json({ error: 'Error suspending user' });
    }
}

// Activate user (both in MongoDB and Auth0)
async function activateUser(req, res) {
    const { id } = req.params;

    // 1) Look up the user to get their Auth0 ID
    const userRecord = await User.findById(id).select('auth0Id');
    if (!userRecord) {
        return res.status(404).json({ error: 'User not found' });
    }

    try {
        // 2) Unblock them in Auth0
        if (userRecord.auth0Id) {
            await auth0.users.update(
                { id: userRecord.auth0Id },
                { blocked: false }
            );
        }

        // 3) Mark them active in Mongo
        const user = await User.findByIdAndUpdate(
            id,
            { accountStatus: 'active' },
            { new: true }
        );

        return res.json({ message: 'User activated', userId: user._id });
    } catch (err) {
        console.error('Error activating user:', err);
        return res.status(500).json({ error: 'Error activating user' });
    }
}

// Delete user
async function deleteUser(req, res) {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted", userId: id });
    } catch {
        res.status(500).json({ error: "Error deleting user" });
    }
}

// Get all files for a user (for admin)
async function getUserFiles(req, res) {
    const { id } = req.params;
    try {
        const user = await User.findById(id, "filesData");
        if (!user) return res.status(404).json({ success: false, error: "User not found" });
        res.json({ success: true, files: user.filesData || [] });
    } catch {
        res.status(500).json({ success: false, error: "Failed to fetch files" });
    }
}

// Delete a specific file for a user (admin)
async function deleteUserFile(req, res) {
    const { userId, fileId } = req.params;
    try {
        const result = await User.updateOne(
            { _id: userId, "filesData._id": fileId },
            { $pull: { filesData: { _id: new mongoose.Types.ObjectId(fileId) } } }
        );
        const changed = result.modifiedCount ?? result.nModified;
        if (!changed) {
            return res.status(404).json({ success: false, message: "File not found or already deleted." });
        }
        return res.status(200).json({ success: true, message: "File deleted successfully." });
    } catch (err) {
        console.error("Error deleting file (admin):", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

module.exports = {
    getAllUsers,
    suspendUser,
    activateUser,
    deleteUser,
    getUserFiles,
    deleteUserFile
};