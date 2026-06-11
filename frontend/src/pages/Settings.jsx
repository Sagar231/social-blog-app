import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { notify } = useToast();
  const { theme, toggle } = useTheme();
  const [form, setForm] = useState({
    bio: user?.bio || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch("/users/me", form);
      await refreshUser();
      notify("Profile updated", "success");
    } catch {
      notify("Couldn't update profile", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-in mx-auto max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-bold">Settings</h1>

      <section className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-bg-surface p-4">
        <div>
          <p className="font-medium">Appearance</p>
          <p className="text-sm text-text-muted">Currently {theme} mode</p>
        </div>
        <button
          onClick={toggle}
          className="focus-ring rounded-2xl border border-border px-4 py-2 text-sm hover:bg-bg-elevated"
        >
          Switch to {theme === "dark" ? "light" : "dark"}
        </button>
      </section>

      <form
        onSubmit={submit}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-surface p-5"
      >
        {[
          ["first_name", "First name", "text"],
          ["last_name", "Last name", "text"],
          ["email", "Email", "email"],
        ].map(([key, label, type]) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            <span className="text-text-muted">{label}</span>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="rounded-2xl border border-border bg-bg-primary px-3 py-2.5 outline-none focus:border-accent-pink"
            />
          </label>
        ))}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-text-muted">Bio</span>
          <textarea
            value={form.bio}
            maxLength={500}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="min-h-[96px] resize-y rounded-2xl border border-border bg-bg-primary px-3 py-2.5 outline-none focus:border-accent-pink"
          />
        </label>
        <button
          disabled={busy}
          className="focus-ring mt-2 self-end rounded-2xl bg-brand-gradient px-6 py-2.5 font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
