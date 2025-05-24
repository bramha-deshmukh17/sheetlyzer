import { useTheme } from "../Utility/Theme";
import { useState, useEffect } from 'react';
import { FaHistory, FaTrash, FaEye, FaLightbulb, FaHome, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import UserNavbar from '../Utility/UserNav';

const FileHistory = () => {
    const URI = import.meta.env.VITE_BACKEND_URL;
    const { theme, toggleDarkMode } = useTheme();
    const [history, setHistory] = useState([]);
    const [viewedFile, setViewedFile] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Determine mode: 'view' or 'manage'
    const mode = location.state?.mode || 'manage';
    const showDelete = mode === 'manage';

    // Fetch history
    const fetchHistory = () => {
        fetch(`${URI}/user/file/history`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => { if (data.success) setHistory(data.history); })
            .catch(err => console.error(err));
    };
    useEffect(() => fetchHistory(), []);

    // Delete entry
    const deleteEntry = (id) => {
        fetch(`${URI}/user/file/delete/${id}`, { method: 'DELETE', credentials: 'include' })
            .then(res => res.json())
            .then(data => data.success && fetchHistory())
            .catch(err => console.error(err));
    };
    const confirmAndDelete = (id) => {
        setPendingDeleteId(id);
        setShowConfirmModal(true);
    };
    const handleConfirmDelete = () => {
        if (pendingDeleteId) deleteEntry(pendingDeleteId);
        setShowConfirmModal(false);
        setPendingDeleteId(null);
    };
    const handleCancelDelete = () => {
        setShowConfirmModal(false);
        setPendingDeleteId(null);
    };

    // View entry
    const viewEntry = (id) => {
        fetch(`${URI}/user/file/view/${id}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => data.success && setViewedFile(data.file))
            .catch(err => console.error(err));
    };

    const logout = () => {
        window.location.href = `${URI}/user/logout`;
    };

    // Overlay style
    const overlayStyle = { backgroundColor: 'var(--overlay-bg)' };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            {/* Navbar */}
             <UserNavbar />

            <main className="flex-1 p-6 overflow-y-auto">
                <h1 className="text-3xl font-bold mb-6">File Upload History</h1>

                {/* View File Modal */}
                {viewedFile && (
                    <div className="fixed inset-0 flex items-center justify-center z-50" style={overlayStyle}>
                        <div className="w-11/12 max-w-4xl p-6 rounded-lg shadow-lg" style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}>
                            <h2 className="text-xl font-bold mb-4">Viewing: {viewedFile.fileName}</h2>
                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                <table className="min-w-full table-auto border">
                                    <button
                                        onClick={() => setViewedFile(null)}
                                        className="absolute top-35 right-1/4 text-2xl"
                                    >
                                        ×
                                    </button>
                                    <thead className="bg-gray-100 dark:bg-gray-600">
                                        <tr>
                                            {viewedFile.fileData[0] && Object.keys(viewedFile.fileData[0]).map((key, idx) => (
                                                <th key={idx} className="px-3 py-2 text-left text-sm font-medium">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewedFile.fileData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                                                {Object.values(row).map((val, i) => (
                                                    <td key={i} className="px-3 py-2 text-sm">{val}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 flex justify-center items-center z-50" style={overlayStyle}>
                        <div className="p-6 rounded shadow-md" style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}>
                            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                            <p className="mb-4">Are you sure you want to delete this file? This action cannot be undone.</p>
                            <div className="flex justify-end space-x-4">
                                <button onClick={handleCancelDelete} className="px-4 py-2 rounded hover:opacity-80" style={{ backgroundColor: "gray", color: "#fff" }}>Cancel</button>
                                <button onClick={handleConfirmDelete} className="px-4 py-2 rounded hover:opacity-90" style={{ backgroundColor: "red", color: "#fff" }}>Delete</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* History Table */}
                {history.length === 0 ? (
                    <p className="text-gray-500">No upload history found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border">
                            <thead className="bg-gray-100 dark:bg-gray-600">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium">File Name</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium">Uploaded At</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium">View</th>
                                    {showDelete && <th className="px-4 py-2 text-center text-sm font-medium">Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                                        <td className="px-4 py-2 text-sm">{item.name}</td>
                                        <td className="px-4 py-2 text-sm">{new Date(item.uploadedAt).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => viewEntry(item._id)} className="hover:text-blue-700">
                                                <FaEye />
                                            </button>
                                        </td>
                                        {showDelete && (
                                            <td className="px-4 py-2 text-center">
                                                <button onClick={() => confirmAndDelete(item._id)} className="hover:text-red-700">
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FileHistory;
