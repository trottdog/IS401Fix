import type { Request, Response } from "express";
import { createApp } from "../server/app.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req: Request, res: Response) {
  try {
    const app = await createApp({ serveFrontend: false });
    return app(req, res);
  } catch (error) {
    console.error("Vercel API bootstrap failed:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server bootstrap failed" });
    }
    return undefined;
  }
}
