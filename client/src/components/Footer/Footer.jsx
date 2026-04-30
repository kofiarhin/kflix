import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const footerSections = [
  {
    title: "Browse",
    links: [
      { to: "/", label: "Home" },
      { to: "/movies", label: "Movies" },
      { to: "/series", label: "Series" },
    ],
  },
  {
    title: "Library",
    links: [
      { to: "/for-you", label: "For You", private: true },
      { to: "/watchlist", label: "Watchlist", private: true },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/profile", label: "Profile", private: true },
      { to: "/settings", label: "Settings", private: true },
      { to: "/login", label: "Login", guest: true },
      { to: "/register", label: "Register", guest: true },
    ],
  },
];

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();

  const visibleSections = footerSections
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => {
        if (link.private) return isAuthenticated;
        if (link.guest) return !isAuthenticated;
        return true;
      }),
    }))
    .filter((section) => section.links.length > 0);

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0c0d10]/78 text-slate-300">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16 lg:py-12">
        <div className="max-w-xl">
          <Link
            to="/"
            className="inline-flex text-[1.35rem] font-black uppercase tracking-[0.02em] text-red-500 transition hover:text-red-400 active:translate-y-px"
            aria-label="Kflix home"
          >
            Kflix
          </Link>
          <p className="mt-4 max-w-[42rem] text-sm leading-6 text-slate-400">
            A focused place to browse movies and series, keep a watchlist, and return to the stories you care about.
          </p>
        </div>

        <nav
          className="grid grid-cols-2 gap-8 sm:grid-cols-3"
          aria-label="Footer navigation"
        >
          {visibleSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                {section.title}
              </h2>
              <ul className="mt-4 grid gap-3">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="inline-flex text-sm font-semibold text-slate-300 transition hover:text-white active:translate-y-px"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-5 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>&copy; {currentYear} Kflix. All rights reserved.</p>
          <p>Movies, series, and watchlists in one clean catalog.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
