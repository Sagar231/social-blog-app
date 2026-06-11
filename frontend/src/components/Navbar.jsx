import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Avatar from "./Avatar.jsx";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="focus-ring grid h-9 w-9 place-items-center rounded-2xl border border-border bg-bg-surface text-text-primary hover:bg-bg-elevated"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="glass sticky top-0 z-40 border-b border-border">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-xl bg-brand-gradient" />
          <span className="font-display text-lg font-extrabold tracking-tight">
            Prism
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/explore"
            className="focus-ring hidden rounded-2xl px-3 py-2 text-sm text-text-muted hover:text-text-primary sm:block"
          >
            Explore
          </Link>
          <ThemeToggle />

          {user ? (
            <>
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="focus-ring grid h-9 w-9 place-items-center rounded-2xl border border-border bg-bg-surface hover:bg-bg-elevated"
              >
                🔔
              </Link>
              <Link
                to="/new"
                className="focus-ring rounded-2xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow"
              >
                Write
              </Link>
              <div className="relative" ref={ref}>
                <button
                  onClick={() => setOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  className="focus-ring rounded-full"
                >
                  <Avatar user={user} size={36} />
                </button>
                {open && (
                  <div
                    role="menu"
                    className="animate-fade-in absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-soft"
                  >
                    <Link
                      to={`/u/${user.username}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-bg-surface"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-bg-surface"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                        navigate("/");
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm text-accent-red hover:bg-bg-surface"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="focus-ring rounded-2xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
