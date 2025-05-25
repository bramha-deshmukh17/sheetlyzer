import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, admin = false }) => {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [suspended, setSuspended] = useState(false);

    useEffect(() => {
        const url = admin
            ? `${import.meta.env.VITE_BACKEND_URL}/admin/login/check`
            : `${import.meta.env.VITE_BACKEND_URL}/user/check`;

        fetch(url, {
            method: 'GET',
            credentials: 'include',
        })
            .then(res => {
                if (admin) {
                    if (res.status === 403) {
                        setSuspended(true);
                    } else if (res.status !== 200) {
                        navigate('/admin/login', { replace: true });
                    }
                } else {
                    if (res.status === 403) {
                        setSuspended(true);
                    } else if (res.status !== 200) {
                        navigate('/', { replace: true });
                    }
                }
            })
            .catch(() => {
                navigate(admin ? '/admin/login' : '/', { replace: true });
            })
            .finally(() => {
                setChecking(false);
            });
    }, [admin, navigate]);

    if (checking) return null;

    if (suspended) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
                <div className="p-8 rounded shadow bg-white dark:bg-gray-800 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Account Suspended</h2>
                    <p className='text-white'>Your account has been suspended. Please contact support for more information.</p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
