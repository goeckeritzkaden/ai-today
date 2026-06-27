# AI Today Website

This is the public archive site for AI Today X Post Packs.

## Preview Locally

```powershell
& "C:\Users\goeck\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js
```

Open `http://127.0.0.1:4174`.

## Add a Completed Pack

Create a JSON file using `examples/example-pack.json` as the shape, then run:

```powershell
.\scripts\add-pack.ps1 -File path\to\pack.json
```

The newest dated pack automatically becomes the featured article on the homepage.

## Publish

This is a static website. It can be published with GitHub Pages, Netlify, Vercel, Cloudflare Pages, or another static host.

Point the host at the repository root. No build command is required.
