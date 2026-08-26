import { Link, NavLink } from "react-router-dom";
import ApertureMark from "./ApertureMark";

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="logo">
                    <ApertureMark size={24} />
                    Resume<span>Lens</span>
                </Link>

                <div className="nav-links">
                    <NavLink to="/" end>
                        Home
                    </NavLink>
                    <NavLink to="/analyze">Analyze</NavLink>
                </div>

                <Link to="/analyze" className="primary-button">
                    Analyze Resume
                </Link>
            </div>
        </nav>
    );
}
