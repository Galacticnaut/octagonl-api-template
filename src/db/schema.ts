import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

// ── Example table ───────────────────────────────────────────
// Replace with your own schema. Run `npm run db:generate` to
// create migration files after editing.

export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  entraOid: varchar("entra_oid", { length: 255 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: varchar("description", { length: 2000 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
