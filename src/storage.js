// Storage layer for the tracker.
//
// Two modes:
//   1. LOCAL (default)  — saves in the browser. Only that device sees the data.
//   2. SHARED           — saves to a free JSONBin bin, so everyone with the
//                         link sees the same timeline.
//
// To turn on SHARED mode:
//   1. Go to https://jsonbin.io and make a free account.
//   2. Create a bin with the contents:  []
//   3. Copy the Bin ID and your Master Key.
//   4. Put them in a .env file at the project root:
//
//        VITE_BIN_ID=your_bin_id_here
//        VITE_BIN_KEY=your_master_key_here
//
//   5. Add the same two variables in Vercel under
//      Project Settings > Environment Variables.
//
// Leave them unset and it quietly falls back to local-only mode.

const BIN_ID = import.meta.env.VITE_BIN_ID;
const BIN_KEY = import.meta.env.VITE_BIN_KEY;
const LOCAL_KEY = "abubakr_fh_aachen_stages_v1";

export const isShared = Boolean(BIN_ID && BIN_KEY);

const BASE = "https://api.jsonbin.io/v3/b";

export async function loadStages() {
  if (isShared) {
    const res = await fetch(`${BASE}/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": BIN_KEY },
    });
    if (!res.ok) throw new Error("Could not reach the shared timeline.");
    const json = await res.json();
    return Array.isArray(json.record) ? json.record : [];
  }

  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveStages(stages) {
  if (isShared) {
    const res = await fetch(`${BASE}/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": BIN_KEY,
      },
      body: JSON.stringify(stages),
    });
    if (!res.ok) throw new Error("Could not save to the shared timeline.");
    return;
  }

  localStorage.setItem(LOCAL_KEY, JSON.stringify(stages));
}
