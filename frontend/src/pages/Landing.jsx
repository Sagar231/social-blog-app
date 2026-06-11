import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="animate-fade-in py-12 text-center">
      <div className="mx-auto mb-6 h-16 w-16 rounded-3xl bg-brand-gradient shadow-glow" />
      <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
        Write. Share.{" "}
        <span className="bg-brand-gradient bg-clip-text text-transparent">
          Connect.
        </span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-text-muted">
        A modern home for your writing. Publish posts in Markdown, follow people
        you love, and build your own corner of the internet.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/register"
          className="focus-ring rounded-2xl bg-brand-gradient px-6 py-3 font-semibold text-white shadow-glow"
        >
          Get started
        </Link>
        <Link
          to="/explore"
          className="focus-ring rounded-2xl border border-border bg-bg-surface px-6 py-3 font-semibold hover:bg-bg-elevated"
        >
          Explore posts
        </Link>
      </div>
    </div>
  );
}
