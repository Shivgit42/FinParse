import { json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  fileUrl: text("file_url").notNull(),
  parsedData: json("parsedData"),
  status: text("status").default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
});
