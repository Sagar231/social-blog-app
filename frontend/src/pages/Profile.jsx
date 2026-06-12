import { useParams } from "react-router-dom";
import Avatar from "../components/Avatar.jsx";
import FollowButton from "../components/FollowButton.jsx";
import PostFeed from "../components/PostFeed.jsx";
import { Shimmer } from "../components/Skeleton.jsx";
import { useProfile } from "../hooks/useUsers.js";
import { usePostList } from "../hooks/usePosts.js";

export default function Profile() {
  const { username } = useParams();
  const { data: profile, isLoading } = useProfile(username);
  const posts = usePostList("/posts", { author: username, ordering: "-created_at" });

  if (isLoading)
    return (
      <div className="space-y-4">
        <Shimmer className="h-32 w-full" />
        <Shimmer className="h-6 w-40" />
      </div>
    );
  if (!profile) return <p className="text-accent-red">User not found.</p>;

  return (
    <div className="animate-fade-in">
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface">
        <div
          className="h-28 bg-brand-gradient"
          style={
            profile.banner_url || profile.banner
              ? {
                  backgroundImage: `url(${profile.banner_url || profile.banner})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
        <div className="px-5 pb-5">
          <div className="-mt-8 flex items-end justify-between">
            <div className="rounded-full border-4 border-bg-surface">
              <Avatar user={profile} size={72} />
            </div>
            <FollowButton profile={profile} />
          </div>
          <h1 className="mt-3 font-display text-xl font-bold">
            @{profile.username}
          </h1>
          {profile.bio && (
            <p className="mt-1 text-sm text-text-muted">{profile.bio}</p>
          )}
          <div className="mt-3 flex gap-5 text-sm">
            <span>
              <strong>{profile.follower_count}</strong>{" "}
              <span className="text-text-muted">followers</span>
            </span>
            <span>
              <strong>{profile.following_count}</strong>{" "}
              <span className="text-text-muted">following</span>
            </span>
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-8 font-display text-lg font-bold">Posts</h2>
      <PostFeed query={posts} empty="No posts yet." />
    </div>
  );
}
