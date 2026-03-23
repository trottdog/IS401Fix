import "./load-env";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import * as fs from "fs";
import * as path from "path";
import { KnexSessionStore, initializeDatabase } from "./db";

const app = express();
const log = console.log;
const isProduction = process.env.NODE_ENV === "production";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function configureRuntime(app: express.Application) {
  if (process.env.TRUST_PROXY) {
    const trustProxyValue = process.env.TRUST_PROXY.trim();
    const parsedTrustProxy = Number.parseInt(trustProxyValue, 10);

    app.set(
      "trust proxy",
      Number.isNaN(parsedTrustProxy) ? trustProxyValue : parsedTrustProxy,
    );
    return;
  }

  if (isProduction) {
    app.set("trust proxy", 1);
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origin = req.header("origin");

    // Allow localhost origins for Expo web development (any port)
    const isLocalhost =
      origin === "http://localhost" ||
      origin === "http://127.0.0.1" ||
      origin === "https://localhost" ||
      origin === "https://127.0.0.1" ||
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("http://127.0.0.1:") ||
      origin?.startsWith("https://localhost:") ||
      origin?.startsWith("https://127.0.0.1:");

    const configuredOrigin = process.env.CORS_ORIGIN?.trim();
    const isConfiguredOrigin = !!configuredOrigin && origin === configuredOrigin;

    if (origin && (isConfiguredOrigin || isLocalhost)) {
      const requestedHeaders = req.header("access-control-request-headers");
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Vary", "Origin");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      );
      res.header(
        "Access-Control-Allow-Headers",
        requestedHeaders || "Content-Type, Authorization",
      );
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function logRuntimeConfiguration() {
  const dbTarget = process.env.DATABASE_URL?.trim()
    ? "DATABASE_URL"
    : `${process.env.PGHOST || "127.0.0.1"}:${process.env.PGPORT || "5432"}/${process.env.PGDATABASE || "byuconnect"}`;

  log(`runtime env: ${process.env.NODE_ENV || "development"}`);
  log(`database target: ${dbTarget}`);
  log("frontend mode: static web build served by Express");
}

function configureFrontend(app: express.Application) {
  const staticBuildPath = path.resolve(process.cwd(), "static-build");
  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));

  if (fs.existsSync(staticBuildPath)) {
    app.use(express.static(staticBuildPath, { index: false }));
    log(`Serving React web build from ${staticBuildPath}`);
    return;
  }

  log("No static web build found in static-build/");
}

function setupFrontendFallback(app: express.Application) {
  const indexPath = path.resolve(process.cwd(), "static-build", "index.html");

  app.get(/^(?!\/api\/?).*/, (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    if (!fs.existsSync(indexPath)) {
      return res.status(503).send(
        "Web build not found. Run `npm run web:build` before starting the production server.",
      );
    }

    res.sendFile(indexPath);
  });
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });
}

function setupSessions(app: express.Application) {
  const sessionCookie = {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
  };

  app.use(
    session({
      store: new KnexSessionStore(),
      secret: process.env.SESSION_SECRET || "byuconnect-dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: sessionCookie,
    }),
  );
}

(async () => {
  await initializeDatabase();
  logRuntimeConfiguration();
  configureRuntime(app);
  setupCors(app);
  setupBodyParsing(app);
  setupSessions(app);
  setupRequestLogging(app);
  configureFrontend(app);

  const server = await registerRoutes(app);
  setupFrontendFallback(app);

  setupErrorHandler(app);

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
