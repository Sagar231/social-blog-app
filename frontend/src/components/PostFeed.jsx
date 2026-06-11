import { useEffect, useRef } from "react";
import PostCard from "./PostCard.jsx";
import { FeedSkeleton } from "./Skeleton.jsx";

export default function PostFeed({ query, empty }) {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    query;
  const sentinel = useRef(null);

  useEffect(() => {
    if (!sentinel.current) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <FeedSkeleton />;
  if (isError)
    return (
      <p className="rounded-2xl border border-accent-red/40 bg-bg-surface p-4 text-accent-red">
        Couldn't load posts. Please try again.
      </p>
    );

  const posts = data.pages.flatMap((p) => p.results);
  if (posts.length === 0)
    return (
      <div className="rounded-2xl border border-border bg-bg-surface p-8 text-center text-text-muted">
        {empty || "Nothing here yet."}
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
      <div ref={sentinel} />
      {isFetchingNextPage && <FeedSkeleton count={1} />}
    </div>
  );
}
