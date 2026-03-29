import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";
import { getEnv } from "../config.js";

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!_db) {
    const pool = new pg.Pool({ connectionString: getEnv().DATABASE_URL });
    _db = drizzle(pool, { schema });
  }
  return _db;
}

export type Db = ReturnType<typeof getDb>;
