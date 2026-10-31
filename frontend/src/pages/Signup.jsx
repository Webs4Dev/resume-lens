import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../auth/AuthContext";
import { authErrorMessage, MIN_PASSWORD_LENGTH } from "../auth/authErrors";

export default function Signup() {
    const { user, register } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Also covers a successful sign-up: the new account is logged in.
    if (user) {
        return <Navigate to="/history" replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
            return;
        }

        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);

        try {
            await register(email.trim(), password);
        } catch (err) {
            setError(authErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Save every analysis and track your score over time."
        >
            <form onSubmit={handleSubmit}>

                <div className="form-group">
                    <label className="form-label" htmlFor="signup-email">
                        Email
                    </label>
                    <input
                        id="signup-email"
                        className="text-input"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="signup-password">
                        Password
                    </label>
                    <input
                        id="signup-password"
                        className="text-input"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={MIN_PASSWORD_LENGTH}
                        aria-describedby="signup-password-hint"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p id="signup-password-hint" className="input-hint">
                        At least {MIN_PASSWORD_LENGTH} characters.
                    </p>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="signup-confirm">
                        Confirm password
                    </label>
                    <input
                        id="signup-confirm"
                        className="text-input"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
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
                    {submitting ? "Creating account..." : "Sign up"}
                </button>

                <div className="auth-links">
                    <span>Already have an account?</span>
                    <Link to="/login">Log in</Link>
                </div>

            </form>
        </AuthLayout>
    );
}
