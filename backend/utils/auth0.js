
const { ManagementClient } = require('auth0');

module.exports = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN2,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    scope: 'read:users update:users'
});
    