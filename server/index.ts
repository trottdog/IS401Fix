import { createServer } from "node:http";
import { createApp } from "./app.js";
const log = console.log;
const isProduction = process.env.NODE_ENV === "production";

(async () => {
  const app = await createApp({ serveFrontend: true });
  const server = createServer(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || (isProduction ? "0.0.0.0" : "127.0.0.1");
  server.listen(
    {
      port,
      host,
    },
    () => {
      log(`express server serving on http://${host}:${port}`);
    },
  );
})();
