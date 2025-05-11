require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const { UserLogin, UserLogout } = require('./routes/user/authenticate');
const Dashboard = require('./routes/user/dashboard');
const Profile = require('./routes/user/profile');

const { LoginAdmin, LogoutAdmin } = require('./routes/admin/login');
const authenticate = require('./routes/admin/authenticate');
const sheet_analyzer = require('./routes/user/sheet_analyzer');

const app = express();
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

// Auth0 Configuration
app.use(auth({
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SESSION_SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_DOMAIN,
    clientSecret: process.env.AUTH0_CLIENT_SECRET
}));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// User Routes
app.get('/user/login', UserLogin);
app.get('/user/logout', requiresAuth(), UserLogout);
app.get('/user/dashboard', requiresAuth(), Dashboard);
app.get('/user/profile', requiresAuth(), Profile);
app.post('/user/file-parse', requiresAuth(), upload.single('file'), sheet_analyzer);

// Admin Register Route
app.post('/admin/login', LoginAdmin);
app.get('/admin/login/check', authenticate, (req, res) => {
    res.status(200).json({ message: "Admin already logged in!", userId: req.user.userId });
});
app.post('/admin/logout', LogoutAdmin);



app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
