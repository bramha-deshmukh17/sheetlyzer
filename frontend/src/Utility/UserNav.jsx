import React, { useState } from 'react';
import { FaLightbulb, FaSignOutAlt, FaHome, FaHistory, FaDatabase, FaChartLine, FaBars } from 'react-icons/fa';
import { useTheme } from './Theme';
import { useNavigate } from 'react-router-dom';

/**
 * UserNavbar: hard-coded navigation for the User Dashboard
 */
export default function UserNavbar() {
    const { theme, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const logout = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/user/logout`;
    };

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between p-4 shadow-md transition-colors duration-300" style={{backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            {/* Hamburger for mobile */}
            <button
                className="md:hidden p-2 rounded focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Open menu"
            >
                <FaBars className="text-2xl" />
            </button>

            {/* Main nav links */}
            <div className={`flex-col md:flex-row md:flex space-y-4 md:space-y-0 md:space-x-6 absolute md:static left-0 top-16 w-full md:w-auto md:bg-transparent p-4 md:p-0 shadow md:shadow-none transition-all duration-300 ${menuOpen ? 'flex' : 'hidden md:flex'}`} style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
                <button onClick={() => { setMenuOpen(false); navigate('/user/dashboard'); }} className="flex items-center space-x-1 transition-colors duration-300 hover:text-blue-300 focus:outline-none">
                    <FaHome /><span>Home</span>
                </button>
                <button onClick={() => { setMenuOpen(false); navigate('/user/file/history', { state: { mode: 'view' } }); }} className="flex items-center space-x-1 transition-colors duration-300 hover:text-blue-300 focus:outline-none">
                    <FaHistory /><span>History</span>
                </button>
                <button onClick={() => { setMenuOpen(false); navigate('/user/file/history', { state: { mode: 'manage' } }); }} className="flex items-center space-x-1 transition-colors duration-300 hover:text-blue-300 focus:outline-none">
                    <FaDatabase /><span>View Data</span>
                </button>
                <button onClick={() => { setMenuOpen(false); navigate('/user/graph/view', { state: { mode: 'manage' } }); }} className="flex items-center space-x-1 transition-colors duration-300 hover:text-blue-300 focus:outline-none">
                    <FaChartLine /><span>View Graph</span>
                </button>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleDarkMode}
                    title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    className="p-2 rounded-full transition-transform duration-300 transform hover:scale-110 hover:bg-gray-700 focus:outline-none"
                >
                    <FaLightbulb className="text-2xl" />
                </button>

                <button
                    onClick={logout}
                    className="flex items-center px-4 py-2 rounded-lg shadow transition-colors duration-300 hover:bg-red-700 focus:outline-none"
                >
                    <FaSignOutAlt className="text-lg mr-2" />
                    Logout
                </button>
            </div>
        </nav>

    );
}