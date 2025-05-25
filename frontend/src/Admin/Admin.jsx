import AdminNavbar from "../Utility/AdminNav";
import { useEffect, useState } from "react";
import { FaUserCheck, FaTrash, FaUserSlash } from "react-icons/fa";

const URI = import.meta.env.VITE_BACKEND_URL;

const Admin = () => {
    const [admins, setAdmins] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ username: "", password: "", role: "admin" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Fetch all admins
    const fetchAdmins = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${URI}/admin/all`, { credentials: "include" });
            const data = await res.json();
            if (data.success) setAdmins(data.admins);
            else setError(data.error || "Failed to fetch admins");
        } catch {
            setError("Failed to fetch admins");
        }
        setLoading(false);
    };

    useEffect(() => { fetchAdmins(); }, []);

    // Create admin
    const handleCreate = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");
        try {
            const res = await fetch(`${URI}/admin/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newAdmin)
            });
            const data = await res.json();
            if (data.message) {
                setSuccess("Admin created!");
                setShowCreate(false);
                setNewAdmin({ username: "", password: "", role: "admin" });
                fetchAdmins();
            } else setError(data.error || "Failed to create admin");
        } catch {
            setError("Failed to create admin");
        }
    };

    // Suspend, Activate, Delete
    const handleAction = async (id, action) => {
        setError(""); setSuccess("");
        let url = `${URI}/admin/${action}/${id}`;
        let method = action === "delete" ? "DELETE" : "PATCH";
        try {
            const res = await fetch(url, { method, credentials: "include" });
            const data = await res.json();
            if (data.message) {
                setSuccess(data.message);
                fetchAdmins();
            } else setError(data.error || "Operation failed");
        } catch {
            setError("Operation failed");
        }
    };

    // Confirm delete handler
    const confirmDelete = (admin) => setDeleteTarget(admin);

    // Actually delete after confirmation
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
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Manage Admins</h2>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                            onClick={() => setShowCreate(true)}
                        >Create Admin</button>
                    </div>
                    {error && <div className="text-red-600 mb-2">{error}</div>}
                    {success && <div className="text-green-600 mb-2">{success}</div>}
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                            <table className="w-full border rounded-lg shadow" style={{ background: "var(--bg-color)", color: "var(--text-color)" }}>
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-2">Username</th>
                                        <th className="p-2">Role</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Modify</th>
                                        <th className="p-2">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin) => {
                                        const isOnlySuperadmin =
                                            admin.role === "superadmin" &&
                                            admins.filter((a) => a.role === "superadmin" && a.accountStatus === "active").length === 1;

                                        return (
                                            <tr
                                                key={admin._id}
                                                className="border-b text-center hover:bg-gray-400"
                                            >
                                                <td className="p-2">{admin.username}</td>
                                                <td className="p-2">{admin.role}</td>
                                                <td className="p-2">{admin.accountStatus}</td>
                                                {/* Modify action */}
                                                <td className="p-2">
                                                    {!isOnlySuperadmin && (
                                                        admin.accountStatus === "active" ? (
                                                            <button
                                                                className="p-2 rounded text-current hover:text-yellow-500"
                                                                onClick={() => handleAction(admin._id, "suspend")}
                                                                title="Suspend"
                                                            >
                                                                <FaUserSlash />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="p-2 rounded text-current hover:text-green-600"
                                                                onClick={() => handleAction(admin._id, "activate")}
                                                                title="Activate"
                                                            >
                                                                <FaUserCheck />
                                                            </button>
                                                        )
                                                    )}
                                                </td>
                                                {/* Delete action */}
                                                <td className="p-2">
                                                    {!isOnlySuperadmin && (
                                                        <button
                                                            className="p-2 rounded text-current hover:text-red-600"
                                                            onClick={() => confirmDelete(admin)}
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                    )}

                    {/* Delete Confirmation Modal */}
                    {deleteTarget && (
                        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50" style={{ backgroundColor: "var(--overlay-bg)" }}>
                            <div className=" p-6 rounded shadow-md w-80" style={{ backgroundColor: "var(--bg-color)" }}>
                                <h3 className="text-lg font-bold mb-4 text-center text-red-600">Confirm Delete</h3>
                                <p className="mb-4 text-center">
                                    Are you sure you want to delete admin <b>{deleteTarget.username}</b>?
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

                    {/* Create Admin Modal */}
                    {showCreate && (
                        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50" style={{ backgroundColor: "var(--overlay-bg)" }}>
                            <form
                                className="p-6 rounded shadow-md w-80"
                                onSubmit={handleCreate}
                                style={{ backgroundColor: "var(--bg-color)" }}
                            >
                                <h3 className="text-lg font-bold mb-4">Create Admin</h3>
                                <label className="block mb-2">
                                    Username
                                    <input
                                        className="w-full border p-2 rounded mt-1"
                                        value={newAdmin.username}
                                        onChange={e => setNewAdmin(a => ({ ...a, username: e.target.value }))}
                                        required
                                    />
                                </label>
                                <label className="block mb-2">
                                    Password
                                    <input
                                        type="password"
                                        className="w-full border p-2 rounded mt-1"
                                        value={newAdmin.password}
                                        onChange={e => setNewAdmin(a => ({ ...a, password: e.target.value }))}
                                        required
                                    />
                                </label>
                                <label className="block mb-4">
                                    Role
                                    <select
                                        className="w-full border p-2 rounded mt-1"
                                        value={newAdmin.role}
                                        onChange={e => setNewAdmin(a => ({ ...a, role: "admin" }))}
                                        disabled // always disabled, only admin can be created
                                    >
                                        <option value="admin">Admin</option>
                                    </select>
                                </label>
                                <div className="flex justify-end space-x-2">
                                    <button type="button" className="px-3 py-1 bg-gray-300 text-black rounded" onClick={() => setShowCreate(false)}>Cancel</button>
                                    <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Create</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Admin;