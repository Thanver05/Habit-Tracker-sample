"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "recovery";

export default function AuthForm({ initialNotice }: { initialNotice: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState(initialNotice);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isRecovery = mode === "recovery";
  const isSignUp = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);

    try {
      const supabase = createClient();
      const callback = `${window.location.origin}/auth/callback`;

      if (isRecovery) {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${callback}?next=/reset-password`,
        });
        if (authError) throw authError;
        setNotice("If an account exists for that email, a password reset link is on its way.");
      } else if (isSignUp) {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${callback}?next=/` },
        });
        if (authError) throw authError;

        if (data.session) {
          router.replace("/");
          router.refresh();
        } else {
          setNotice("Check your email for a confirmation link to finish creating your account.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.replace("/");
        router.refresh();
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <a className="auth-home-link" href="/" aria-label="Go to Little by Little home">← Home</a>
        <div className="brand-mark" aria-hidden="true">✳</div>
        <p className="eyebrow">A little progress, every day</p>
        <h1 id="auth-title">
          {isRecovery ? "Reset your password" : isSignUp ? "Start small. Start today." : "Welcome back"}
        </h1>
        <p className="auth-intro">
          {isRecovery
            ? "We’ll email you a secure link to choose a new password."
            : isSignUp
              ? "Create an account to keep your habits in sync wherever you go."
              : "Sign in to pick up where you left off."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            autoComplete="email"
            id="email"
            maxLength={254}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />

          {!isRecovery && (
            <>
              <label htmlFor="password">Password</label>
              <input
                autoComplete={isSignUp ? "new-password" : "current-password"}
                id="password"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                type="password"
                value={password}
              />
            </>
          )}

          {error && <p className="form-message form-error" role="alert">{error}</p>}
          {notice && <p className="form-message form-success" role="status">{notice}</p>}

          <button className="primary-button auth-submit" disabled={pending} type="submit">
            {pending
              ? "Please wait…"
              : isRecovery
                ? "Send reset link"
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
          </button>
        </form>

        <div className="auth-switches">
          {mode === "signin" && (
            <>
              <button className="text-button" onClick={() => { setMode("recovery"); setError(""); setNotice(""); }} type="button">
                Forgot your password?
              </button>
              <p>New here? <button className="text-button inline-button" onClick={() => { setMode("signup"); setError(""); setNotice(""); }} type="button">Create an account</button></p>
            </>
          )}
          {mode === "signup" && (
            <p>Already have an account? <button className="text-button inline-button" onClick={() => { setMode("signin"); setError(""); setNotice(""); }} type="button">Sign in</button></p>
          )}
          {isRecovery && (
            <p>Remembered it? <button className="text-button inline-button" onClick={() => { setMode("signin"); setError(""); setNotice(""); }} type="button">Back to sign in</button></p>
          )}
        </div>
        <p className="auth-footnote">Your account keeps your habit data private.</p>
      </section>
    </main>
  );
}