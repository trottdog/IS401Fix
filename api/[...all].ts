import type { Request, Response } from "express";
import { createApp } from "../server/app";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req: Request, res: Response) {
  const app = await createApp({ serveFrontend: false });
  return app(req, res);
}
