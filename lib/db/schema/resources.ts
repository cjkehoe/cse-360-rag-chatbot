import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { nanoid } from "@/lib/utils";

// Define the common metadata fields
const baseMetadata = {
  title: z.string(),
  created_at: z.string(),
};

// Discussion-specific metadata
const discussionMetadata = {
  ...baseMetadata,
  thread_id: z.number(),
  is_answered: z.boolean(),
  is_staff_answered: z.boolean(),
  category: z.string(),
  subcategory: z.string(),
  answer_count: z.number(),
  view_count: z.number(),
};

// Project instruction metadata
const instructionMetadata = {
  ...baseMetadata,
  document_id: z.string(),
  section: z.string(),
  assignment_type: z.enum(['homework', 'project', 'syllabus', 'other']),
  page_number: z.number().optional(),
};

export const resources = pgTable("resources", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 })
    .notNull()
    .$default(() => 'discussion'), // Either 'discussion' or 'instruction'
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
  type: z.enum(['discussion', 'instruction']),
  metadata: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('discussion'),
      ...discussionMetadata,
    }),
    z.object({
      type: z.literal('instruction'),
      ...instructionMetadata,
    }),
  ]),
});

// Type for resources - used to type API request params and within Components
export type NewResourceParams = z.infer<typeof insertResourceSchema>;
