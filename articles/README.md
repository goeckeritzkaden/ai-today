# AI Today Article Data

Each completed AI X Post Pack should be saved as one JSON file in this folder and listed in `index.json`.

The easiest path is to create a pack JSON file and run:

```powershell
& "C:\Users\goeck\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" scripts\add-pack.js --file path\to\pack.json
```

Required fields:

- `date`: `YYYY-MM-DD`
- `title`: article headline
- `summary`: short deck used on the homepage
- `bodyMarkdown`: short report body, with optional `###` subheads
- `sources`: array of `{ "label": "...", "url": "https://..." }`
- `caption`: copy-ready X caption

