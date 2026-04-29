import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runAuthSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "banco_hojas_vida",
  });

  try {
    const schemaPath = path.join(__dirname, "schema_auth.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    const statements = schema.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Ejecutando:", statement.substring(0, 80) + "...");
        try {
          await connection.execute(statement);
          console.log("✓ OK");
        } catch (error) {
          if (error.message.includes("already exists")) {
            console.log("⚠ Ya existe, omitiendo");
          } else {
            console.error("✗ Error:", error.message);
            throw error;
          }
        }
      }
    }

    console.log("\n✅ Tablas de autenticación creadas correctamente");
  } catch (error) {
    console.error("Error ejecutando schema de auth:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runAuthSchema();
