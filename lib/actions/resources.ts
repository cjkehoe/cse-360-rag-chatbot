'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from '@/lib/db/schema/resources';
import { db } from '../db';
import { generateEmbeddings } from '../ai/embedding';
import { embeddings } from '../db/schema/embeddings';

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content, type, metadata } = insertResourceSchema.parse(input);

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
    const generatedEmbeddings = await generateEmbeddings(content);

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
    if (metadata.type === 'discussion') {
      return `Resource successfully created for thread ${metadata.thread_id}`;
    } else {
      return `Resource successfully created for document ${metadata.document_id}`;
    }
  } catch (e) {
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : 'Error, please try again.';
  }
};