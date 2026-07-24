// Storage layer for the tracker.
//
// Data lives in Redis (via the /api/stages serverless function), so
// everyone who opens the site sees the same timeline. Connect a Redis
// database to the Vercel project (Storage > Create Database > Redis)
// and redeploy — Vercel wires up the credentials automatically.

export async function loadStages() {
  const res = await fetch("/api/stages");
  if (!res.ok) throw new Error("Could not reach the shared timeline.");
  const stages = await res.json();
  return Array.isArray(stages) ? stages : [];
}

export async function saveStages(stages) {
  const res = await fetch("/api/stages", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stages),
  });
  if (!res.ok) throw new Error("Could not save to the shared timeline.");
}
