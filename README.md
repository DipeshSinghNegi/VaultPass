## VaultPass (Password Generator + Secure Vault)

### Quick start
1) Install deps:
```

# VaultPass

A small client-side encrypted password vault and generator built with Next.js (App Router), TypeScript and Tailwind.

The server stores only encrypted blobs; encryption and key derivation are performed on the client using WebCrypto (PBKDF2 -> AES-GCM).

This repository is prepared for an assignment submission and includes UI improvements (copy buttons, dark mode, explicit decrypt action), encrypted export/import, and a Playwright E2E scaffold.

## Quick start (local)

Prerequisites
- Node 18+ (v20 recommended)
- npm
- MongoDB (Atlas or local)

1. Install dependencies

```bash
npm install
```

2. Create `.env.local` in the project root (an example is included)

Required variables:
```
MONGODB_URI=your-mongo-connection-string
JWT_SECRET=a-long-random-secret
NEXT_PUBLIC_APP_NAME=VaultPass

# optional test creds used by the sample Playwright E2E
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test12345
```

3. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000

## Features

- Client-side encryption using WebCrypto (PBKDF2 -> AES-GCM)
- Server stores only `{ encrypted, iv }` for each vault item
- Export / import of encrypted JSON files
- Copy username/password (auto-clear clipboard)
- Persistent session key (wrapped key + session fallback) so you don't need to re-enter the password while logged in
- Explicit Decrypt button on each item
- Dark mode toggle

## Security notes

- The app demonstrates client-side encryption but stores a wrapped key and (optionally) a session raw key in the browser for convenience. This is a tradeoff: it improves UX but reduces security compared with requiring the password for every session.
- Do not use this code as-is for production password management without adding secure key-wrapping (derive a wrapping key from password, use OS-level secure storage, and harden session handling).

## Tests

- Playwright E2E scaffold is included in `tests/`. To run Playwright tests locally:

```bash
npx playwright install
npx playwright test
```

Notes: Playwright tests require the dev server to be running at the configured URL.

## Assignment checklist

- Rebranded to VaultPass — visible across UI
- Copy buttons for username and password — implemented
- Client key persisted so logged-in sessions can decrypt — implemented (wrapped-key + session fallback)
- Export / import encrypted file — implemented
- Explicit Decrypt button — implemented
- Dark mode — implemented and colors tuned
- Search UI — implemented (live filtering, decryption-aware)
- Playwright E2E scaffold — included

## How to verify quickly
1. Start dev server
2. Login or seed a test user
3. Create a vault item, export it, delete, then import it back
4. Toggle dark mode and ensure UI is readable
5. Use search to find items by title/username/url/notes

If you'd like I can: add an unlock modal (instead of browser prompt), remove the session raw key (harder security), or finalize Playwright tests + CI config. Just tell me which you'd prefer.


