export default function SetupNotice() {
  return (
    <main className="auth-page">
      <section className="setup-card" aria-labelledby="setup-title">
        <div className="brand-mark" aria-hidden="true">✳</div>
        <p className="eyebrow">A little progress, every day</p>
        <h1 id="setup-title">Connect your Supabase project</h1>
        <p className="auth-intro">
          Add your Supabase URL and public key to <code>.env.local</code>, then run the
          database migration in Supabase Studio. The setup steps are in <code>README.md</code>.
        </p>
        <div className="setup-checklist">
          <span><b>1</b> Copy <code>.env.example</code> to <code>.env.local</code>.</span>
          <span><b>2</b> Add the Supabase URL and publishable or anon key.</span>
          <span><b>3</b> Run the SQL migration from <code>supabase/migrations</code>.</span>
        </div>
      </section>
    </main>
  );
}