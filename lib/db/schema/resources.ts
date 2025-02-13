import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { nanoid } from "@/lib/utils";

export const resources = pgTable("resources", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  content: text("content").notNull(),
  metadata: jsonb("metadata").notNull(),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for resources - used to validate API requests
export const insertResourceSchema = z.object({
  content: z.string(),
  metadata: z.object({
    thread_id: z.number(),
    title: z.string(),
    created_at: z.string(),
    is_answered: z.boolean(),
    is_staff_answered: z.boolean(),
    category: z.string(),
    subcategory: z.string(),
    answer_count: z.number(),
    view_count: z.number(),
  }),
});

// Type for resources - used to type API request params and within Components
export type NewResourceParams = z.infer<typeof insertResourceSchema>;
