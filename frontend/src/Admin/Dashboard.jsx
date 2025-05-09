import React, { useEffect, useState } from 'react';
import { useTheme } from '../Utility/Theme';
import { FaLightbulb, FaSignOutAlt } from 'react-icons/fa';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { theme, toggleDarkMode } = useTheme();
    const URI = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const [newUsersData, setNewUsersData] = useState([]);
    const [loginData, setLoginData] = useState([]);

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
            <nav className="flex items-center justify-between p-4 shadow-md transition-colors duration-300">
                <ul className="flex space-x-6">
                    {['Home', 'Admins', 'Users'].map(item => (
                        <li key={item}>
                            <button
                                onClick={() => navigate(`/admin/${item.toLowerCase()}`)}
                                className="transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none"
                            >
                                {item}
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="flex items-center space-x-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        className="p-2 rounded-full transition-transform duration-300 transform hover:scale-110 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                    >
                        <FaLightbulb className="text-2xl" />
                    </button>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="flex items-center px-4 py-2 rounded-lg shadow transition-colors duration-300 hover:bg-red-100 dark:hover:bg-red-700 focus:outline-none"
                    >
                        <FaSignOutAlt className="text-lg mr-2" />
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-6 grid grid-cols-1 gap-6">
                {/* New Users Line Chart */}
                <div className="card p-4 w-2/3 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">New Users This Week</h2>
                    
                </div>

                {/* User Logins Bar Chart */}
                <div className="card p-4 w-2/3 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">User Logins Today</h2>
                    
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
