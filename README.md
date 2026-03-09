# iMocha TA Dashboard 2026

Live Talent Acquisition Intelligence Dashboard — pulls data directly from Google Sheets.

---

## Quick Start (this machine)

```bash
bash start.sh
```

Then open **http://localhost:5173** in your browser.

---

## First-time Setup on a New Machine

### Option A — Node.js already installed (recommended)

If you have Node.js ≥ 16 installed:

```bash
cd "TA Dashboard 2026__"
npm install
npm run dev
```

### Option B — No Node.js installed

1. **Install Node.js** (pick one):
   - Download from [nodejs.org](https://nodejs.org) → LTS version
   - Via Homebrew: `brew install node`
   - Via nvm:
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
     # restart terminal, then:
     nvm install --lts
     ```

2. **Install dependencies & run:**
   ```bash
   cd "TA Dashboard 2026__"
   bash install.sh    # installs node_modules
   bash start.sh      # starts the dev server
   ```

### Option C — Use the bundled node binary (offline / no install)

A copy of Node.js v22 is saved in `scripts/node`. Works on Apple Silicon Macs:

```bash
bash install.sh   # bootstraps npm + installs deps
bash start.sh     # uses scripts/node automatically
```

---

## Scripts

| Command | What it does |
|---------|-------------|
| `bash start.sh` | Start the development server |
| `bash install.sh` | Install / reinstall node_modules |
| `npm run dev` | Start dev server (requires npm in PATH) |
| `npm run build` | Build for production → `dist/` |
| `npm run preview` | Preview the production build |

---

## Project Structure

```
TA Dashboard 2026__/
├── start.sh              ← run this to start
├── install.sh            ← run this to install deps
├── package.json          ← all dependencies listed here
├── scripts/node          ← bundled Node.js v22 binary (macOS ARM)
├── public/
│   └── imocha.jpeg       ← iMocha logo
└── src/
    ├── App.jsx                     ← root: tabs + month filter
    ├── hooks/useSheetData.js       ← live Google Sheets fetch
    ├── utils/dataProcessor.js      ← parse & compute all metrics
    ├── utils/filterData.js         ← month-filter logic
    ├── components/
    │   ├── ui/                     ← ShadCN components
    │   └── dashboard/
    │       ├── Header.jsx
    │       ├── TopSummary.jsx
    │       ├── FinancialImpact.jsx
    │       ├── HiringVolume.jsx
    │       ├── CompensationTrends.jsx
    │       ├── HiringSpeed.jsx
    │       ├── QualityOfHire.jsx
    │       ├── SourceROI.jsx
    │       └── PipelineHealth.jsx
    └── index.css
```

---

## Data Source

- **Google Sheet ID:** `1bOxEmh7iv2tE1qoPhHQBrRwZRr-IAtBi`
- **Endpoint:** Google Visualization API (`gviz/tq?tqx=out:json`) — no API key required
- Click **Refresh Data** in the dashboard header to pull the latest data
- Any changes saved in the Google Sheet will appear after a refresh

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (dark theme) |
| Components | ShadCN UI + Radix UI primitives |
| Charts | Recharts 2 |
| Date utils | date-fns |

---

## Requirements

- **Node.js** ≥ 16 (bundled binary is v22, Apple Silicon only)
- **Browser** with internet access (fetches Google Sheets live)
- No backend, no database, no API keys needed
