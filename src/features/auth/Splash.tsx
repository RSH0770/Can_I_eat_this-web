import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Splash() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate('/login'), 2000)
        return () => clearTimeout(timer);
    }, [navigate]);

    return <div>스플래시</div>

}