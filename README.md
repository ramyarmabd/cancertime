# CancerTime

CancerTime is a static, patient-facing calculator for estimating the time devoted to cancer-related treatment, transfusions, caregiving, and combined care schedules. It supports common visit frequencies, hours-and-minutes entry, explicit estimate periods, grouped trips, and opt-in reuse of treatment inputs. It is educational and research-oriented; it does not provide medical advice or recommend care.

## Local development

Requirements: Node.js 22 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The production build is exported as static files in `out/`.

## Free deployment with GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` automatically verifies, builds, and publishes the site whenever `main` is updated. For a repository named `cancertime`, the default address is:

`https://YOUR-GITHUB-USERNAME.github.io/cancertime/`

The Next.js configuration automatically adds the repository name as the production base path while keeping local development at `http://localhost:3000`.

## Architecture and privacy

- Next.js App Router, React, TypeScript, and Tailwind CSS
- Pure, tested calculation functions in `lib/calculations.ts`
- All calculator state and math remain in the browser
- No database, authentication, cookies, analytics, trackers, or external APIs
- Calculator values are not persisted; only a light or dark display preference may be stored locally

The creator, institution, and contact fields on the About page intentionally remain placeholders until verified details are supplied.
