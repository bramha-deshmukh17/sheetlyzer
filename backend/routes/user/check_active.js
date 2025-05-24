const User = require('../../models/User');

async function checkActive(req, res, next) {
    const { sub } = req.oidc.user;
    const user = await User.findOne({ auth0Id: sub });
    if (!user) {
        return res.status(401).json({ error: "User not found" });
    }
    if (user.accountStatus !== 'active') {
        return res.status(403).json({ error: "Account suspended" });
    }
    next();
}

module.exports = checkActive;