import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MarkdownEditor from "../components/MarkdownEditor.jsx";
import { usePost, useSavePost } from "../hooks/usePosts.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Editor() {
  const { slug } = useParams();
  const editing = !!slug;
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data: existing } = usePost(slug);
  const save = useSavePost();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("published");

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setBody(existing.body);
      setTags(existing.tags.map((t) => t.name).join(", "));
      setStatus(existing.status);
    }
  }, [existing]);

  const submit = (publishStatus) => {
    if (!title.trim()) return notify("Add a title first", "error");
    const payload = {
      title,
      body,
      status: publishStatus,
      tag_names: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    save.mutate(
      { slug, payload },
      {
        onSuccess: (data) => {
          notify(editing ? "Post updated" : "Post published", "success");
          navigate(`/posts/${data.slug}`);
        },
        onError: () => notify("Couldn't save the post", "error"),
      }
    );
  };

  return (
    <div className="animate-fade-in">
      <h1 className="mb-5 font-display text-2xl font-bold">
        {editing ? "Edit post" : "New post"}
      </h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        className="mb-3 w-full rounded-2xl border border-border bg-bg-surface px-4 py-3 font-display text-xl font-bold outline-none focus:border-accent-pink"
      />

      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags, comma separated (e.g. react, design)"
        className="mb-4 w-full rounded-2xl border border-border bg-bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent-pink"
      />

      <MarkdownEditor value={body} onChange={setBody} />

      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          onClick={() => submit("draft")}
          disabled={save.isPending}
          className="focus-ring rounded-2xl border border-border px-5 py-2.5 font-semibold hover:bg-bg-elevated disabled:opacity-60"
        >
          Save draft
        </button>
        <button
          onClick={() => submit("published")}
          disabled={save.isPending}
          className="focus-ring rounded-2xl bg-brand-gradient px-6 py-2.5 font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Publish"}
        </button>
      </div>
    </div>
  );
}
