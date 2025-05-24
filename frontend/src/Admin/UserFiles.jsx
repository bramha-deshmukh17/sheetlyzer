import { useEffect, useState } from "react";
import { FaEye, FaTrash, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../Utility/AdminNav";

const URI = import.meta.env.VITE_BACKEND_URL;

const UserFiles = () => {
    const { userId } = useParams();
    const [files, setFiles] = useState([]);
    const [viewedFile, setViewedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${URI}/admin/user/files/${userId}`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (data.success) setFiles(data.files);
                else setError(data.error || "Failed to fetch files");
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch files");
                setLoading(false);
            });
    }, [userId]);

    const handleView = (file) => setViewedFile(file);

    const handleDelete = (fileId) => {
        setPendingDeleteId(fileId);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = () => {
        fetch(`${URI}/admin/user/file/delete/${userId}/${pendingDeleteId}`, {
            method: "DELETE",
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setFiles(files => files.filter(f => f._id !== pendingDeleteId));
                setShowConfirmModal(false);
                setPendingDeleteId(null);
            })
            .catch(() => {
                setShowConfirmModal(false);
                setPendingDeleteId(null);
            });
    };

    const handleCancelDelete = () => {
        setShowConfirmModal(false);
        setPendingDeleteId(null);
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            <AdminNavbar />
            <main className="flex-1 p-6 overflow-y-auto">
                <button
                    className="mb-6 flex items-center gap-2 px-4 py-2 rounded transition-colors"
                    style={{
                        background: "var(--overlay-bg)",
                        color: "var(--text-color)",
                        border: "none"
                    }}
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft /> Back
                </button>
                <h1 className="text-2xl font-bold mb-6">User Files</h1>
                {error && <div className="text-red-600 mb-2">{error}</div>}
                {loading ? (
                    <div>Loading...</div>
                ) : files.length === 0 ? (
                    <p className="text-gray-500">No files found for this user.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table
                            className="min-w-full table-auto border rounded-lg shadow"
                            style={{ background: "var(--bg-color)", color: "var(--text-color)" }}
                        >
                            <thead style={{ background: "var(--overlay-bg)" }}>
                                <tr className="border-b">
                                    <th className="px-4 py-2 text-left text-sm font-medium">File Name</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium">Uploaded At</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium">View</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map(file => (
                                    <tr
                                        key={file._id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-2 text-sm break-all">{file.fileName}</td>
                                        <td className="px-4 py-2 text-sm">{file.fileType}</td>
                                        <td className="px-4 py-2 text-sm">{new Date(file.createdAt).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                onClick={() => handleView(file)}
                                                className="hover:text-blue-600 text-lg transition-colors"
                                                title="View"
                                                style={{ background: "none", border: "none" }}
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                onClick={() => handleDelete(file._id)}
                                                className="hover:text-red-600 text-lg transition-colors"
                                                title="Delete"
                                                style={{ background: "none", border: "none" }}
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

                {/* View File Modal */}
                {viewedFile && (
                    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'var(--overlay-bg)' }}>
                        <div className="relative w-11/12 max-w-4xl p-6 rounded-lg shadow-lg" style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}>
                            <button
                                onClick={() => setViewedFile(null)}
                                className="absolute top-2 right-4 text-2xl hover:text-red-600"
                                style={{ background: "none", border: "none" }}
                                title="Close"
                            >
                                ×
                            </button>
                            <h2 className="text-xl font-bold mb-4">Viewing: {viewedFile.fileName}</h2>
                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                <table className="min-w-full table-auto border">
                                    <thead style={{ background: "var(--overlay-bg)" }}>
                                        <tr>
                                            {viewedFile.fileData[0] && Object.keys(viewedFile.fileData[0]).map((key, idx) => (
                                                <th key={idx} className="px-3 py-2 text-left text-sm font-medium">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewedFile.fileData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
                    <div className="fixed inset-0 flex justify-center items-center z-50" style={{ backgroundColor: 'var(--overlay-bg)' }}>
                        <div className="p-6 rounded shadow-md" style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}>
                            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                            <p className="mb-4">Are you sure you want to delete this file? This action cannot be undone.</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-4 py-2 rounded hover:opacity-80"
                                    style={{ backgroundColor: "gray", color: "#fff", border: "none" }}
                                >Cancel</button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 rounded hover:opacity-90"
                                    style={{ backgroundColor: "red", color: "#fff", border: "none" }}
                                >Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default UserFiles;