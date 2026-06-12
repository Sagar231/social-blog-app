import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownEditor({ value, onChange }) {
  const [tab, setTab] = useState("write");

  const insertImage = () => {
    const url = window.prompt("Paste the image URL (https://…):");
    if (!url) return;
    const snippet = `\n![image](${url.trim()})\n`;
    onChange((value || "") + snippet);
    setTab("write");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface">
      <div className="flex items-center border-b border-border">
        {["write", "preview"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`focus-ring px-4 py-2.5 text-sm capitalize ${
              tab === t
                ? "border-b-2 border-accent-pink font-semibold text-text-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {t}
          </button>
        ))}
        <button
          type="button"
          onClick={insertImage}
          className="focus-ring ml-auto mr-2 rounded-xl px-3 py-1.5 text-sm text-text-muted hover:text-accent-blue"
          title="Insert an image by URL"
        >
          🖼 Insert image
        </button>
      </div>

      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your story in Markdown…"
          className="min-h-[320px] w-full resize-y bg-transparent p-4 font-mono text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
      ) : (
        <div className="prose-blog min-h-[320px] p-4">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-text-muted">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
