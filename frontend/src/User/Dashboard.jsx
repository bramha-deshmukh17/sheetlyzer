import { useState } from 'react';
import { useTheme } from "../Utility/Theme";
import {  FaUpload,  FaHistory, FaDatabase,  FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserNavbar  from '../Utility/UserNav';

const Dashboard = () => {
    const { theme, toggleDarkMode } = useTheme();
    const URI = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [saveToDb, setSaveToDb] = useState(true); 

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
    };

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("saveToDb", saveToDb); 

        fetch(`${URI}/user/file/parse`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
            .then(res => res.json())
            .then(resData => {
                if (resData.success) {
                    navigate('/user/file/analysis', {
                        state: {
                            parsedData: resData.data,
                            columns: Object.keys(resData.data[0] || {}),
                            aiInsights: resData.aiInsights
                        }
                    });
                } else {
                    alert("Parsing failed: " + resData.message);
                }
            });
    };


    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            {/* Navbar */}
            <UserNavbar />

            {/* Main Content */}
            <main className="p-6 flex flex-col items-center flex-1 overflow-y-auto space-y-6">
                <h1 className="text-3xl font-bold">User Dashboard</h1>

                {/* Upload Card */}
                <div className="w-full max-w-2xl p-6 rounded-lg shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
                    <label htmlFor="file-input" className="flex items-center cursor-pointer space-x-2 p-2 border rounded" style={{ borderColor: 'var(--text-color)' }}>
                        <FaUpload className="text-xl" />
                        <span>{file ? file.name : 'Choose CSV or XLSX'}</span>
                        <input id="file-input" type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button onClick={handleUpload} className="mt-4 sm:mt-0 px-4 py-2 rounded transition-colors hover:opacity-90" style={{ backgroundColor: 'var(--text-color)', color: 'var(--bg-color)' }}>
                        Upload &amp; Parse
                    </button>
                </div>

                {/* Checkbox for saving to database */}
                <div className="flex items-center space-x-2 mt-4">
                    <input
                        type="checkbox"
                        id="saveToDb"
                        checked={saveToDb}
                        onChange={e => setSaveToDb(e.target.checked)}
                    />
                    <label htmlFor="saveToDb">Save uploaded data to my account</label>
                </div>

                {/* Action Cards (stacked vertically) */}
                <div className="w-full max-w-2xl flex flex-col space-y-4">
                    {/* View History */}
                    <div
                        className="p-6 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
                        onClick={() => navigate('/user/file/history', { state: { mode: 'view' } })}
                    >
                        <div className="flex items-center space-x-3">
                            <FaHistory className="text-2xl" />
                            <div>
                                <h2 className="text-xl font-semibold">View History</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Browse upload records</p>
                            </div>
                        </div>
                    </div>

                    {/* Manage Data */}
                    <div
                        className="p-6 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
                        onClick={() => navigate('/user/file/history', { state: { mode: 'manage' } })}
                    >
                        <div className="flex items-center space-x-3">
                            <FaDatabase className="text-2xl" />
                            <div>
                                <h2 className="text-xl font-semibold">Manage My Data</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Delete or update records</p>
                            </div>
                        </div>
                    </div>

                    {/* View Graph */}
                    <div
                        className="p-6 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
                        onClick={() => navigate('/user/graph/view')}
                    >
                        <div className="flex items-center space-x-3">
                            <FaChartLine className="text-2xl" />
                            <div>
                                <h2 className="text-xl font-semibold">View Graph</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Visualize your data trends</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;
