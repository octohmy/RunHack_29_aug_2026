# RunHack — 29 Aug 2026

A hackathon project about running, health, and keeping fit.

> Status: early. The concept below is our working pitch; the alternatives at the
> bottom are still on the table.

## The pitch: PaceQuest

Most running apps tell you how fast you went. They are bad at telling you
whether you should have gone that fast at all, and worse at getting you out of
the door tomorrow.

PaceQuest is a running companion that turns your training into a small,
adaptive quest line:

- **Adaptive plan.** Each run is generated from your recent load, resting heart
  rate and how you said you felt after the last session — not from a fixed
  12-week PDF.
- **Live coaching.** Audio cues while you run ("ease off, you're 20s/km hot for
  an easy day"), driven by pace and heart-rate zones.
- **Recovery honesty.** A simple readiness score that is allowed to say "today
  is a rest day", and means it.
- **Streaks that survive real life.** Missing a day adjusts the plan instead of
  resetting your progress to zero.

### Why it's interesting to build

It touches wearable/health data ingestion, a bit of time-series modelling, and
a UX problem (motivation) that isn't solved by another leaderboard.

## Architecture sketch

```
mobile / web app  ──►  API  ──►  planner service
   GPS + HR             auth      load & readiness model
   audio cues           runs      next-session generator
                         │
                    Postgres (users, runs, plans)
```

Ingest options: Apple Health / Google Fit export, Strava API, or a manual
"I ran 5k, felt ok" entry so the demo never depends on a watch pairing.

## Roadmap for the hack

1. Record or import a run and store it.
2. Compute weekly load + a readiness score from it.
3. Generate the next session from that score.
4. Live pace/HR feedback during a run.
5. Quest line UI: streaks, milestones, shareable summary card.

Ship 1–3 first; 4 and 5 are what make the demo land.

## Other ideas we considered

| Idea | One-liner |
| --- | --- |
| **Ghost Runner** | Race a replay of your own past self, or a friend's, in real time through audio. |
| **Couch to Commute** | Turns your actual commute route into a progressive run-walk plan. |
| **Injury Radar** | Flags rising injury risk from cadence, load spikes and pace drift, and prescribes the boring fix. |
| **Run for Something** | Every km logged converts to a donation or a tree; teams compete on total distance. |
| **Fuel Coach** | Hydration and nutrition prompts timed to session length, weather and sweat rate. |
| **Sound Pacer** | Picks music whose BPM matches your target cadence and nudges it when you drift. |
| **Neighbourhood Explorer** | Gamifies covering every street in your area; the map fills in as you run. |
| **Accessible Routes** | Surfaces well-lit, low-traffic, step-free routes — safety as a first-class feature. |

## Getting started

Nothing to run yet. Once there's code here:

```bash
git clone https://github.com/octohmy/RunHack_29_aug_2026.git
cd RunHack_29_aug_2026
# setup steps to follow
```

## Team

- Add your name here.

## Health disclaimer

This is a hackathon project, not a medical device. Nothing it outputs is
medical advice — talk to a professional before starting a training plan.
