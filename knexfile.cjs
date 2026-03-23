const fs = require("node:fs");
const path = require("node:path");

function parseEnvFile(content) {
  const parsed = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function loadEnv() {
  const mode = process.env.NODE_ENV || "development";
  const envFiles = [
    ".env",
    `.env.${mode}`,
    ".env.local",
    `.env.${mode}.local`,
  ];

  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;

    const parsed = parseEnvFile(fs.readFileSync(filePath, "utf8"));
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

function getSslConfig() {
  const sslMode = process.env.PGSSLMODE && process.env.PGSSLMODE.toLowerCase();
  const databaseSsl =
    process.env.DATABASE_SSL && process.env.DATABASE_SSL.toLowerCase();
  const useSsl =
    sslMode === "require" ||
    databaseSsl === "true" ||
    databaseSsl === "1" ||
    databaseSsl === "yes";

  return useSsl ? { rejectUnauthorized: false } : undefined;
}

function buildConnection() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) {
    return {
      connectionString: process.env.DATABASE_URL.trim(),
      ssl: getSslConfig(),
    };
  }

  return {
    host: process.env.PGHOST || "127.0.0.1",
    port: Number.parseInt(process.env.PGPORT || "5432", 10),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "postgres",
    database: process.env.PGDATABASE || "byuconnect",
    ssl: getSslConfig(),
  };
}

loadEnv();

const shared = {
  client: "pg",
  connection: buildConnection(),
  pool: { min: 0, max: 10 },
  migrations: {
    directory: "./migrations",
    tableName: "knex_migrations",
  },
  seeds: {
    directory: "./seeds",
  },
};

module.exports = {
  development: shared,
  production: shared,
  staging: shared,
};
