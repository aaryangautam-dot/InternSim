# NovaTech Engineering OS (InternSim)
### The Authentic Developer Workplace & Career Simulation SaaS

> **Bridge the gap between theoretical computer science and authentic engineering workplace experience.**  
> Moving students past isolated algorithmic puzzles and predatory paid certificate mills into real-world software engineering: messy legacy codebases, PR reviews with harsh edge cases, production outage drills, team Slack channels, and escalating tech company tiers.

---

## 📑 Table of Contents
- [1. Executive Overview & Problem Statement](#1-executive-overview--problem-statement)
- [2. System Architecture & Tech Stack](#2-system-architecture--tech-stack)
- [3. SaaS Authentication & Security](#3-saas-authentication--security)
- [4. Multi-Tier Tech Organization Hierarchy](#4-multi-tier-tech-organization-hierarchy)
- [5. Engineering Tracks & Curriculum](#5-engineering-tracks--curriculum)
- [6. The 15 Realistic Production Tickets](#6-the-15-realistic-production-tickets)
- [7. Workplace Simulation Ecosystem](#7-workplace-simulation-ecosystem)
  - [7.1 Monaco Code Studio & Live Diff](#71-monaco-code-studio--live-diff)
  - [7.2 GitHub-Style Pull Request & CI/CD Pipeline](#72-github-style-pull-request--cicd-pipeline)
  - [7.3 Team Slack Workspace & Standup Submissions](#73-team-slack-workspace--standup-submissions)
  - [7.4 P0 Incident Simulation Drills](#74-p0-incident-simulation-drills)
  - [7.5 Voice Chat & Web Speech Integration](#75-voice-chat--web-speech-integration)
- [8. Dual AI Review Engine ($0 Budget Architecture)](#8-dual-ai-review-engine-0-budget-architecture)
- [9. Engineering Personas](#9-engineering-personas)
- [10. Career Dossier & ATS Resume Generator](#10-career-dossier--ats-resume-generator)
- [11. Formal Offer Letters & Digital Signatures](#11-formal-offer-letters--digital-signatures)
- [12. Audio Synthesis Engine](#12-audio-synthesis-engine)
- [13. Installation & Getting Started](#13-installation--getting-started)
- [14. Project Directory Structure](#14-project-directory-structure)

---

## 1. Executive Overview & Problem Statement

### The College-to-Workplace Gap
In university, students learn clean syntax, isolated algorithms, and academic assignments where specifications are clear and code is written from scratch. However, real-world software engineering looks completely different:
- **Nobody writes from scratch**: 90% of engineering is reading, debugging, and refactoring someone else’s messy, undocumented legacy code.
- **Predatory certificate mills**: Lacking access to competitive internships, many college students pay for online "certificates" that offer zero practical workplace value.
- **Algorithmic platforms fail at workplace skills**: LeetCode and CodeTantra teach isolated puzzle-solving, but fail to teach Git workflows, PR etiquette, defensive coding, cross-functional communication, or production debugging.

### The Solution: NovaTech Engineering OS
**NovaTech Engineering OS** is a browser-based developer simulation platform that mirrors day-to-day employment at software companies. Users don't solve theoretical puzzles; they take on tickets in a simulated sprint backlog, debug realistic production issues, open Pull Requests, receive feedback from simulated Senior Engineers and QA Leads, participate in daily standups, and advance through company tiers to earn verifiable employment offer letters.

---

## 2. System Architecture & Tech Stack

NovaTech OS is engineered as a modern, high-performance web application designed for instant responsiveness and zero-friction execution.

```
┌────────────────────────────────────────────────────────┐
│               NovaTech Engineering OS                  │
├──────────────────────────┬─────────────────────────────┤
│  Frontend Client         │  React 19 + Vite 8          │
│  Routing                 │  React Router v7            │
│  UI System               │  Obsidian-Zinc SaaS Theme   │
│  Editor Engine           │  Monaco Editor (@monaco)    │
│  Iconography             │  Lucide React               │
│  Voice & Speech          │  Web Speech API (STT / TTS) │
│  Audio Engine            │  Web Audio API Synthesis    │
│  Review Engine           │  Hybrid (Rules + Gemini/OAI)│
│  Backend Microservice    │  Node.js HTTP Server        │
└──────────────────────────┴─────────────────────────────┘
```

- **Core Framework**: React 19 with modern hook architecture (`useMemo`, `useCallback`, `useContext`, render-time state synchronization).
- **Build System**: Vite 8 with Hot Module Replacement (HMR) and optimized chunk splitting.
- **Code Editor**: Microsoft Monaco Editor (`@monaco-editor/react`), supporting syntax highlighting, indentation guides, and error markers for JavaScript and Python.
- **Styling Architecture**: Custom Obsidian-Zinc design system inspired by Linear and Vercel (`#09090b` canvas, `#18181b` cards, `#27272a` borders, `#6366f1` indigo brand accents, and full light/dark workstation themes).
- **Typography & Icons**: Inter / JetBrains Mono typography with Lucide React iconography.

---

## 3. SaaS Authentication & Security

The platform includes a complete SaaS authentication lifecycle with zero exposed keys and enterprise-style route protection:

- **Identity Isolation**: Dedicated user accounts with separate sprint progress, XP, ratings, warnings, and unlocked companies.
- **Protected Routes (`ProtectedRoute.jsx`)**: Prevents unauthenticated access to the sprint board, tickets, Slack, and career dossiers, redirecting unauthenticated visitors to `/login`.
- **SaaS Sign-In (`Login.jsx`)**: Clean login interface with validation error states and a **1-Click Demo Login Badge** (`intern@novatech.io` / `password123`) for instant evaluation.
- **Multi-Track Registration (`Signup.jsx`)**: Registration with real-time field validation and track selection (Frontend Developer, Backend Architect, or AI/ML Engineer).
- **Client & Server Auth Services**:
  - `src/services/auth.js`: Local client-side encrypted credentials, session token management (`tok_...`), password hashing, and localStorage synchronization.
  - `server/server.js`: Lightweight standalone Node HTTP microservice exposing `/api/auth/register`, `/api/auth/login`, and `/api/health`.
- **Security & Privacy**: Zero third-party API keys required in user profile settings; platform AI calls are abstracted through internal provider logic.

---

## 4. Multi-Tier Tech Organization Hierarchy

Engineers don't stay in one place; they level up their careers across three distinct tiers of technology companies, each with unique workplace cultures, manager expectations, and compensation packages:

```
┌────────────────────────────────────────────────────────┐
│              CAREER PROGRESSION LADDER                 │
├────────────────────────────────────────────────────────┤
│  Tier 1: NovaTech AI (Seed Stage - YC W24)             │
│  • Headcount: 14 employees | Valuation: $12M           │
│  • Culture: Scrappy, high-velocity chaos               │
│  • Stipend: $1,500/mo + 0.1% Early Equity              │
│  • Unlock Requirement: Default starting company        │
├────────────────────────────────────────────────────────┤
│  Tier 2: FinPulse Technologies (Series B Scale-Up)     │
│  • Headcount: 380 employees | Valuation: $450M         │
│  • Culture: Rigorous testing, QA gates, modularity     │
│  • Stipend: $6,800/mo + Full Health + $1,000 Setup     │
│  • Unlock Requirement: 2 Tier-1 PRs with avg score ≥ 7.0
├────────────────────────────────────────────────────────┤
│  Tier 3: Apex Global (Big Tech / FAANG Tier)           │
│  • Headcount: 65,000+ engineers | Market Cap: $1.4T    │
│  • Culture: Five-nines (99.999%), distributed scale    │
│  • Stipend: $11,500/mo + Luxury Housing + Relocation   │
│  • Unlock Requirement: 2 Tier-2 PRs with avg score ≥ 7.5
└────────────────────────────────────────────────────────┘
```

---

## 5. Engineering Tracks & Curriculum

When engineers sign up, they specialize in one of three tracks:

### 1. Frontend Engineering (UI/UX, Performance, Mobile Bugs)
Focuses on React components, event handling, responsive mobile Safari fixes, Context state management, DOM lifecycles, and render performance optimizations.

### 2. Backend Engineering (APIs, Security, Scale)
Focuses on Node.js/Express REST endpoints, JWT authentication tokens, SQL N+1 query problem elimination, distributed rate-limiting middleware, and file upload vulnerability mitigation.

### 3. AI / ML Engineering (Data Pipelines & Deep Learning)
Focuses on robust CSV dataset parsing, cross-validation data leakage fixes, NLP tokenization/lemmatization pipelines, neural network vanishing gradient corrections, and stratified metric evaluation.

---

## 6. The 15 Realistic Production Tickets

The platform ships with 15 pre-built production scenarios. Rather than synthetic toy problems, each ticket represents an actual production issue with messy legacy starter code:

| ID | Track | Tier | Title | Difficulty | Core Bug & Technical Objective |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **task-1** | Frontend | Tier 1 | Login Page — Mobile Safari Failures | Medium | Missing `e.preventDefault()`, broken regex, wrong variable name (`error` vs `errors`), form submitting during validation failure. |
| **task-2** | Frontend | Tier 1 | Settings Panel — Dark Mode Toggle | Easy | Centralizing theme state with React Context API, persisting to `localStorage`, and replacing hardcoded inline colors with CSS variables. |
| **task-3** | Frontend | Tier 2 | Product Page — Broken "Add to Cart" | Medium | Event handler invoked immediately during render (`onClick={handleClick()}`), missing toast confirmation, and cart quantity state race conditions. |
| **task-4** | Frontend | Tier 2 | User Profile — Component Refactor | Hard | 150-line monolithic component needing decomposition into modular sub-components (`ProfileHeader`, `UserStats`, `ActivityFeed`). |
| **task-5** | Frontend | Tier 3 | Product Listing — Performance Optimization | Hard | 500+ item list causing browser lag; fix re-renders with `useMemo`, `useCallback`, debounced search, and virtualized list items. |
| **be-task-1** | Backend | Tier 1 | REST API — Broken User Endpoint | Easy | Express route returning unhandled 500s on missing query parameters; implement proper status codes and JSON validation. |
| **be-task-2** | Backend | Tier 1 | Authentication — JWT Token Bugs | Medium | Token verification failing due to expired algorithm mismatch; implement refresh token rotation and secure headers. |
| **be-task-3** | Backend | Tier 2 | Database — N+1 Query Problem | Hard | Nested SQL queries inside loops causing 100+ DB trips; rewrite using batched `WHERE IN` queries or SQL `JOIN`s. |
| **be-task-4** | Backend | Tier 2 | Rate Limiter — Middleware Implementation | Medium | Unprotected public API receiving DDoS spikes; build sliding-window memory rate limiter middleware. |
| **be-task-5** | Backend | Tier 3 | File Upload — Security Vulnerabilities | Hard | Unrestricted file uploads allowing malicious scripts; implement MIME-type inspection, file size capping, and randomized UUID filenames. |
| **ai-task-1** | AI/ML | Tier 1 | Data Pipeline — Broken CSV Parser | Easy | Missing comma handling inside quotes, dropping rows with NaN, and wrong data type casting for numerical features. |
| **ai-task-2** | AI/ML | Tier 1 | Model Training — Data Leakage Bug | Hard | Preprocessing scaler fit on the entire dataset before train/test split; refactor to fit strictly on training set. |
| **ai-task-3** | AI/ML | Tier 2 | NLP Pipeline — Text Preprocessing Bugs | Medium | Tokenizer dropping contractions, missing lowercasing, and regex destroying emojis needed for sentiment modeling. |
| **ai-task-4** | AI/ML | Tier 2 | Neural Network — Vanishing Gradient Fix | Hard | Deep MLP saturating with Sigmoid activations; replace with He initialization and LeakyReLU/ReLU activations. |
| **ai-task-5** | AI/ML | Tier 3 | Evaluation — Broken Cross-Validation | Medium | Unstratified K-Fold on an imbalanced classification problem leading to optimistic baseline metrics; implement Stratified K-Fold. |

---

## 7. Workplace Simulation Ecosystem

### 7.1 Monaco Code Studio & Live Diff
- **VS Code Engine**: Full Monaco Editor embedded in the browser with indentation guides, minimap, syntax highlighting, and auto-closing brackets.
- **Sprint Timer**: Dynamic countdown timer measuring elapsed sprint minutes against target deadlines. Late submissions incur a 40% velocity XP penalty.
- **Acceptance Criteria Checklist**: Clearly documented PR requirements that engineers must fulfill before opening a Pull Request.

### 7.2 GitHub-Style Pull Request & CI/CD Pipeline
- **Git Diff Visualizer**: Side-by-side or line-by-line diff viewing additions (green `+`) and deletions (red `-`).
- **PR Metadata**: Custom PR title generation (`fix(frontend): resolve mobile safari login`), pull request description authoring, and pre-submission checklist verification.
- **Automated CI/CD Simulation**: Simulated pipeline checks code syntax, lints against clean code standards, and verifies regression test cases before requesting review.

### 7.3 Team Slack Workspace & Standup Submissions
- **Channels**:
  - `#engineering`: Team announcements, RFC design reviews, and architecture discussions.
  - `#daily-standup`: Interactive standup submission modal where users submit **Yesterday / Today / Blockers**. Simulated managers automatically react and respond.
  - `#prod-alerts`: Automated Sentry alerts and Datadog crash reports triggering P0 emergencies.
  - `#watercooler`: Casual developer banter, coffee breaks, and lighthearted memes.
- **Direct Messages (DMs)**: Private 1-on-1 chat threads with Priya (Frontend EM), Sarah (Staff Dev), and Devon (Lead SDET) to ask questions, discuss blockers, or get feedback.

### 7.4 P0 Incident Simulation Drills
- **Live Outage Simulation**: Users can trigger a simulated production outage directly from the sprint dashboard.
- **Siren & Incident Banner**: Plays a synthesized alert siren and injects a high-priority incident card notifying the engineer of sudden service degradation with direct jumps to hotfix tickets.

### 7.5 Voice Chat & Web Speech Integration
- **Hands-Free Standup & Coding Questions**: Powered by the browser's native `SpeechRecognition` and `SpeechSynthesis` APIs.
- **Persona-Matched Voice Parameters**: Managers feature tuned pitch, rate, and preferred voice profiles (e.g., Priya's female voice profile vs. Marcus's deep male voice profile).
- **Zero Cost**: Runs entirely on the user's browser without requiring paid speech-to-text or text-to-speech cloud services.

---

## 8. Dual AI Review Engine ($0 Budget Architecture)

One of the platform's core design achievements is its ability to deliver realistic, line-by-line code reviews with **zero API budget**:

```
                         Code Submission
                                │
                 Is API Key Provided in Storage?
                                │
               ┌────────────────┴────────────────┐
              Yes                               No
               │                                 │
     Provider Configured?              Deterministic Rule Engine
       ┌───────┴───────┐                         │
     Gemini          OpenAI           • Line-by-line syntax checks
   (1.5 Flash)    (GPT-4o-mini)       • Deliverables detection
       │               │              • Persona-specific feedback
       └───────┬───────┘              • Automated score (1-10)
               │                                 │
     Rich Review JSON Output ◄───────────────────┘
```

1. **Deterministic Simulation Engine (Default - $0 Cost)**:
   - Evaluates submitted code using granular syntax inspections, regex matching, and deliverable verification.
   - Generates realistic review scores (1 to 10), verdicts (*Pass* vs. *Needs Revision*), bulleted issues, positive reinforcement, and **line-by-line inline review comments** attributed to specific team personas.
2. **LLM Cloud Engine (Optional Integration)**:
   - When a Google Gemini (`AIza...`) or OpenAI API key is supplied, the platform automatically switches to dynamic, generative LLM reviews that inspect edge cases, suggest algorithmic refinements, and talk back in natural dialogue.

---

## 9. Engineering Personas

The simulator features a diverse team of colleagues who interact across Slack, PR reviews, and daily standups:

- **Priya Sharma (Senior Engineering Manager - Frontend)**:
  - *Style*: Direct, busy, pragmatic. Cares deeply about conversion funnels and user-facing bugs. Dislikes hand-holding; expects engineers to read documentation and test independently.
- **Marcus Chen (Staff Backend Architect)**:
  - *Style*: Systematic, performance-obsessed. Flags N+1 queries, unindexed foreign keys, and memory leaks. Demands high test coverage.
- **Dr. Aisha Okafor (ML Engineering Lead)**:
  - *Style*: Rigorous, statistical. Demands stratified validation, reproducibility, and zero data leakage.
- **Devon Vance (Lead SDET / QA)**:
  - *Style*: Sharp, skeptical, sarcastic. Tests empty strings, extreme numbers, and mobile Safari edge cases. Rejects PRs that lack automated tests.
- **Sarah Lin (Senior Staff Engineer)**:
  - *Style*: Mentoring, architectural. Suggests clean design patterns, points out legacy pitfalls, and encourages modular code.
- **Liam Patel (Principal Product Manager)**:
  - *Style*: Metrics-driven, fast-paced. Always asking for ETAs and quantifying customer drop-offs.
- **Sentry Alerts (Incident Bot)**:
  - *Style*: Automated alerts posting stack traces, affected user counts, and error spikes into `#prod-alerts`.

---

## 10. Career Dossier & ATS Resume Generator

Rather than generating meaningless certificates of completion, NovaTech OS generates real, verifiable portfolio assets:

- **ATS-Optimized Resume Bullets**:
  - Automatically synthesizes action-oriented, metric-backed resume bullets directly from merged PRs (e.g., *"Refactored high-traffic authentication form for mobile Safari, eliminating page-refresh defects and implementing robust input validation regex"*).
  - 1-Click "Copy to Clipboard" for instant use on resumes and LinkedIn profiles.
- **Core Competencies Radar**:
  - Visual tracking of 5 key engineering dimensions:
    1. *Root Cause Debugging*
    2. *Code Quality & Clean Architecture*
    3. *Sprint Velocity & Efficiency*
    4. *PR Etiquette & Technical Communication*
    5. *Edge Case Defensive Coding*
- **Engineering Title Progression**:
  - Tracks advancement from **Intern** (0 XP) to **Junior Developer** (500 XP) to **Full Developer** (1,500 XP).
- **Exportable Markdown Portfolio**:
  - 1-Click export to `novatech-internship-dossier-[username].md` containing verified stats, PR history, reviewer remarks, and timestamps.

---

## 11. Formal Offer Letters & Digital Signatures

Unlocking a higher company tier isn't just a level-up animation; it is celebrated with a formal corporate job offer:

- **Formal Employment Contract**:
  - Features company branding, position title, department, salary/stipend, corporate perks, and a welcome letter from executive leadership.
- **Interactive e-Signature**:
  - Candidates digitally type their signature into the offer letter modal.
  - Plays an audio fanfare and verifies the candidate as an active employee of the new organization.
- **Exportable `.txt` Contract**:
  - Enables candidates to download their signed offer letters to keep as tangible milestones.

---

## 12. Audio Synthesis Engine

NovaTech OS features a zero-asset, browser-native audio synthesis engine located in `src/utils/sound.js` built entirely on the **Web Audio API**:

- **Slack Ping (`playSound.notification()`)**: Dual-tone sine wave frequency ramp (587 Hz D5 to 880 Hz A5) mimicking workplace messaging notifications.
- **PR Merged Fanfare (`playSound.success()`)**: 4-note ascending chord progression (C5, E5, G5, C6) with soft exponential decay.
- **P0 Alert Siren (`playSound.alert()`)**: Descending sawtooth frequency sweep (440 Hz to 330 Hz) mimicking PagerDuty incident alerts.
- **100% Free**: Zero external `.mp3` or `.wav` files to download, zero network bandwidth, zero latency.

---

## 13. Installation & Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- `npm` or `pnpm`

### Quick Start (Frontend Development)
```bash
# 1. Clone repository and navigate to folder
cd "Intern sim"

# 2. Install project dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

### Standalone SaaS Backend Server (Optional)
To run the companion Node.js HTTP authentication service:
```bash
node server/server.js
```
The server will boot on port `5000` exposing `/api/health`, `/api/auth/login`, and `/api/auth/register`.

### Production Build & Linting
```bash
# Run ESLint to verify code quality
npm run lint

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 14. Project Directory Structure

```
Intern sim/
├── index.html                   # HTML entry point with meta tags & typography
├── package.json                 # Project dependencies and script declarations
├── vite.config.js               # Vite build and plugin configurations
├── eslint.config.js             # ESLint flat config rules for React 19
├── server/
│   └── server.js                # Standalone Node.js HTTP SaaS backend server
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main application routes & ProtectedRoute setup
│   ├── index.css                # Obsidian-Zinc design system CSS variables & layout
│   ├── assets/                  # Static assets and icons
│   ├── components/
│   │   ├── Layout.jsx           # App shell: sidebar navigation, user banner, topbar
│   │   ├── ProtectedRoute.jsx   # Auth guard redirecting unauthenticated users
│   │   ├── PullRequestModal.jsx # GitHub diff viewer, PR checklist, and code reviewer
│   │   └── OfferLetterModal.jsx # Interactive corporate offer letter with e-signature
│   ├── contexts/
│   │   ├── UserContext.jsx      # Auth state, XP velocity, warnings, company unlocks
│   │   ├── TaskContext.jsx      # Ticket states, attempt history, promotion criteria
│   │   └── ThemeContext.jsx     # Dark mode / Light mode workstation theme toggle
│   ├── data/
│   │   ├── companies.js         # Tiers 1-3 definitions, cultures, promotion gates
│   │   ├── managers.js          # EM system prompts, speech configs, fallback replies
│   │   ├── tasks.js             # 15 realistic tickets, starter code, deliverables
│   │   └── team.js              # Colleague personas and Slack channel presets
│   ├── hooks/
│   │   └── useVoiceChat.js      # Web Speech API STT and TTS voice engine hook
│   ├── pages/
│   │   ├── Login.jsx            # SaaS sign-in page with 1-click demo login badge
│   │   ├── Signup.jsx           # Multi-track account registration page
│   │   ├── Dashboard.jsx        # Sprint backlog board, stats, and P0 incident drill
│   │   ├── Tasks.jsx            # Company tier explorer, assigned tickets, offer status
│   │   ├── TaskDetail.jsx       # Monaco editor workspace, timer, voice sync, PR trigger
│   │   ├── Chat.jsx             # Team Slack: #engineering, #standup, alerts, DMs
│   │   ├── Progress.jsx         # Career dossier, ATS resume bullets, competency radar
│   │   └── Settings.jsx         # Profile manager, password update, dossier export
│   ├── services/
│   │   ├── auth.js              # Client credential hashing, token sessions, user DB
│   │   └── ai.js                # Deterministic review engine + Gemini/OpenAI fallbacks
│   └── utils/
│       └── sound.js             # Web Audio API synthesized pings, fanfares, and sirens
└── README.md                    # Comprehensive documentation and feature manual
```

---

## 💡 License & Educational Mission
NovaTech Engineering OS is created to democratize authentic software engineering education. It is open for students, educators, and career switchers looking to build verified, practical experience in modern software development.
