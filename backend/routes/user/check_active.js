const User = require('../../models/User');

async function checkActive(req, res, next) {
    const { sub, name, email, picture } = req.oidc.user;
    let user = await User.findOne({ auth0Id: sub });
    if (!user) {
        user = await User.create({ auth0Id: sub, name, email, picture });
    }
    if (user.accountStatus !== 'active') {
        return res.status(403).json({ error: "Account suspended" });
    }
    next();
}

module.exports = checkActive;