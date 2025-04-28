const User = require('../../models/User');

//here if the user is first time logged in to the web then we are storing the user data using mongodb
const Dashboard = async (req, res) => {
    try {
        const userInfo = req.oidc.user;

        if (!userInfo) {
            return res.redirect(`${process.env.FRONTEND_URL}/user/dashboard`);
        }

        let user = await User.findOne({ auth0Id: userInfo.sub });
        if (!user) {
            user = await User.create({
                auth0Id: userInfo.sub,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture
            });
        }

        res.status(200).json({ message: 'Welcome to your dashboard!', user });
    } catch (e) {
        res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
}

module.exports = Dashboard;