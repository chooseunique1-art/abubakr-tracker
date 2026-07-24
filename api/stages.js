import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "abubakr_fh_aachen_stages_v1";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const stages = (await redis.get(KEY)) || [];
    res.status(200).json(stages);
    return;
  }

  if (req.method === "PUT") {
    await redis.set(KEY, req.body);
    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader("Allow", "GET, PUT");
  res.status(405).json({ error: "Method not allowed" });
}
