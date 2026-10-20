import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { SEO } from "../components/SEO";
import { Reveal } from "../components/Reveal";

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setStatus(
        "Supabase is not configured. Add the environment variables and restart Vite.",
      );
      return;
    }
    if (password.length < 8) {
      setStatus("Use a password with at least 8 characters.");
      return;
    }
    setBusy(true);
    setStatus("");
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth` },
          });
    setBusy(false);
    if (result.error) {
      setStatus(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setStatus(
        "Account created. Check your email for the confirmation link, then sign in.",
      );
      return;
    }
    setStatus("Signed in successfully.");
    navigate("/");
  }
  return (
    <>
      <SEO
        title="Account access | surya Studio"
        description="Sign in or create an account."
        path="/auth"
      />
      <section className="page-hero section-wrap">
        <Reveal>
          <p className="eyebrow">Account / Supabase Auth</p>
          <h1>
            Your space.
            <br />
            <em>Your next move.</em>
          </h1>
          <p className="hero-intro">
            Account access is included as a starter. Keep this route private or
            remove it if the public business site does not need customer
            accounts.
          </p>
        </Reveal>
      </section>
      <section className="section-wrap auth-wrap">
        <div className="auth-panel">
          <div className="auth-tabs">
            <button
              className={mode === "signin" ? "selected" : ""}
              onClick={() => {
                setMode("signin");
                setStatus("");
              }}
              type="button"
            >
              Sign in
            </button>
            <button
              className={mode === "signup" ? "selected" : ""}
              onClick={() => {
                setMode("signup");
                setStatus("");
              }}
              type="button"
            >
              Create account
            </button>
          </div>
          <form className="contact-form" onSubmit={submit}>
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </label>
            <button className="button button-dark" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in ↗"
                  : "Create account ↗"}
            </button>
            {status && (
              <p className="form-status" role="status">
                {status}
              </p>
            )}
          </form>
          <p className="auth-note">
            Enable email confirmation and configure allowed redirect URLs in
            Supabase Auth settings before production.
          </p>
          <Link className="text-link" to="/project_1">
            Return to website ↗
          </Link>
        </div>
      </section>
    </>
  );
}
