import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "analytics-events.log");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end("Method Not Allowed");
    }

    try {
        const body = req.body;
        const entry = {
            ts: new Date().toISOString(),
            ip: (req.headers["x-forwarded-for"] || req.socket.remoteAddress) as string | undefined,
            ua: req.headers["user-agent"],
            body,
        };
        const line = JSON.stringify(entry) + "\n";
        await fs.promises.appendFile(LOG_FILE, line, { encoding: "utf8" });
        return res.status(201).json({ ok: true });
    } catch (err) {
        console.error("/api/track error", err);
        return res.status(500).json({ ok: false });
    }
}
