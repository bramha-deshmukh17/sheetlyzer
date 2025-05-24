import { FaLightbulb, FaSignOutAlt, FaHome, FaUserShield, FaUsers } from 'react-icons/fa';
import { useTheme } from './Theme';
import { useNavigate } from 'react-router-dom';

export default function AdminNavbar() {
    const { theme, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const URI = import.meta.env.VITE_BACKEND_URL;

    const logout = () => {
        fetch(`${URI}/admin/logout`, {
            method: 'POST',
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                if (!data.error) navigate('/admin/login');
            })
            .catch(err => console.error('Logout error:', err));
    };

    const role = localStorage.getItem('adminRole');

    return (
        <nav className="flex items-center justify-between p-4 shadow-md transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            <div className="flex space-x-6">
                <button onClick={() => navigate('/admin/dashboard')} className="flex items-center space-x-1 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none">
                    <FaHome /><span>Home</span>
                </button>
                {role === 'superadmin' && (
                    <button onClick={() => navigate('/admin/view/admin')} className="flex items-center space-x-1 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none">
                        <FaUserShield /><span>Admins</span>
                    </button>
                )}
                <button onClick={() => navigate('/admin/view/user')} className="flex items-center space-x-1 transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none">
                    <FaUsers /><span>Users</span>
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleDarkMode}
                    title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    className="p-2 rounded-full transition-transform duration-300 transform hover:scale-110 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                >
                    <FaLightbulb className="text-2xl" />
                </button>

                <button
                    onClick={logout}
                    className="flex items-center px-4 py-2 rounded-lg shadow transition-colors duration-300 hover:bg-red-100 dark:hover:bg-red-700 focus:outline-none"
                >
                    <FaSignOutAlt className="text-lg mr-2" />
                    Logout
                </button>
            </div>
        </nav>
    );
}
