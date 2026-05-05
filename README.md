# 🏀 JJHoops

Personal NBA dashboard tracking the Chicago Bulls, LA Lakers, and Denver Nuggets.

Built with React + Vite, deployed on Vercel.

## Features

- **Today tab** — live scores, upcoming games with win probabilities
- **My Teams tab** — status, stats and context for your 3 teams
- **Bracket tab** — full playoff bracket with series records

## Stack

| Layer    | Tool          | Why                              |
|----------|---------------|----------------------------------|
| UI       | React + Vite  | Fast, modern, easy to update     |
| Data     | Anthropic API | Live web search for NBA scores   |
| Hosting  | Vercel        | Free, auto-deploys from GitHub   |

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your GitHub repo
3. Vercel auto-detects Vite — just click Deploy
4. Every time you push to `main`, Vercel redeploys automatically ✅

## Updating the data

- **Games refresh automatically** when you open the page (hits live search API)
- **Bracket / series records** — update `src/constants.js` → `STATIC_SERIES` and `FIRST_ROUND_RESULTS`
- **My Teams context** — update `src/tabs/MyTeamsTab.jsx` → `TEAM_CONTEXT`
