import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { AuthShell, Field } from "./Login.jsx";

export default function Register() {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      notify("Account created 🎉", "success");
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      const msg = data
        ? Object.values(data).flat().join(" ")
        : "Registration failed";
      notify(msg, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field
          label="Username"
          value={form.username}
          onChange={(v) => setForm({ ...form, username: v })}
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
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
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-accent-blue">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
