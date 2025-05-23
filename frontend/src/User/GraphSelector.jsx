// src/User/GraphSelector.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Utility/Theme";
import { FaLightbulb, FaHome, FaHistory, FaSignOutAlt, FaArrowRight } from "react-icons/fa";

const GraphSelector = () => {
    const { theme, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const URI = import.meta.env.VITE_BACKEND_URL;

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFileId, setSelectedFileId] = useState("");

    useEffect(() => {
        fetch(`${URI}/user/file/all`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setUploadedFiles(data.files);
            });
    }, []);

    const handleProceed = async () => {
        if (!selectedFileId) return;
        try {
            const res = await fetch(`${URI}/user/file/view/${selectedFileId}`, {
                method: 'GET',
                credentials: 'include'
            });
            const resData = await res.json();
            if (resData.success && Array.isArray(resData.file?.fileData) && resData.file.fileData.length) {
                navigate('/user/file/analysis', {
                    state: {
                        parsedData: resData.file.fileData,
                        columns: Object.keys(resData.file.fileData[0] || {}),
                        aiInsights: resData.aiInsights
                    }
                });
            } else {
                alert("Failed to load file data");
            }
        } catch (err) {
            alert("Error loading file data");
        }
    };

    const logout = () => window.location.href = `${URI}/user/logout`;

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            {/* Navbar */}
            <nav className="w-full p-4 flex justify-between items-center" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
                <div className="flex space-x-4">
                    <button onClick={() => navigate('/user/dashboard')} className="flex items-center space-x-1 hover:underline">
                        <FaHome /><span>Home</span>
                    </button>
                    <button onClick={() => navigate('/user/file/history', { state: { mode: 'view' } })} className="flex items-center space-x-1 hover:underline">
                        <FaHistory /><span>History</span>
                    </button>
                    <button onClick={() => navigate('/user/file/history', { state: { mode: 'manage' } })} className="flex items-center space-x-1 hover:underline">
                        <span>View Data</span>
                    </button>
                    <button onClick={() => navigate('/user/graph/view', { state: { mode: 'manage' } })} className="flex items-center space-x-1 hover:underline">
                        <span>View Graph</span>
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={toggleDarkMode} className="p-2 rounded-full hover:opacity-80" title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                        <FaLightbulb />
                    </button>
                    <button onClick={logout} className="flex items-center space-x-1 hover:underline">
                        <FaSignOutAlt /><span>Logout</span>
                    </button>
                </div>
            </nav>

            <h1 className="text-3xl ml-5 font-bold">Select File for Graph View</h1>

            <div className="flex flex-col items-center space-y-4">
                <select
                    value={selectedFileId}
                    onChange={e => setSelectedFileId(e.target.value)}
                    className="p-2 border rounded w-full max-w-md"
                >
                    <option value="">Select an uploaded file</option>
                    {uploadedFiles.map(file => (
                        <option key={file._id} value={file._id}>{file.fileName}</option>
                    ))}
                </select>

                <button
                    onClick={handleProceed}
                    disabled={!selectedFileId}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
                >
                    <span>Proceed</span>
                    <FaArrowRight />
                </button>
            </div>
        </div>
    );
};

export default GraphSelector;
