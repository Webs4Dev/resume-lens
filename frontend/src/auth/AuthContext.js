import { createContext, useContext } from "react";

// Kept apart from AuthProvider.jsx so that file exports only a
// component (keeps React Fast Refresh and the lint rule happy).
export const AuthContext = createContext(null);

export function useAuth() {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error("useAuth must be used inside <AuthProvider>.");
    }

    return value;
}
