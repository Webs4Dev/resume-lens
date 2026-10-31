import Navbar from "./NavBar";

// Shared frame for the login / sign-up / password pages.
export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="app">
            <Navbar />

            <main className="page">
                <div className="container">
                    <div className="auth-layout animate-in">

                        <h1 className="section-title">
                            {title}
                        </h1>

                        {subtitle && (
                            <p className="section-subtitle">
                                {subtitle}
                            </p>
                        )}

                        <div className="upload-card">
                            {children}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
