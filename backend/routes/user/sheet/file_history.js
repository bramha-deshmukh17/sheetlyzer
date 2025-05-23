const User = require('../../../models/User');

const FileHistory = async (req, res) => {
    try {
        const auth0Id = req.oidc.user.sub;
        const user = await User.findOne(
            { auth0Id },
            { filesData: 1, _id: 0 }
        ).lean();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Map filesData to the shape the frontend expects
        const history = user.filesData.map(fd => ({
            _id: fd._id,
            name: fd.fileName,
            type: fd.fileType,
            uploadedAt: fd.createdAt
        }));

        res.json({ success: true, history });
    } catch (err) {
        console.error('Error fetching file history:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

module.exports = FileHistory;