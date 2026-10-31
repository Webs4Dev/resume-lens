import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../auth/AuthContext";
import { authErrorMessage } from "../auth/authErrors";

export default function Login() {
    const { user, login } = useAuth();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Where ProtectedRoute was sending the user before login.
    const destination = location.state?.from || "/history";

    // Also covers a successful login: setting the user re-renders here.
    if (user) {
        return <Navigate to={destination} replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(email.trim(), password);
        } catch (err) {
            setError(authErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title="Log in"
            subtitle="Welcome back. Your past analyses are waiting."
        >
            <form onSubmit={handleSubmit}>

                <div className="form-group">
                    <label className="form-label" htmlFor="login-email">
                        Email
                    </label>
                    <input
                        id="login-email"
                        className="text-input"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="login-password">
                        Password
                    </label>
                    <input
                        id="login-password"
                        className="text-input"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="error" role="alert">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="primary-button full-button"
                    disabled={submitting}
                >
                    {submitting ? "Logging in..." : "Log in"}
                </button>

                <div className="auth-links">
                    <span>New to ResumeLens?</span>
                    <Link to="/signup">Create an account</Link>
                </div>

            </form>
        </AuthLayout>
    );
}
