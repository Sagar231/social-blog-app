import { useState } from "react";
import { useLike } from "../hooks/usePosts.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function LikeButton({ post }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const like = useLike();
  const [bump, setBump] = useState(false);

  const active = post.is_liked;

  const onClick = () => {
    if (!user) return notify("Sign in to like posts", "info");
    setBump(true);
    setTimeout(() => setBump(false), 300);
    like.mutate(post.slug);
  };

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Unlike" : "Like"}
      className="focus-ring inline-flex items-center gap-1.5 rounded-2xl px-2 py-1 text-sm text-text-muted hover:text-text-primary"
    >
      <span
        className={`${bump ? "animate-pop" : ""} text-base`}
        style={{ color: active ? "#1FD66B" : undefined }}
      >
        {active ? "💚" : "🤍"}
      </span>
      <span style={{ color: active ? "#1FD66B" : undefined }}>
        {post.like_count}
      </span>
    </button>
  );
}
