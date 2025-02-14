'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from '@/lib/db/schema/resources';
import { db } from '../db';
import { generateEmbeddings } from '../ai/embedding';
import { embeddings } from '../db/schema/embeddings';

const cleanInstructionContent = (content: string): string => {
  return content
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, '')
    // Remove page headers/footers
    .replace(/\d{1,2}\/\d{1,2}\/\d{2,4},\s+\d{1,2}:\d{2}\s+[AP]M[^\n]*/g, '')
    // Remove Canvas UI elements
    .replace(/Start Assignment/g, '')
    .replace(/\[\d+\]/g, '')
    // Fix common PDF conversion artifacts
    .replace(/\s+/g, ' ')
    .replace(/'\s*s\b/g, "'s")  // Fix broken possessives
    .replace(/\b(T|t)eam\s+'s/g, "$1eam's")
    .replace(/\bW\s+ord\b/g, "Word")
    .replace(/\bUGT\s+As\b/g, "UGTAs")
    .trim();
};

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content: rawContent, type, metadata } = insertResourceSchema.parse(input);

    // Clean content based on resource type
    const content = type === 'instruction' 
      ? cleanInstructionContent(rawContent)
      : rawContent;

    // First create the resource
    const [resource] = await db
      .insert(resources)
      .values({ 
        content,
        type,
        metadata 
      })
      .returning();

    // Generate embeddings for the content
    const generatedEmbeddings = await generateEmbeddings(content, type);

    // Store each embedding
    await Promise.all(
      generatedEmbeddings.map(({ content: chunkContent, embedding }) =>
        db.insert(embeddings).values({
          resourceId: resource.id,
          content: chunkContent,
          embedding
        })
      )
    );

    // Return appropriate message based on resource type
    if (type === 'discussion' && 'thread_id' in metadata) {
      return `Resource successfully created for thread ${metadata.thread_id}`;
    } else if (type === 'instruction' && 'document_id' in metadata) {
      return `Resource successfully created for document ${metadata.document_id}`;
    } else {
      return 'Resource successfully created';
    }
  } catch (e) {
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : 'Error, please try again.';
  }
};