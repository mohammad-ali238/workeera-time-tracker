export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-3xl space-y-1 px-4 py-6 text-xs leading-relaxed text-muted sm:px-6">
        <p>
          <span className="font-semibold text-foreground">Workeera Tracker</span> is a
          dead-simple time tracker for freelancers.
        </p>
        <p>
          Up to 5 concurrent timers with per-timer timezones and currencies.
          Export instant CSV or PDF timesheets.
        </p>
        <p>Your data stays in your browser until you choose to sync.</p>
      </div>
    </footer>
  );
}
