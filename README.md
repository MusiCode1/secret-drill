# SecretDrill

Practice memorizing passwords and unlock patterns entirely in the browser.

אתר לתרגול שינון סיסמאות ותבניות נעילה, כולו בדפדפן וללא שליחת מידע לרשת.

## Live

- Production: `https://secret-drill.pages.dev/`
- GitHub: `https://github.com/MusiCode1/secret-drill`

## What It Does

- Password practice flow
- Pattern lock practice flow
- Visible mode and hash-only mode
- Hebrew/English UI with RTL support
- Light / Dark / System theme switcher
- Mobile-friendly pattern practice with hints for order and direction

## Security Model

- 100% client-side runtime
- No `localStorage`, `sessionStorage`, or cookies for app state
- Hash mode uses PBKDF2-SHA256
- CSP generated in hash mode at build time
- `connect-src 'none'` blocks network requests from the app

## Tech Stack

- SvelteKit 2
- Svelte 5 runes
- TypeScript
- Tailwind CSS v4
- Paraglide-JS i18n
- Vitest
- Cloudflare Pages

## Development

Install dependencies:

```bash
bun install
```

Start the dev server:

```bash
bun run dev
```

Build for production:

```bash
bun run build
```

Run checks:

```bash
bunx vitest run
bun run check
```

## Deployment

The site is built with `@sveltejs/adapter-static` and deployed to Cloudflare Pages.

Important details:

- Pages are prerendered at build time
- There is no runtime server
- CSP hashes are generated during the build
- `static/_headers` is used only for non-CSP headers

Manual deploy example:

```bash
bun run build
npx wrangler pages deploy build/ --project-name secret-drill
```

## Project Notes

- Password and pattern practice pages are interactive but still shipped as static output
- Pattern hints can show order numbers, arrows, and a highlighted start point
- Auto-verify is enabled only during password confirmation in visible mode

## License

MIT
