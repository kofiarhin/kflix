import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `transition hover:text-red-400 ${
      isActive ? "font-semibold text-red-500" : "text-white"
    }`;

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-xl font-bold tracking-wide text-white"
          onClick={closeMenu}
        >
          MovieApp
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/movies" className={navLinkClass}>
            Movies
          </NavLink>
          <NavLink to="/series" className={navLinkClass}>
            Series
          </NavLink>

          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/for-you" className={navLinkClass}>
                For You
              </NavLink>
              <NavLink to="/watchlist" className={navLinkClass}>
                Watchlist
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                Settings
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
              <button
                type="button"
                className="text-white transition hover:text-red-400"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex flex-col gap-1 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 bg-slate-950 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <NavLink to="/" className={navLinkClass} onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/movies" className={navLinkClass} onClick={closeMenu}>
              Movies
            </NavLink>
            <NavLink to="/series" className={navLinkClass} onClick={closeMenu}>
              Series
            </NavLink>

            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className={navLinkClass} onClick={closeMenu}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  Register
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/for-you"
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  For You
                </NavLink>
                <NavLink
                  to="/watchlist"
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  Watchlist
                </NavLink>
                <NavLink
                  to="/settings"
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  Settings
                </NavLink>
                <NavLink
                  to="/profile"
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  Profile
                </NavLink>
                <button
                  type="button"
                  className="text-left text-white transition hover:text-red-400"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
