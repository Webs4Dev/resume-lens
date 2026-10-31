import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../services/apiClient";
import { AuthContext } from "./AuthContext";

// Holds the logged-in user for the whole app. The session itself is an
// httpOnly cookie that JavaScript can't read, so on load we ask the
// backend who we are.
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        apiFetch("/auth/me")
            .then((me) => {
                if (!cancelled) setUser(me);
            })
            .catch((err) => {
                // 401 just means "not logged in".
                if (!(err instanceof ApiError && err.status === 401)) {
                    console.error("Could not check session", err);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function login(email, password) {
        setUser(await apiFetch("/auth/login", {
            method: "POST",
            json: { email, password }
        }));
    }

    async function register(email, password) {
        setUser(await apiFetch("/auth/register", {
            method: "POST",
            json: { email, password }
        }));
    }

    async function logout() {
        try {
            await apiFetch("/auth/logout", { method: "POST" });
        } finally {
            setUser(null);
        }
    }

    const value = { user, loading, login, register, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
