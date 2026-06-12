import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-8 text-sm text-text-muted sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-lg bg-brand-gradient" />
          <span className="font-display font-bold text-text-primary">Prism</span>
          <span className="hidden sm:inline">· Write. Share. Connect.</span>
        </div>

        <div className="flex items-center gap-5">
          <Link to="/explore" className="hover:text-text-primary">
            Explore
          </Link>
          <Link to="/new" className="hover:text-text-primary">
            Write
          </Link>
          <span>© {new Date().getFullYear()} Prism</span>
        </div>
      </div>
    </footer>
  );
}
