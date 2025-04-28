const User = require('../../models/User');

//here if the user is first time logged in to the web then we are storing the user data using mongodb and returning it
const Profile = async (req, res) => {
    const { sub, name, email, picture } = req.oidc.user;

    try {
        // Find or Create User in MongoDB
        let user = await User.findOne({ auth0Id: sub });
        if (!user) {
            user = await User.create({ auth0Id: sub, name, email, picture });
        }

        // Send back the user data
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve or create user', details: err.message });
    }
}

module.exports = Profile;