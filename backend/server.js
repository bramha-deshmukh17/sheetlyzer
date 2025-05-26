require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { UserLogin, UserLogout } = require('./routes/user/authenticate');
const { LoginAdmin, LogoutAdmin } = require('./routes/admin/login');
const authenticate = require('./routes/admin/authenticate');
const fileOps = require('./routes/user/file_ops');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const checkActive = require('./routes/user/check_active');
const { Profile, UpdateProfile } = require('./routes/user/profile');

const {
    verifySuperAdmin,
    createAdmin,
    suspendAdmin,
    activateAdmin,
    deleteAdmin,
    getAllAdmins
} = require('./routes/admin/admin_ops');

const {
    getAllUsers,
    suspendUser,
    activateUser,
    deleteUser,
    getUserFiles,
    deleteUserFile
} = require('./routes/admin/user_ops');
const analyticsRoutes = require('./routes/admin/analytics');

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

// User Routes
app.get('/user/login', UserLogin);
app.get('/user/logout', requiresAuth(), UserLogout);
app.get('/user/profile', requiresAuth(), Profile);
app.patch('/user/profile/update', requiresAuth(), checkActive, UpdateProfile);
app.get('/user/check', requiresAuth(), checkActive, Profile);

// User file routes
app.get('/user/file/all', requiresAuth(), checkActive, fileOps.listUserFiles);
app.get('/user/file/history', requiresAuth(), checkActive, fileOps.userFileHistory);
app.get('/user/file/view/:id', requiresAuth(), checkActive, fileOps.viewUserFile);
app.delete('/user/file/delete/:id', requiresAuth(), checkActive, fileOps.deleteUserSheet);
app.post('/user/file/parse', requiresAuth(), checkActive, upload.single('file'), fileOps.sheetAnalyzer);

// Admin Register Route
app.post('/admin/login', LoginAdmin);
app.get('/admin/login/check', authenticate, (req, res) => {
    res.status(200).json({ message: "Admin already logged in!", userId: req.user.userId });
});
app.post('/admin/logout', LogoutAdmin);

// Admin management routes (superadmin only)
app.get('/admin/all', verifySuperAdmin, getAllAdmins);
app.post('/admin/create', verifySuperAdmin, createAdmin);
app.patch('/admin/suspend/:id', verifySuperAdmin, suspendAdmin);
app.patch('/admin/activate/:id', verifySuperAdmin, activateAdmin);
app.delete('/admin/delete/:id', verifySuperAdmin, deleteAdmin);

// User management routes (admin or superadmin)
app.get('/admin/users', authenticate, getAllUsers);
app.patch('/admin/user/suspend/:id', authenticate, suspendUser);
app.patch('/admin/user/activate/:id', authenticate, activateUser);
app.delete('/admin/user/delete/:id', authenticate, deleteUser);
app.get('/admin/user/files/:id', authenticate, getUserFiles);
app.delete('/admin/user/file/delete/:userId/:fileId', authenticate, deleteUserFile); 
//analytics of new user
app.use(analyticsRoutes);

app.get('/', (req, res) => {
    res.send('Backend running');
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
