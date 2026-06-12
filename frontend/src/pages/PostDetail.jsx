import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Avatar from "../components/Avatar.jsx";
import LikeButton from "../components/LikeButton.jsx";
import CommentThread from "../components/CommentThread.jsx";
import { Shimmer } from "../components/Skeleton.jsx";
import {
  useBookmark,
  useComments,
  useDeletePost,
  usePost,
} from "../hooks/usePosts.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = usePost(slug);
  const { data: comments } = useComments(slug);
  const bookmark = useBookmark();
  const del = useDeletePost();

  if (isLoading)
    return (
      <div className="space-y-4">
        <Shimmer className="h-8 w-3/4" />
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="h-64 w-full" />
      </div>
    );
  if (isError || !post)
    return <p className="text-accent-red">Post not found.</p>;

  const isAuthor = user && user.username === post.author.username;

  const onDelete = () => {
    if (!confirm("Delete this post?")) return;
    del.mutate(slug, {
      onSuccess: () => {
        notify("Post deleted", "success");
        navigate("/");
      },
    });
  };

  return (
    <article className="animate-fade-in">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold leading-tight">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link to={`/u/${post.author.username}`}>
              <Avatar user={post.author} size={40} />
            </Link>
            <div>
              <Link
                to={`/u/${post.author.username}`}
                className="block text-sm font-medium hover:text-accent-pink"
              >
                @{post.author.username}
              </Link>
              <span className="text-xs text-text-muted">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          {isAuthor && (
            <div className="flex gap-2 text-sm">
              <Link
                to={`/edit/${slug}`}
                className="focus-ring rounded-2xl border border-border px-3 py-1.5 hover:bg-bg-elevated"
              >
                Edit
              </Link>
              <button
                onClick={onDelete}
                className="focus-ring rounded-2xl border border-border px-3 py-1.5 text-accent-red hover:border-accent-red"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </header>

      {(post.cover_image_url || post.cover_image) && (
        <img
          src={post.cover_image_url || post.cover_image}
          alt=""
          className="mb-6 max-h-96 w-full rounded-2xl object-cover"
        />
      )}

      <div className="prose-blog max-w-none text-text-primary">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </div>

      {post.tags?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Link
              key={t.id}
              to={`/explore?tag=${t.slug}`}
              className="rounded-full border border-border px-3 py-1 text-sm text-text-muted hover:border-accent-blue hover:text-accent-blue"
            >
              #{t.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4 border-y border-border py-3">
        <LikeButton post={post} />
        <button
          onClick={() =>
            user
              ? bookmark.mutate(slug, {
                  onSuccess: (d) =>
                    notify(d.bookmarked ? "Saved" : "Removed", "success"),
                })
              : notify("Sign in to bookmark", "info")
          }
          className="focus-ring inline-flex items-center gap-1.5 rounded-2xl px-2 py-1 text-sm text-text-muted hover:text-accent-blue"
        >
          {post.is_bookmarked ? "🔖 Saved" : "📑 Save"}
        </button>
      </div>

      <CommentThread slug={slug} comments={comments} />
    </article>
  );
}
