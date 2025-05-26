import React, { useState, useRef, useEffect } from 'react';
import { FaLightbulb, FaSignOutAlt, FaHome, FaHistory, FaDatabase, FaChartLine, FaBars, FaUser, FaChevronDown } from 'react-icons/fa';
import { useTheme } from './Theme';
import { useNavigate } from 'react-router-dom';

/**
 * UserNavbar: hard-coded navigation for the User Dashboard
 */
export default function UserNavbar() {
    const { theme, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef();

    const logout = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/user/logout`;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

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

                {/* Profile/Logout Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen((open) => !open)}
                        className="flex items-center cursor-pointer px-4 py-2 rounded-lg shadow transition-colors duration-300 focus:outline-none"
                    >
                        <FaUser className="text-lg mr-2" />
                        <span>Account</span>
                        <FaChevronDown className="ml-1" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 rounded shadow-lg py-2 z-50" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
                            <button
                                onClick={() => { setDropdownOpen(false); navigate('/user/profile'); }}
                                className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-400 transition-colors"
                        >
                            <FaUser className="mr-2" /> Profile
                        </button>
                        <button
                            onClick={logout}
                            className="w-full flex items-center px-4 py-2 text-left hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-red-300 transition-colors"
                        >
                            <FaSignOutAlt className="mr-2" /> Logout
                        </button>
                    </div>
                    )}
                </div>
            </div>
        </nav>

    );
}