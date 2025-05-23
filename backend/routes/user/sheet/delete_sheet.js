const User = require('../../../models/User');
const mongoose = require('mongoose');

const delete_sheet = async (req, res) => {
    const userInfo = req.oidc.user;
    if (!userInfo) {
        return res.redirect(`${process.env.FRONTEND_URL}/`);
    }

    const { id } = req.params;

    try {

        const result = await User.updateOne(
            { auth0Id: userInfo.sub, "filesData._id": id },
            { $pull: { filesData: { _id: new mongoose.Types.ObjectId(id) } } }
        );
        
        const changed = result.modifiedCount ?? result.nModified;
        if (!changed) {
            return res.status(404).json({ success: false, message: "File not found or already deleted." });
        }

        return res.status(200).json({ success: true, message: "File deleted successfully." });
    } catch (err) {
        console.error("Error deleting file:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};
  

module.exports = delete_sheet;
