import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import { useAddComment } from "../hooks/usePosts.js";
import { useAuth } from "../context/AuthContext.jsx";

function CommentForm({ slug, parent, onDone }) {
  const [body, setBody] = useState("");
  const add = useAddComment(slug);

  const submit = (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    add.mutate(
      { body, parent: parent || null },
      {
        onSuccess: () => {
          setBody("");
          onDone?.();
        },
      }
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parent ? "Write a reply…" : "Add a comment…"}
        className="min-h-[72px] w-full resize-y rounded-2xl border border-border bg-bg-surface p-3 text-sm outline-none focus:border-accent-pink"
      />
      <div className="flex justify-end">
        <button
          disabled={add.isPending}
          className="focus-ring rounded-2xl bg-brand-gradient px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {add.isPending ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}

function Comment({ comment, slug }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="flex gap-3">
        <Link to={`/u/${comment.author.username}`}>
          <Avatar user={comment.author} size={32} />
        </Link>
        <div className="flex-1">
          <div className="rounded-2xl bg-bg-surface px-4 py-2.5">
            <Link
              to={`/u/${comment.author.username}`}
              className="text-sm font-medium hover:text-accent-pink"
            >
              @{comment.author.username}
            </Link>
            <p className="mt-0.5 whitespace-pre-wrap text-sm text-text-primary">
              {comment.body}
            </p>
          </div>
          {user && (
            <button
              onClick={() => setReplying((r) => !r)}
              className="focus-ring ml-2 mt-1 text-xs text-text-muted hover:text-accent-blue"
            >
              Reply
            </button>
          )}
          {replying && (
            <div className="ml-2 mt-2">
              <CommentForm
                slug={slug}
                parent={comment.id}
                onDone={() => setReplying(false)}
              />
            </div>
          )}
          {comment.replies?.length > 0 && (
            <div className="mt-3 space-y-3 border-l border-border pl-4">
              {comment.replies.map((r) => (
                <Comment key={r.id} comment={r} slug={slug} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentThread({ slug, comments }) {
  const { user } = useAuth();
  const list = comments?.results || comments || [];

  return (
    <section className="mt-8">
      <h3 className="mb-4 font-display text-lg font-bold">Comments</h3>
      {user ? (
        <div className="mb-6">
          <CommentForm slug={slug} />
        </div>
      ) : (
        <p className="mb-6 text-sm text-text-muted">
          <Link to="/login" className="text-accent-blue">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}
      <div className="space-y-5">
        {list.length === 0 ? (
          <p className="text-sm text-text-muted">Be the first to comment.</p>
        ) : (
          list.map((c) => <Comment key={c.id} comment={c} slug={slug} />)
        )}
      </div>
    </section>
  );
}
