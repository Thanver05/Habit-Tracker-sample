"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Those passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      setMessage("Password updated. Taking you to sign in…");
      window.setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 900);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update the password.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="reset-title">
        <div className="brand-mark" aria-hidden="true">✳</div>
        <p className="eyebrow">A little progress, every day</p>
        <h1 id="reset-title">Choose a new password</h1>
        <p className="auth-intro">Use at least 8 characters, then sign in with your new password.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="new-password">New password</label>
          <input id="new-password" autoComplete="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          <label htmlFor="confirm-password">Confirm new password</label>
          <input id="confirm-password" autoComplete="new-password" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
          {error && <p className="form-message form-error" role="alert">{error}</p>}
          {message && <p className="form-message form-success" role="status">{message}</p>}
          <button className="primary-button auth-submit" disabled={pending} type="submit">{pending ? "Saving…" : "Update password"}</button>
        </form>
      </section>
    </main>
  );
}