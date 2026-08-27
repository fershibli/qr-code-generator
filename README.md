# QR Code Generator

A single-page React + Material UI app that generates PNG QR codes with an optional centered logo.

**Live:** [fershibli.github.io/qr-code-generator](https://fershibli.github.io/qr-code-generator/)

```bash
npm install
npm run dev
```

- **URL** is encoded in the QR code.
- **Logo** (optional) is drawn in the center. Logo size appears only after a logo is uploaded.
- **Resolution** is the exported square size: 250×250 through 1750×1750.
- Preview is always 500×500 px. Download is a `.png` with no alpha channel.

## Deploy

Pushes to `main` publish the app to GitHub Pages and, when commits follow [Conventional Commits](https://www.conventionalcommits.org/), create a semantic GitHub release (`feat` → minor, `fix` → patch, `BREAKING CHANGE` → major).
