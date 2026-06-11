import { useFollow } from "../hooks/useUsers.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function FollowButton({ profile }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const follow = useFollow();

  if (user && user.username === profile.username) return null;

  const onClick = () => {
    if (!user) return notify("Sign in to follow", "info");
    follow.mutate(profile.username);
  };

  const following = profile.is_following;

  return (
    <button
      onClick={onClick}
      aria-pressed={following}
      className={`focus-ring rounded-2xl px-4 py-2 text-sm font-semibold transition ${
        following
          ? "border border-border bg-bg-surface text-text-primary hover:border-accent-red hover:text-accent-red"
          : "bg-brand-gradient text-white shadow-glow"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
