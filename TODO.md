# TODO - Deploy fix

- [x] Identify mismatch: Vercel rewrites pointed `/api/*` to `/api/index.js`, but backend logic is in `server/index.js`.
- [x] Add a real Vercel route for chat: `api/chat.js`.
- [x] Update `vercel.json` to remove `/api/*` rewrite so Vercel can route `/api/chat` to the new handler.
- [ ] Set hosting env var: `GEMINI_API_KEY`.
- [ ] (Optional) Ensure `/api/chat` works by testing a local build + using an equivalent request.
- [ ] Re-deploy and verify browser requests to `/api/chat` return 200 with `{ reply: ... }`.
