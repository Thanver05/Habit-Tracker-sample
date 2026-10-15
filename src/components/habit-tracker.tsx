"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Habit = {
  id: string;
  name: string;
  created_at: string;
  completed: string[];
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStreak(completedDates: string[], today: string) {
  const completed = new Set(completedDates);
  const cursor = new Date(`${today}T12:00:00`);

  if (!completed.has(today)) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (completed.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function friendlyError(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function HabitTracker({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [today, setToday] = useState("");
  const [todayLabel, setTodayLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyHabit, setBusyHabit] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadHabits = useCallback(async () => {
    setError("");
    const [habitsResult, completionsResult] = await Promise.all([
      supabase.from("habits").select("id, name, created_at").order("created_at", { ascending: true }),
      supabase.from("habit_completions").select("habit_id, completed_on"),
    ]);

    if (habitsResult.error || completionsResult.error) {
      setError(friendlyError(habitsResult.error ?? completionsResult.error));
      setLoading(false);
      return;
    }

    const completions = new Map<string, string[]>();
    for (const row of completionsResult.data ?? []) {
      const dates = completions.get(row.habit_id) ?? [];
      dates.push(row.completed_on);
      completions.set(row.habit_id, dates);
    }

    setHabits((habitsResult.data ?? []).map((habit) => ({
      ...habit,
      completed: completions.get(habit.id) ?? [],
    })));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const now = new Date();
    setToday(localDateKey(now));
    setTodayLabel(new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(now));
    void loadHabits();
  }, [loadHabits]);

  async function addHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newHabit.trim();
    if (!name) return;

    setSaving(true);
    setError("");
    const { data, error: insertError } = await supabase
      .from("habits")
      .insert({ name })
      .select("id, name, created_at")
      .single();

    if (insertError) {
      setError(friendlyError(insertError));
    } else if (data) {
      setHabits((current) => [...current, { ...data, completed: [] }]);
      setNewHabit("");
    }
    setSaving(false);
  }

  async function toggleHabit(habit: Habit) {
    if (!today || busyHabit) return;

    setBusyHabit(habit.id);
    setError("");
    const isDone = habit.completed.includes(today);
    const result = isDone
      ? await supabase.from("habit_completions").delete().eq("habit_id", habit.id).eq("completed_on", today)
      : await supabase.from("habit_completions").insert({ habit_id: habit.id, completed_on: today });

    if (result.error) {
      setError(friendlyError(result.error));
    } else {
      await loadHabits();
    }
    setBusyHabit(null);
  }

  async function deleteHabit(habit: Habit) {
    if (busyHabit) return;
    setBusyHabit(habit.id);
    setError("");
    const { error: deleteError } = await supabase.from("habits").delete().eq("id", habit.id);

    if (deleteError) {
      setError(friendlyError(deleteError));
    } else {
      setHabits((current) => current.filter((item) => item.id !== habit.id));
    }
    setBusyHabit(null);
  }

  async function signOut() {
    setError("");
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(friendlyError(signOutError));
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  const completedToday = today
    ? habits.filter((habit) => habit.completed.includes(today)).length
    : 0;
  const percent = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <div className="brand-mark small-mark" aria-hidden="true">✳</div>
          <span>Little by Little</span>
        </div>
        <div className="account-menu">
          <span className="account-email" title={userEmail}>{userEmail}</span>
          <button className="signout-button" onClick={signOut} type="button">Sign out</button>
        </div>
      </header>

      <section className="welcome-block">
        <p className="eyebrow">A little progress, every day</p>
        <h1>Show up for yourself.</h1>
        <p className="welcome-copy">Small steps become the things you’re proud of.</p>
        <p className="date-line">{todayLabel || "Today"}</p>
      </section>

      <section className="tracker-panel" aria-labelledby="progress-title">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">YOUR DAILY PRACTICE</p>
            <h2 id="progress-title">Today’s progress</h2>
          </div>
          <div className="progress-count"><strong>{completedToday}</strong><span> / {habits.length}</span></div>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-label="Today's completed habits"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="progress-caption">
          {habits.length === 0
            ? "Your first small step starts here."
            : completedToday === habits.length
              ? "Lovely work. You showed up for every habit today."
              : `${habits.length - completedToday} ${habits.length - completedToday === 1 ? "habit" : "habits"} left for today`}
        </p>

        <form className="add-habit-form" onSubmit={addHabit}>
          <label className="visually-hidden" htmlFor="new-habit">New habit</label>
          <input
            autoComplete="off"
            id="new-habit"
            maxLength={60}
            onChange={(event) => setNewHabit(event.target.value)}
            placeholder="Add a habit, like “Read 10 pages”"
            value={newHabit}
          />
          <button className="primary-button" disabled={saving || !newHabit.trim()} type="submit">
            {saving ? "Adding…" : <><span aria-hidden="true">＋</span> Add habit</>}
          </button>
        </form>

        {error && <p className="inline-error" role="alert">{error}</p>}

        <div className="habit-list" aria-live="polite">
          {loading ? (
            <div className="empty-state"><span className="loader" aria-hidden="true" />Loading your habits…</div>
          ) : habits.length === 0 ? (
            <div className="empty-state">
              <span className="empty-sprout" aria-hidden="true">♧</span>
              <strong>A fresh page.</strong>
              <span>Add one small habit above and begin at your own pace.</span>
            </div>
          ) : habits.map((habit) => {
            const done = Boolean(today && habit.completed.includes(today));
            const streak = today ? getStreak(habit.completed, today) : 0;

            return (
              <article className={`habit-row${done ? " is-done" : ""}`} key={habit.id}>
                <button
                  aria-label={done ? `Mark ${habit.name} as not done today` : `Mark ${habit.name} as done today`}
                  aria-pressed={done}
                  className="check-button"
                  disabled={busyHabit === habit.id}
                  onClick={() => void toggleHabit(habit)}
                  type="button"
                >
                  {done ? <span aria-hidden="true">✓</span> : null}
                </button>
                <div className="habit-info">
                  <h3>{habit.name}</h3>
                  <p className="streak-line">
                    <span aria-hidden="true">✦</span> {streak} day{streak === 1 ? "" : "s"} in a row
                  </p>
                </div>
                <button
                  aria-label={`Remove ${habit.name}`}
                  className="remove-button"
                  disabled={busyHabit === habit.id}
                  onClick={() => void deleteHabit(habit)}
                  title="Remove habit"
                  type="button"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="app-footer">One day at a time is enough. 🌱</footer>
    </main>
  );
}