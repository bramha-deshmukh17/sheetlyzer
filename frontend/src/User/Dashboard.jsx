import { useState } from 'react';
import { useTheme } from "../Utility/Theme";
import { FaLightbulb, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { theme, toggleDarkMode } = useTheme();
    const URI = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
        console.log(selected);
    };

    const handleUpload = () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        fetch(`${URI}/user/file-parse`, {
            method: 'POST',
            body: formData,
            credentials: 'include'  
        })
            .then(res => res.json())
            .then(resData => {
                if (resData.success) {
                    // Redirect and pass data to /user/file-analysis
                    navigate('/user/file-analysis', {
                        state: {
                            parsedData: resData.data,
                            columns: Object.keys(resData.data[0] || {})
                        }
                    });
                } else {
                    alert("Parsing failed: " + resData.message);
                }
            });

    };

    const logout = () => {
        window.location.href = `${URI}/user/logout`;
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF5'];

    return (
        <div className={`min-h-screen p-6 flex flex-col items-center`}>
            <div className="w-full mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-left">User Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full transition-transform duration-300 transform hover:scale-110 "
                        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    >
                        <FaLightbulb className="text-2xl" />
                    </button>
                    <button
                        onClick={logout}
                        className="px-4 py-2 rounded-lg shadow transition-colors duration-300"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="w-full max-w-2xl p-4 rounded-lg shadow mb-6 flex items-center justify-center">
                <label htmlFor="file-input" className="flex items-center cursor-pointer space-x-2 p-2 border rounded">
                    <FaUpload className="text-xl" />
                    <span>{file ? file.name : 'Choose CSV or XLSX'}</span>
                </label>
                <input
                    id="file-input"
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    onClick={handleUpload}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                >
                    Upload & Parse
                </button>
            </div>

            
        </div>
    );
};

export default Dashboard;
