import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
  });

  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    
    // Ejecutar cada statement del schema
    const statements = schema.split(";").filter((stmt) => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Ejecutando:", statement.substring(0, 100) + "...");
        try {
          await connection.execute(statement);
          console.log("✓ Ejecutado");
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
    
    console.log("\n✓ Schema ejecutado correctamente");
  } catch (error) {
    console.error("Error ejecutando schema:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runSchema();
