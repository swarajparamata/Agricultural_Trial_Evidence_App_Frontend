# AgriEvidence – Trial Data Platform (frontend)

React app for browsing, filtering, comparing and managing agricultural trial results. It includes an **Evidence Assistant** that answers questions grounded in the trial data.

The app talks to the AgriEvidence API (`Agricultural_Trial_Evidence_App_Backend`). The assistant runs in the separate LLM service, a LangGraph agent with Qwen 3.6 via Ollama (`Agricultural_Trial_Evidence_App_LLM`).

> **Part of AgriEvidence.** To run the whole app with one command on macOS or Windows, clone [Agricultural_Trial_Evidence_App](https://github.com/swarajparamata/Agricultural_Trial_Evidence_App) with `git clone --recursive`. Its README also covers the model configuration and the demo data.

**Stack:** React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · Jotai · Zustand · Zod · react-markdown · lucide-react

## Getting started

Requires Node.js 20.19+ or 22 LTS.

```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev                 # http://localhost:5173
```

To see the app with the demo data only, without a backend, run `npm run dev:offline` and open <http://localhost:5174>. This is the offline demo described below.

Start the backend first (see its README). In demo mode it lists the demo accounts on the login page: `admin@agrievidence.demo` / `admin123` and `viewer@agrievidence.demo` / `viewer123`.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Address of the API, e.g. `http://127.0.0.1:8000`. Required for production builds. Leave it empty for the offline demo. |

The variables are validated with Zod at startup. An invalid value, or a production build without the API address, shows a configuration screen instead of the app.

### Two modes

| | API mode (`VITE_API_BASE_URL` set) | Offline demo (empty, dev server only) |
| --- | --- | --- |
| Sign-in | Accounts in the backend (JWT) | Any email and password; emails starting with `admin` get the admin role |
| Trials | Reconciled by the backend from the imported files | The same six sample trials, built into the app and kept in this browser |
| Assistant, imports, users, settings | ✓ | Explains that these need the backend |

In API mode, if the backend can't be reached, the dev server offers to switch to the offline demo. You can switch back from the banner or the user menu. This keeps a presentation going without a backend.

## What's in the app

**Dashboard**
- Filters: crop, product, country, year, trial type, data status, and custom fields marked as filters.
- Insight tiles and a mean-uplift chart by product, crop, country or trial type.
- The trials table, with columns configured in the settings.
- **Add New Trial** (admins): enter a trial by hand, or switch to **Upload files** to import spreadsheets and reports. The upload has a preview that saves nothing.

**Trial detail**
- Reconciled values and the uplift. When sources conflict, the detail also shows the range they allow.
- Every source and the values it reported, with each source file opening in a viewer.
- Conflicts, caveats, notes and admin overrides.
- Admins can edit, delete and resolve conflicts.

**Compare** (up to the configured maximum)
- Summary tiles; tied trials are named together.
- Warnings, e.g. different crops or conflicting sources.
- An uplift chart with conflict ranges, and a treated-vs-control chart with one axis per crop.
- Optional difference and custom-field charts.
- A field-by-field table that highlights the rows that differ.

**Assistant**
- Answers stream in and are rendered as Markdown. Each answer shows the trials and sources it used, whether the fact-check passed, and whether Qwen or the offline planner answered.
- The **Inspection** tab shows every step of the agent's tool loop and reflection loop.

**Settings** (`#/settings/<tab>`)

| Tab | Who | Contents |
| --- | --- | --- |
| My account | everyone | Name and password |
| Users & access | admin | Add users, change roles, deactivate, reset passwords; self sign-up |
| Trials & data | admin | Add trial, import files (with **Preview import**, which saves nothing), source files, deleted trials, rebuild, reset demo |
| Custom fields | admin | Define extra trial fields: type, unit, options, and where they appear (table, filters, compare, charts) |
| Reference data | admin | Crops, products, countries, trial types and units with their spelling variants |
| Display & compare | admin | App name, yield unit, decimals, table columns, compare charts and fields |
| Import rules | admin | Header aliases, default unit, tolerance, conflict strategy, source priority, caveat rules, LLM extraction |
| AI assistant | admin | Model and Ollama address, loop limits, reflection, fallback, "always offline", suggested questions, model test, loop diagram |
| Activity | admin | Audit log of admin actions |

Viewers only see **My account**. The backend enforces every admin action too, not just the UI.

### Charts

The charts are hand-written SVG components in `src/components/charts`, with no chart library. They follow these rules:
- a colorblind-checked palette (`src/constants/charts`);
- one axis per chart, faceted by crop when yields aren't comparable;
- thin bars with rounded data ends;
- hover tooltips;
- a legend whenever there are several series;
- a **Table** toggle on every chart for an accessible data view.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run dev:offline` | Start the offline demo on port 5174: sample trials in the browser, no backend |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | Type-check only |
| `npm run lint` | ESLint (includes the folder-import rule below) |

## Project structure

```
src/
├── main.tsx                 # entry point
├── index.css                # Tailwind + tw-animate-css
├── components/
│   ├── App/                 # providers (Jotai store per user), config check, auth gate
│   ├── pages/               # LoginPage, DashboardPage, SettingsPage, LoadingPage, ConfigErrorPage
│   ├── auth/                # AuthGate, LoginForm, ApiUnavailableNotice, DemoAuthNotice
│   ├── layout/              # AppShell, Header, NavTabs, UserMenu, ModeBanner, AboutModal
│   ├── trials/              # filters, table, detail, form, compare, insights, sources, conflicts
│   ├── charts/              # ChartFrame, UpliftChart, DumbbellChart, HBarChart, ChartTooltip
│   ├── chat/                # ChatWidget, ChatWindow, AgentLogsPanel, MarkdownMessage, AnswerMeta, …
│   ├── settings/            # one section per settings tab, plus editors (vocabulary, units, columns, …)
│   └── ui/                  # Button, Modal, FormField, Select, Toggle, TagInput, …
├── hooks/
│   ├── atoms/               # Jotai atoms (settings, trials, filters, selection, ui)
│   ├── stores/              # Zustand stores (auth, chat)
│   └── use*/                # custom hooks used by components
├── constants/               # copy, config values, chart colors, offline demo data
├── types/                   # TypeScript types + Zod schemas (mirroring the API)
└── utils/                   # pure helpers, API client (fetch + SSE), auth clients, formatting, chart scales
```

### Conventions

- **One folder per module.** Every component lives in `ComponentName/index.tsx`, and every other module in `name/index.ts`. Group folders (`ui/`, `trials/`, `hooks/`, …) re-export their members from an `index.ts`.
- **Import folders, never files.** Write `import { Button } from '@/components/ui'`, not `.../Button/index.tsx`. `npm run lint` fails on file imports (`no-restricted-imports`).
- **The `@/` alias** points at `src/`.
- **Layering:** `constants → types → utils → hooks → components`. Inside a group, siblings import each other relatively (`../TrialRow`) to avoid barrel cycles.

## State management

| Library | Holds | Where |
| --- | --- | --- |
| **Jotai** | Settings, trials, filters, selection, the trial form and UI state such as modals and the chat panel. Derived atoms compute the filtered list, the dropdown options and the selected trials. The store is keyed by user, so signing out clears it. | `src/hooks/atoms` |
| **Zustand** | **auth**: the session through the API or the offline demo login (`getAuthClient` in `src/utils/auth`). **chat**: messages, the agent's step log, streaming state and the assistant status. | `src/hooks/stores` |
| **Zod** | Schemas for the env variables, forms (incl. custom fields), API responses and the assistant's event stream. Types are inferred from the schemas. | `src/types` |

Components reach state through hooks such as `useTrialFilters`, `useTrialSelection`, `useTrialForm`, `useSettingsSection`, `useAgentChat`, `useRoute` and `useIsAdmin`.

## Notes

- The offline demo data (`src/constants/demo`) was generated from the backend's reconciled sample data. Regenerate it if the sample data or the reconciliation rules change.
- `agritrial_dashboard.tsx` in the project root is the original single-file prototype this app was split from. It is excluded from linting and the build and can be deleted.
