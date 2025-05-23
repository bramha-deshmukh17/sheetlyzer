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
// routes/user/authenticate.js
const UserLogout = (req, res) => {
    return res.oidc.logout({
        returnTo: `${process.env.FRONTEND_URL}/`
    });
};
  

module.exports = { UserLogin, UserLogout }