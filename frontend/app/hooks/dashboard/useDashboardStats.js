import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export function useDashboardStats(intervalMs = 30000) {
    const token = Cookies.get("token");
    const API = process.env.NEXT_PUBLIC_BACKEND_URL;
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(`${API}/api/v1/dashboard/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setStats(await res.json());
            } catch { }
        };
        fetch_();
        const id = setInterval(fetch_, intervalMs);
        return () => clearInterval(id);
    }, []);

    return stats;
}