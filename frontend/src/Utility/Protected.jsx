import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, admin = false }) => {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const url = admin
            ? `${import.meta.env.VITE_BACKEND_URL}/admin/dashboard`
            : `${import.meta.env.VITE_BACKEND_URL}/user/profile`;

        fetch(url, {
            method: 'GET',
            credentials: 'include',
        })
            .then(res => {
                if (admin) {
                    // admin endpoint should return JSON with { error } or { success }
                    return res.json().then(data => {
                        if (data.error) {
                            navigate('/admin/login', { replace: true });
                        }
                    });
                } else {
                    // user endpoint is protected with requiresAuth()
                    if (res.status !== 200) {
                        navigate('/', { replace: true });
                    }
                }
            })
            .catch(() => {
                // on network error or any other failure, kick to the login page
                navigate(admin ? '/admin/login' : '/', { replace: true });
            })
            .finally(() => {
                setChecking(false);
            });
    }, [admin, navigate]);

    // don’t render the protected UI until the check is done
    if (checking) return null;

    return children;
};

export default ProtectedRoute;
