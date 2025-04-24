import React from 'react';
import { useEffect } from "react";
import { useTheme } from "../Utility/Theme";
import { FaLightbulb } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 

const AdminDashboard = () => {
    const { theme, toggleDarkMode } = useTheme();
    const URI = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate(); 

    //here we are checking that only logged in admin can view this dashboard by sending request to the backend for verification
    useEffect(() => {
        fetch(`${URI}/admin/dashboard`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    navigate("/admin/login");
                } 
            })
            .catch((error) => console.error("Validation error:", error.message));
    }, [navigate, URI]);

    //this is logout which will send request to destroy admin token in backend
    const logout = () => {
        fetch(`${URI}/admin/logout`, {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    navigate("/admin/login"); 
                }
            })
            .catch((error) => console.error("Logout error:", error.message));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="shadow-2xl rounded-2xl p-10 max-w-2xl w-full text-center relative">
                <h1 className="text-4xl font-bold mb-4">Welcome to Sheetlyzer</h1>
                <p className="text-lg mb-8">
                    Upload your Excel files, analyze data with powerful 2D/3D charts, and get smart insights instantly.
                </p>

               
                <button
                    onClick={logout}
                    className="px-5 py-3 text-lg rounded bg-yellow-600 text-white hover:bg-blue-700 z-10 relative"
                >
                    Logout
                </button>

                <button
                    onClick={toggleDarkMode}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200"
                    title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                >
                    <FaLightbulb
                        className={`text-4xl ${theme === 'dark' ? 'text-yellow-400' : 'text-black'}`}
                    />
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
