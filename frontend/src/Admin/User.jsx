import React, { useEffect, useState } from "react";
import AdminNavbar from "../Utility/AdminNav";
import { useNavigate } from "react-router-dom";
import { FaEye, FaTrash, FaUserSlash, FaUserCheck, FaFileAlt } from "react-icons/fa";

const URI = import.meta.env.VITE_BACKEND_URL;

const  ManageUsers = ()=> {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${URI}/admin/users`, { credentials: "include" });
            const data = await res.json();
            if (data.success) setUsers(data.users);
            else setError(data.error || "Failed to fetch users");
        } catch {
            setError("Failed to fetch users");
        }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleAction = async (id, action) => {
        setError(""); setSuccess("");
        let url = `${URI}/admin/user/${action}/${id}`;
        let method = action === "delete" ? "DELETE" : "PATCH";
        try {
            const res = await fetch(url, { method, credentials: "include" });
            const data = await res.json();
            if (data.message) {
                setSuccess(data.message);
                fetchUsers();
            } else setError(data.error || "Operation failed");
        } catch {
            setError("Operation failed");
        }
    };

    const confirmDelete = (user) => setDeleteTarget(user);
    const handleDeleteConfirmed = () => {
        if (deleteTarget) {
            handleAction(deleteTarget._id, "delete");
            setDeleteTarget(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            <AdminNavbar />
            <main className="flex-1 p-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
                    {error && <div className="text-red-600 mb-2">{error}</div>}
                    {success && <div className="text-green-600 mb-2">{success}</div>}
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                            <div className="overflow-x-auto">
                                <table
                                    className="min-w-[900px] w-full border rounded-lg shadow"
                                    style={{ background: "var(--bg-color)", color: "var(--text-color)" }}
                                >
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-3 text-left">Auth0 ID</th>
                                            <th className="p-3 text-left">Name</th>
                                            <th className="p-3 text-left">Email</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-left">Files</th>
                                            <th className="p-3">Modify</th>
                                            <th className="p-3">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr
                                                key={user._id}
                                                className="border-b text-center"
                                            >
                                                <td className="p-3 break-all text-left">{user.auth0Id}</td>
                                                <td className="p-3 text-left">{user.name}</td>
                                                <td className="p-3 text-left">{user.email}</td>
                                                <td className="p-3 text-left">{user.accountStatus || "active"}</td>
                                                <td className="p-3 text-center">
                                                    <button
                                                        className="p-2 rounded text-current hover:text-blue-600"
                                                        title="View Files"
                                                        onClick={() => navigate(`/admin/user/${user._id}/files`)}
                                                    >
                                                        <FaFileAlt />
                                                    </button>
                                                </td>
                                                {/* Modify action */}
                                                <td className="p-3">
                                                    {user.accountStatus === "active" ? (
                                                        <button
                                                            className="p-2 rounded text-current hover:text-yellow-500"
                                                            onClick={() => handleAction(user._id, "suspend")}
                                                            title="Suspend"
                                                        >
                                                            <FaUserSlash />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="p-2 rounded text-current hover:text-green-600"
                                                            onClick={() => handleAction(user._id, "activate")}
                                                            title="Activate"
                                                        >
                                                            <FaUserCheck />
                                                        </button>
                                                    )}
                                                </td>
                                                {/* Delete action */}
                                                <td className="p-3">
                                                    <button
                                                        className="p-2 rounded text-current hover:text-red-600"
                                                        onClick={() => confirmDelete(user)}
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

                    {/* Delete Confirmation Modal */}
                    {deleteTarget && (
                        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50" style={{ backgroundColor: "var(--overlay-bg)" }}>
                            <div className="p-6 rounded shadow-md w-80" style={{ backgroundColor: "var(--bg-color)" }}>
                                <h3 className="text-lg font-bold mb-4 text-center text-red-600">Confirm Delete</h3>
                                <p className="mb-4 text-center">
                                    Are you sure you want to delete user <b>{deleteTarget.name || deleteTarget.email}</b>?
                                </p>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        className="px-3 py-1 text-black bg-gray-300 rounded"
                                        onClick={() => setDeleteTarget(null)}
                                    >Cancel</button>
                                    <button
                                        className="px-3 py-1 bg-red-600 text-white rounded"
                                        onClick={handleDeleteConfirmed}
                                    >Delete</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default ManageUsers;