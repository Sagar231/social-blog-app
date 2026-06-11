import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.username, form.password);
      notify("Welcome back!", "success");
      navigate("/");
    } catch {
      notify("Invalid username or password", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Sign in">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field
          label="Username"
          value={form.username}
          onChange={(v) => setForm({ ...form, username: v })}
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
        />
        <button
          disabled={busy}
          className="focus-ring mt-2 rounded-2xl bg-brand-gradient py-2.5 font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-text-muted">
        No account?{" "}
        <Link to="/register" className="text-accent-blue">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, children }) {
  return (
    <div className="animate-fade-in mx-auto max-w-sm py-10">
      <h1 className="mb-6 font-display text-2xl font-bold">{title}</h1>
      <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-soft">
        {children}
      </div>
    </div>
  );
}

export function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="rounded-2xl border border-border bg-bg-primary px-3 py-2.5 outline-none focus:border-accent-pink"
      />
    </label>
  );
}
