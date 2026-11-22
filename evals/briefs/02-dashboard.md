# Operations dashboard

Build the main dashboard screen for **Runbook**, an on-call tool for small engineering teams. A signed-in on-call engineer lands here. It must show:

- Who is on call now and until when, and who is next.
- Open incidents (3 are open: one critical "Checkout API errors 14%", one major "Search latency p95 2.1 s", one minor "Email delays"), each with age and owner.
- Alerts in the last 24 hours as a trend (peak at 03:10 with 41 alerts).
- Five most recent resolved incidents with time to resolve.
- Navigation to: Overview, Incidents, Schedules, Services, Integrations, Settings.

It should work on a phone too, since people are paged away from their desks.
