import { useEffect, useState } from 'react';
import { useTheme } from '../Utility/Theme';
import { FaLightbulb, FaSignOutAlt, FaDatabase, FaUserShield, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../Utility/AdminNav';

const AdminDashboard = () => {
    const { theme, toggleDarkMode } = useTheme();
    const URI = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const [newUsersData, setNewUsersData] = useState([]);
    const [loginData, setLoginData] = useState([]);
    const role = localStorage.getItem('adminRole');

    // fetch analytics data
    useEffect(() => {
        fetch(`${URI}/admin/analytics`, {
            method: 'GET',
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                setNewUsersData(data.newUsers);
                setLoginData(data.logins);
            })
            .catch(err => console.error('Analytics fetch error:', err));
    }, [URI]);

    const logout = () => {
        fetch(`${URI}/admin/logout`, {
            method: 'POST',
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    navigate('/admin/login');
                }
            })
            .catch(err => console.error('Logout error:', err));
    };

    return (
        <div className={`min-h-screen `}>
            {/* Navbar */}
            <AdminNavbar />
            
            {/* Main Content */}
            <main className="p-6 flex flex-col items-center space-y-6">
                {/* New Users Line Chart */}
                <div className="card p-4 w-2/3 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">New Users This Week</h2>

                </div>

                {/* User Logins Bar Chart */}
                <div className="card p-4 w-2/3 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">User Logins Today</h2>

                </div>
                <div className="w-full max-w-2xl flex flex-col space-y-6">
                    {/* Manage Admins */}
                    {role === 'superadmin' && (
                        <div
                            className="p-6 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
                            onClick={() => navigate('/admin/view/admin')}
                        >
                            <div className="flex items-center space-x-3">
                                <FaUserShield className="text-2xl" />
                                <div>
                                    <h2 className="text-xl font-semibold">Manage Admins</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        View, add, or remove administrator accounts
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Manage Users */}
                    <div
                        className="p-6 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
                        onClick={() => navigate('/admin/view/user')}
                    >
                        <div className="flex items-center space-x-3">
                            <FaUsers className="text-2xl" />
                            <div>
                                <h2 className="text-xl font-semibold">Manage Users</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    View, update, or deactivate user accounts
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
