const User = require('../../models/User');

async function checkActive(req, res, next) {
    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findOne({ auth0Id });
    if (!user || user.accountStatus !== "active") {
        // Optionally, you can log the user out here
        return res.status(403).json({ success: false, message: "Account is not active" });
    }
    next();
}

module.exports = checkActive;