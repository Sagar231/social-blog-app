import { useEffect } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar.jsx";
import { Shimmer } from "../components/Skeleton.jsx";
import { useNotifications } from "../hooks/useUsers.js";
import { api } from "../lib/api";

const verbText = {
  like: "liked your post",
  comment: "commented on your post",
  follow: "started following you",
};

export default function Notifications() {
  const { data, isLoading } = useNotifications();

  // Mark all read on view.
  useEffect(() => {
    api.post("/notifications/read").catch(() => {});
  }, []);

  if (isLoading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Shimmer key={i} className="h-14 w-full" />
        ))}
      </div>
    );

  const items = data?.results || [];

  return (
    <div className="animate-fade-in">
      <h1 className="mb-5 font-display text-2xl font-bold">Notifications</h1>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-border bg-bg-surface p-8 text-center text-text-muted">
          You're all caught up.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`flex items-center gap-3 rounded-2xl border border-border bg-bg-surface p-3 ${
                !n.is_read ? "ring-1 ring-accent-pink/40" : ""
              }`}
            >
              <Link to={`/u/${n.actor.username}`}>
                <Avatar user={n.actor} size={36} />
              </Link>
              <p className="flex-1 text-sm">
                <Link
                  to={`/u/${n.actor.username}`}
                  className="font-medium hover:text-accent-pink"
                >
                  @{n.actor.username}
                </Link>{" "}
                <span className="text-text-muted">{verbText[n.verb]}</span>
                {n.target && (
                  <>
                    {" "}
                    <Link
                      to={`/posts/${n.target.slug}`}
                      className="text-accent-blue"
                    >
                      {n.target.title}
                    </Link>
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
