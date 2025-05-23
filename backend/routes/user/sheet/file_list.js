// routes/user/sheet/list_files.js
const User = require('../../../models/User');

const ListFiles = async function (req, res) {
    const userId = req.oidc.user?.sub;
    try {
        const user = await User.findOne({ auth0Id: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        // Return only fileName and _id for each file in filesData
        const files = (user.filesData || []).map(file => ({
            fileName: file.fileName,
            _id: file._id
        }));
        res.status(200).json({ success: true, files });
    } catch (err) {
        console.error('Error listing files:', err);
        res.status(500).json({ success: false, message: "Failed to list files." });
    }
};

module.exports = ListFiles;