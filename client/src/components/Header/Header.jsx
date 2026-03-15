import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
  };

  const desktopNavLinkClass = ({ isActive }) =>
    `transition hover:text-red-400 ${
      isActive ? "font-semibold text-red-500" : "text-white"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `rounded-lg px-4 py-3 text-base transition ${
      isActive
        ? "bg-red-500/10 font-semibold text-red-500"
        : "text-white hover:bg-white/5 hover:text-red-400"
    }`;

  const publicLinks = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/movies", label: "Movies" },
      { to: "/series", label: "Series" },
    ],
    [],
  );

  const guestLinks = useMemo(
    () => [
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" },
    ],
    [],
  );

  const privateLinks = useMemo(
    () => [
      { to: "/for-you", label: "For You" },
      { to: "/watchlist", label: "Watchlist" },
      { to: "/settings", label: "Settings" },
      { to: "/profile", label: "Profile" },
    ],
    [],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="text-xl font-bold tracking-wide text-white"
          onClick={closeMenu}
        >
          Kflix
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={desktopNavLinkClass}>
              {link.label}
            </NavLink>
          ))}

          {!isAuthenticated ? (
            guestLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={desktopNavLinkClass}
              >
                {link.label}
              </NavLink>
            ))
          ) : (
            <>
              {privateLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={desktopNavLinkClass}
                >
                  {link.label}
                </NavLink>
              ))}

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
          className="relative z-[70] inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          <span className="relative h-5 w-5">
            <span
              className={`absolute left-0 top-1/2 block h-0.5 w-5 bg-white transition duration-300 ${
                menuOpen ? "translate-y-0 rotate-45" : "-translate-y-[8px]"
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 block h-0.5 w-5 bg-white transition duration-300 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 block h-0.5 w-5 bg-white transition duration-300 ${
                menuOpen ? "translate-y-0 -rotate-45" : "translate-y-[8px]"
              }`}
            />
          </span>
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[55] bg-black/50 transition-opacity duration-300 md:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav
        id="mobile-navigation"
        className={`fixed right-0 top-0 z-[60] flex h-screen w-[82%] max-w-sm flex-col border-l border-white/10 bg-slate-950 px-5 pb-6 pt-20 shadow-2xl transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={mobileNavLinkClass}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}

          {!isAuthenticated ? (
            guestLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={mobileNavLinkClass}
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))
          ) : (
            <>
              {privateLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={mobileNavLinkClass}
                  onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              ))}

              <button
                type="button"
                className="rounded-lg px-4 py-3 text-left text-white transition hover:bg-white/5 hover:text-red-400"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
