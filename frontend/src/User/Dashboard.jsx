import { useState, useEffect } from 'react';
import { useTheme } from "../Utility/Theme";
import { FaLightbulb, FaUpload, FaDownload, FaHistory, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { theme, toggleDarkMode } = useTheme();
    const URI = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [history, setHistory] = useState([]);
    const [lastParsedData, setLastParsedData] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('uploadHistory');
        if (stored) {
            setHistory(JSON.parse(stored));
        }
    }, []);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
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
                    const columns = Object.keys(resData.data[0] || {});
                    setLastParsedData(resData.data);

                    const newEntry = {
                        id: Date.now(),
                        name: file.name,
                        time: new Date().toLocaleString(),
                        rows: resData.data.length,
                        columns
                    };

                    const newHistory = [newEntry, ...history];
                    setHistory(newHistory);
                    localStorage.setItem('uploadHistory', JSON.stringify(newHistory));

                    navigate('/user/file-analysis', {
                        state: { parsedData: resData.data, columns }
                    });
                } else {
                    alert("Parsing failed: " + resData.message);
                }
            });
    };

    const logout = () => {
        window.location.href = `${URI}/user/logout`;
    };

    const downloadData = (format) => {
        if (!lastParsedData) {
            alert("No parsed data to download.");
            return;
        }

        let blob, filename;
        if (format === 'json') {
            blob = new Blob([JSON.stringify(lastParsedData, null, 2)], { type: 'application/json' });
            filename = 'parsed_data.json';
        } else {
            const csv = [
                Object.keys(lastParsedData[0]).join(','),
                ...lastParsedData.map(row =>
                    Object.values(row).map(val => `"${val}"`).join(',')
                )
            ].join('\n');
            blob = new Blob([csv], { type: 'text/csv' });
            filename = 'parsed_data.csv';
        }

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const deleteHistory = (id) => {
        const updated = history.filter(item => item.id !== id);
        setHistory(updated);
        localStorage.setItem('uploadHistory', JSON.stringify(updated));
    };

    return (
        <div className={`min-h-screen p-6 flex flex-col items-center`}>
            <div className="w-full mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <button onClick={toggleDarkMode} className="p-2 rounded-full hover:scale-110 transition-transform" title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                        <FaLightbulb className="text-2xl" />
                    </button>
                    <button onClick={logout} className="px-4 py-2 rounded-lg shadow">Logout</button>
                </div>
            </div>

            <div className="w-full max-w-2xl p-4 rounded-lg shadow mb-6 flex items-center justify-center space-x-4">
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
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Upload & Parse
                </button>
            </div>

            {lastParsedData && (
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Download Parsed Data:</h3>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => downloadData('csv')}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            <FaDownload />
                            <span>CSV</span>
                        </button>
                        <button
                            onClick={() => downloadData('json')}
                            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                            <FaDownload />
                            <span>JSON</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full max-w-4xl mt-6">
                <h3 className="text-xl font-bold flex items-center mb-3">
                    <FaHistory className="mr-2" /> Analysis History
                </h3>

                {history.length === 0 ? (
                    <p className="text-gray-500">No history yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-4 py-2 border">File Name</th>
                                    <th className="px-4 py-2 border">Date & Time</th>
                                   
                                    <th className="px-4 py-2 border">Information</th>
                                    <th className="px-4 py-2 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => (
                                    <tr key={item.id} className="text-center hover:bg-gray-100">
                                        <td className="px-4 py-2 border">{item.name}</td>
                                        <td className="px-4 py-2 border">{item.time}</td>
                                        
                                        <td className="px-4 py-2 border">{item.columns.join(', ')}</td>
                                        <td className="px-4 py-2 border">
                                            <button
                                                onClick={() => deleteHistory(item.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
