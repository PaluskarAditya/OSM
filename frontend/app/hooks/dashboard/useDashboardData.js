import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

export function useDashboardData() {
    const token = Cookies.get("token");
    const iid = Cookies.get("iid");
    const API = process.env.NEXT_PUBLIC_BACKEND_URL;

    const [data, setData] = useState({
        institute: null, qps: [], subjects: [],
        sheets: [], evaluations: [], users: [],
    });
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!token || !iid) return;
        setLoading(true);
        try {
            const endpoints = ["institute", "qp", "subject", "answer-sheet", "eval", "users"];
            const results = await Promise.all(
                endpoints.map(e =>
                    fetch(`${API}/api/v1/${e}`, { headers: { Authorization: `Bearer ${token}` } })
                        .then(r => r.json())
                )
            );
            const [inst, qps, subjects, sheets, evaluations, users] = results;
            setData({
                institute: inst.find(i => i.IID === Number(iid)) ?? null,
                qps, subjects, sheets, evaluations, users,
            });
        } catch (err) {
            console.error("Dashboard fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }, [token, iid, API]);

    useEffect(() => { load(); }, [load]);

    return { ...data, loading, reload: load };
}