# Abu Bakr to FH Aachen

An interactive tracking page for Abu Bakr's journey to a master's at
FH Aachen — University of Applied Sciences. He logs each milestone as it
happens; the family follows along on one link.

There are no preset steps. Every entry is his own.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## Deploy to Vercel

1. Push this folder to a new GitHub repository.
2. Go to vercel.com, choose **Add New > Project**, and import that repo.
3. Vercel detects Vite automatically. Accept the defaults and deploy.

Build command: `npm run build` · Output directory: `dist`

## Sharing the timeline with the family

By default the tracker saves in the browser it's opened in, so only that
device sees the entries. To let the whole family see one shared timeline:

1. Create a free account at https://jsonbin.io
2. Create a new bin whose contents are exactly: `[]`
3. Copy the **Bin ID** and your **Master Key**.
4. In Vercel, open **Project Settings > Environment Variables** and add:

   - `VITE_BIN_ID` — the bin ID
   - `VITE_BIN_KEY` — the master key

5. Redeploy.

The footer of the page tells you which mode is active.

Note: anyone with the link can add or edit steps. That's usually fine for a
family page. Don't put anything private in the notes.

## Editing the page

- `src/GermanyTracker.jsx` — the page itself, all layout and copy
- `src/storage.js` — how entries are loaded and saved
- `src/index.css` — fonts and base styles
