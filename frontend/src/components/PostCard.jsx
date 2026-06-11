import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import LikeButton from "./LikeButton.jsx";

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
}

export default function PostCard({ post }) {
  return (
    <article className="animate-fade-in rounded-2xl border border-border bg-bg-surface p-5 transition hover:shadow-soft">
      <div className="mb-3 flex items-center gap-2.5">
        <Link to={`/u/${post.author.username}`}>
          <Avatar user={post.author} size={32} />
        </Link>
        <Link
          to={`/u/${post.author.username}`}
          className="text-sm font-medium hover:text-accent-pink"
        >
          @{post.author.username}
        </Link>
        <span className="text-xs text-text-muted">· {timeAgo(post.created_at)}</span>
        {post.status === "draft" && (
          <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-xs text-accent-blue">
            Draft
          </span>
        )}
      </div>

      <Link to={`/posts/${post.slug}`}>
        {post.cover_image && (
          <img
            src={post.cover_image}
            alt=""
            className="mb-3 max-h-56 w-full rounded-xl object-cover"
          />
        )}
        <h2 className="font-display text-xl font-bold leading-snug hover:text-accent-pink">
          {post.title}
        </h2>
      </Link>

      {post.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Link
              key={t.id}
              to={`/explore?tag=${t.slug}`}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-muted hover:border-accent-blue hover:text-accent-blue"
            >
              #{t.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 text-text-muted">
        <LikeButton post={post} />
        <Link
          to={`/posts/${post.slug}`}
          className="focus-ring inline-flex items-center gap-1.5 rounded-2xl px-2 py-1 text-sm hover:text-text-primary"
        >
          💬 {post.comment_count}
        </Link>
      </div>
    </article>
  );
}
