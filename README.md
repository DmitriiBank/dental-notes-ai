# Dental Notes AI

Desktop-first clinical documentation assistant for fictional or properly de-identified dental scenarios. The Russian interface captures structured findings with FDI numbering and produces a deterministic professional Hebrew draft plus the dentist's own appointment durations.

> Demo software only. It is not an EHR, diagnostic device, autonomous recommender, or compliance-certified product. Every clinical statement requires dentist review. Do not enter direct patient identifiers or real clinical data into a public deployment.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Architecture

- `src/domain`: typed dental model, FDI topology, deterministic scheduling, validation, Hebrew templates, fictional cases.
- `src/store`: Zustand draft, selection, undo and browser-local demo persistence.
- `src/components`: responsive single-workspace UI.
- `src/test`: scheduler/validation unit tests and critical Playwright flow.

The domain layer has no React, server, AI, or network dependency. `hebrew-catalog.ts` contains reusable clinical phrases, while `hebrew-templates.ts` handles deterministic grammar and section composition. Appointment calculation remains a separate module and is combined with the clinical record only at the UI export boundary.

## Deterministic-only architecture

- No OpenAI or other model integration, API keys, API routes, or server-side clinical-text processing.
- Hebrew documentation is generated synchronously in the browser from selected structured data.
- Findings, performed treatment, proposed treatment, imaging state, and patient decisions use separate templates.
- Unreviewed imaging never produces a confirmed radiological finding.
- The generated clinical record updates immediately until the clinician enters explicit manual-edit mode.
- Copy and export append the independently calculated appointment-duration list.

## Safety and privacy

- No database, analytics, external AI calls, or clinical logging.
- Local storage is explicitly for non-sensitive sample data only.
- No name, Israeli ID, phone, or date-of-birth fields exist.
- Normal presets remain visibly unconfirmed until checked.
- Imaging findings require `reviewed` status.
- External clinician work is shown in treatment plans but excluded from the dentist's schedule.

Before private clinical use, add authenticated access, encrypted persistence, audit controls, retention policy, threat modeling, and an applicable Israeli privacy/security assessment.

## Deploy to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel, choose **Add New → Project**, import it, and keep framework preset **Next.js**.
3. No environment variables are needed for the deterministic MVP.
4. Deploy, then restrict access before entering anything beyond fictional demonstrations.

CLI alternative: `npx vercel` followed by `npx vercel --prod`. A deployment is not verified until Vercel returns a working URL.
