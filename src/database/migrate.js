import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import pool from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsPath = path.join(__dirname, "migrations");

const runMigrations = async () => {
  const client = await pool.connect();

  try {
    console.log("Starting database migrations...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const files = await fs.readdir(migrationsPath);

    const migrationFiles = files
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const migrationFile of migrationFiles) {
      const result = await client.query(
        `
        SELECT 1
        FROM schema_migrations
        WHERE migration_name = $1
        `,
        [migrationFile],
      );

      if (result.rowCount > 0) {
        console.log(`Skipping migration: ${migrationFile}`);
        continue;
      }

      console.log(`Running migration: ${migrationFile}`);

      const migrationSql = await fs.readFile(
        path.join(migrationsPath, migrationFile),
        "utf-8",
      );

      await client.query("BEGIN");

      try {
        await client.query(migrationSql);

        await client.query(
          `
          INSERT INTO schema_migrations (migration_name)
          VALUES ($1)
          `,
          [migrationFile],
        );

        await client.query("COMMIT");

        console.log(`Migration completed: ${migrationFile}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("Database migrations completed successfully.");
  } catch (error) {
    console.error("Database migration failed:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

runMigrations()
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });