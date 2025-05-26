import { useEffect, useState } from "react";
import { useTheme } from "../Utility/Theme";
import UserNavbar from "../Utility/UserNav";

const URI = import.meta.env.VITE_BACKEND_URL;

export default function UserProfile() {
    const { theme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ name: "", picture: "" });
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        fetch(`${URI}/user/profile`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setForm({ name: data.name || "", picture: data.picture || "" });
            })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = e => {
        e.preventDefault();
        setMsg("");
        fetch(`${URI}/user/profile/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(form)
        })
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setEdit(false);
                setMsg("Profile updated!");
            })
            .catch(() => setMsg("Update failed"));
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            <UserNavbar />
            <div className="max-w-xl mx-auto mt-10 p-6 rounded shadow" style={{ backgroundColor: 'var(--bg-color)' }}>
                <h1 className="text-2xl font-bold mb-4">My Profile</h1>
                {msg && <div className="mb-2 text-green-600">{msg}</div>}
                {!edit ? (
                    <>
                        <div className="flex items-center space-x-4 mb-4">
                            <img src={profile.picture} alt="profile" className="w-20 h-20 rounded-full border" />
                            <div>
                                <div className="font-semibold text-lg">{profile.name}</div>
                                <div className="text-gray-500">{profile.email}</div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => setEdit(true)}>
                                Edit Profile
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Profile Picture URL</label>
                            <input
                                type="text"
                                name="picture"
                                value={form.picture}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Save</button>
                            <button type="button" className="px-4 py-2 rounded bg-gray-400 text-white" onClick={() => setEdit(false)}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}