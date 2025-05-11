//HERE WE ARE CHECING THAT USER IS AUTHENTICATED OR NOT

const UserLogin = (req, res) => {
    if (req.oidc.isAuthenticated()) {
        return res.redirect(`${process.env.FRONTEND_URL}/user/dashboard`);
    }


    res.oidc.login({
        returnTo: `${process.env.FRONTEND_URL}/user/dashboard`,
        authorizationParams: {
            redirect_uri: process.env.AUTH0_CALLBACK_URL
        }
    });
}

//user logout
const UserLogout = (req, res) => {
    // clears your app’s cookies
    res.clearCookie('token');

    // tells express-openid-connect to destroy both local and Auth0 session
    return res.oidc.logout({
        logoutParams: { returnTo: process.env.FRONTEND_URL + '/' }
    }); 
    res.status(200).json({ success: true });

};

module.exports = {UserLogin, UserLogout}