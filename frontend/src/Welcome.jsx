import React from 'react';
import { useTheme } from "./Utility/Theme";
import { FaLightbulb } from "react-icons/fa";


const  Welcome = ()=> {
    const { theme, toggleDarkMode } = useTheme();
    const URI = import.meta.env.VITE_BACKEND_URL;
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="shadow-2xl rounded-2xl p-10 max-w-2xl w-full text-center">
                <h1 className="text-4xl font-bold mb-4">
                    Welcome to Sheetlyzer
                </h1>
                <p className="  text-lg mb-8">
                    Upload your Excel files, analyze data with powerful 2D/3D charts, and get smart insights instantly.
                </p>
                <button
                    onClick={toggleDarkMode}
                    className="float-right p-2 rounded-full hover:bg-gray-200 "
                    title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                >
                    <FaLightbulb
                        className={`text-4xl ${theme === 'dark' ? 'text-yellow-400' : 'text-black'}`}
                    />
                </button>

                <div className="mt-8 flexjustify-center space-x-4">
                    <button
                        onClick={()=> window.location.href = `${URI}/user/login`}
                        className="px-5 py-3 text-lg rounded bg-yellow-600 text-white hover:bg-blue-700"
                    >
                        Login / Signup
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Welcome;