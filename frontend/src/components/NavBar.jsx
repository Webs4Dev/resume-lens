import { Link, NavLink, useNavigate } from "react-router-dom";
import ApertureMark from "./ApertureMark";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/login", { replace: true });
    }

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to={user ? "/history" : "/"} className="logo">
                    <ApertureMark size={24} />
                    Resume<span>Lens</span>
                </Link>

                {user ? (
                    <>
                        <div className="nav-links">
                            <NavLink to="/history">History</NavLink>
                            <NavLink to="/analyze">Analyze</NavLink>
                        </div>

                        <div className="nav-account">
                            <span className="nav-email" title={user.email}>
                                {user.email}
                            </span>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={handleLogout}
                            >
                                Log out
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="nav-links">
                            <NavLink to="/" end>
                                Home
                            </NavLink>
                            <NavLink to="/login">Log in</NavLink>
                        </div>

                        <Link to="/signup" className="primary-button">
                            Sign up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
