import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PostFeed from "../components/PostFeed.jsx";
import { usePostList } from "../hooks/usePosts.js";

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const tag = params.get("tag") || "";
  const [search, setSearch] = useState(params.get("search") || "");

  const query = usePostList("/posts", {
    ...(tag ? { tag } : {}),
    ...(params.get("search") ? { search: params.get("search") } : {}),
    ordering: "-created_at",
  });

  const onSearch = (e) => {
    e.preventDefault();
    const next = {};
    if (tag) next.tag = tag;
    if (search) next.search = search;
    setParams(next);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="mb-4 font-display text-2xl font-bold">Explore</h1>

      <form onSubmit={onSearch} className="mb-5 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts…"
          className="flex-1 rounded-2xl border border-border bg-bg-surface px-4 py-2.5 outline-none focus:border-accent-pink"
        />
        <button className="focus-ring rounded-2xl bg-brand-gradient px-5 font-semibold text-white">
          Search
        </button>
      </form>

      {tag && (
        <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
          Filtering by{" "}
          <span className="rounded-full border border-accent-blue px-2.5 py-0.5 text-accent-blue">
            #{tag}
          </span>
          <button
            onClick={() => setParams(search ? { search } : {})}
            className="text-accent-red"
          >
            clear
          </button>
        </div>
      )}

      <PostFeed query={query} empty="No posts match your search." />
    </div>
  );
}
