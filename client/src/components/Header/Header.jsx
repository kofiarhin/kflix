import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "";

const getInitials = (fullName = "") => {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const buildImageUrl = (profileImagePath) => {
  if (!profileImagePath) return "";

  if (/^https?:\/\//i.test(profileImagePath)) {
    return profileImagePath;
  }

  return `${API_URL}${profileImagePath}`;
};

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMenu();
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();
    if (!query) return;

    navigate(`/movies?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    closeMenu();
  };

  const desktopNavLinkClass = ({ isActive }) =>
    `px-2.5 py-2 text-sm font-semibold transition duration-200 ${
      isActive ? "text-white" : "text-slate-300 hover:text-white"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `border-l-2 px-4 py-3 text-base font-semibold transition ${
      isActive
        ? "border-red-400 bg-white/[0.06] text-white"
        : "border-transparent text-slate-200 hover:bg-white/[0.04] hover:text-white"
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
    ],
    [],
  );

  const accountLinks = useMemo(
    () => [
      { to: "/settings", label: "Settings" },
      { to: "/profile", label: "Profile" },
    ],
    [],
  );

  const profileImageUrl = buildImageUrl(user?.profileImage);
  const initials = getInitials(user?.fullName || "U");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled || menuOpen
          ? "bg-[#0c0d10]/95 shadow-[0_16px_48px_-34px_rgba(0,0,0,0.95)] backdrop-blur-xl"
          : "bg-linear-to-b from-[#0c0d10]/92 via-[#0c0d10]/48 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="group inline-flex items-center gap-3 text-[1.35rem] font-black uppercase tracking-[0.02em] text-red-500"
          onClick={closeMenu}
          aria-label="Kflix home"
        >
          <span>Kflix</span>
        </Link>

        <nav className="ml-8 hidden flex-1 items-center gap-1 md:flex" aria-label="Primary navigation">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={desktopNavLinkClass}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated &&
            privateLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={desktopNavLinkClass}
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <form
            onSubmit={handleSearchSubmit}
            className={`flex h-9 items-center overflow-hidden border transition-all duration-300 ${
              searchOpen
                ? "w-64 border-white/35 bg-[#0c0d10]/88"
                : "w-9 border-transparent bg-transparent"
            }`}
          >
            <button
              type={searchOpen ? "submit" : "button"}
              onClick={() => setSearchOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center text-white transition hover:bg-white/[0.08] active:translate-y-px"
              aria-label={searchOpen ? "Submit search" : "Open search"}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                <circle cx="11" cy="11" r="6.5" />
              </svg>
            </button>
            <label htmlFor="global-search" className="sr-only">
              Search Kflix
            </label>
            <input
              id="global-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onBlur={() => {
                if (!searchTerm.trim()) setSearchOpen(false);
              }}
              placeholder="Titles, people, genres"
              className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-white outline-none placeholder:text-slate-400"
            />
          </form>

          {!isAuthenticated ? (
            <nav className="flex items-center gap-2" aria-label="Account">
              {guestLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded px-3 py-2 text-sm font-bold transition active:translate-y-px ${
                      isActive
                        ? "bg-red-500 text-white"
                        : "text-slate-200 hover:bg-white/[0.08] hover:text-white"
                    }`
                  }
                  onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          ) : (
            <div className="relative">
              <button
                type="button"
                className="group flex items-center gap-2 py-2 pl-1 text-white"
                onClick={() => setAccountOpen((prev) => !prev)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="User avatar"
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded bg-red-500 text-xs font-black text-white">
                    {initials}
                  </span>
                )}
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className={`h-4 w-4 fill-current transition-transform duration-200 ${
                    accountOpen ? "rotate-180" : ""
                  }`}
                >
                  <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.58l3.3-3.29a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.42Z" />
                </svg>
              </button>

              <div
                className={`absolute right-0 top-12 w-56 border border-white/14 bg-[#0c0d10]/96 p-2 shadow-[0_20px_70px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl transition duration-200 ${
                  accountOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                }`}
                role="menu"
              >
                <div className="border-b border-white/10 px-3 py-2">
                  <p className="truncate text-sm font-bold text-white">{user?.fullName || "Profile"}</p>
                  <p className="truncate text-xs text-slate-400">{user?.email}</p>
                </div>
                {accountLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className="block px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] hover:text-white"
                    onClick={closeMenu}
                    role="menuitem"
                  >
                    {link.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] hover:text-white"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="relative z-[70] inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-[#0c0d10]/72 md:hidden"
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
        className={`fixed inset-0 z-[55] bg-[#0c0d10]/70 transition-opacity duration-300 md:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav
        id="mobile-navigation"
        className={`fixed right-0 top-0 z-[60] flex h-[100dvh] w-[84%] max-w-sm flex-col border-l border-white/10 bg-[#0c0d10] px-5 pb-6 pt-20 shadow-2xl transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <form onSubmit={handleSearchSubmit} className="mb-5 flex h-11 border border-white/14 bg-white/[0.05]">
          <label htmlFor="mobile-global-search" className="sr-only">
            Search Kflix
          </label>
          <input
            id="mobile-global-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search movies..."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-white outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="grid w-11 place-items-center text-white transition hover:bg-white/[0.08]"
            aria-label="Submit search"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              <circle cx="11" cy="11" r="6.5" />
            </svg>
          </button>
        </form>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
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
              <div className="mb-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="User avatar"
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded bg-red-500 text-sm font-black text-white">
                    {initials}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{user?.fullName}</p>
                  <p className="text-xs text-slate-300">{user?.email}</p>
                </div>
              </div>

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

              {accountLinks.map((link) => (
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
                className="border-l-2 border-transparent px-4 py-3 text-left font-semibold text-slate-200 transition hover:bg-white/[0.04] hover:text-white"
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
