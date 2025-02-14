import { createResource } from '@/lib/actions/resources';
import { QuestionData } from '@/lib/types';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';
import { embeddings } from '@/lib/db/schema/embeddings';
import { sql } from 'drizzle-orm';

// Add API key validation
const validateApiKey = (request: Request) => {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.INGESTION_API_KEY;
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  return true;
};

// Function to wipe existing discussion data only
const wipeExistingData = async () => {
  try {
    // Delete only discussion type resources
    // Due to cascade delete, this will also remove their embeddings
    await db.delete(resources)
      .where(sql`${resources.type} = 'discussion'`);
    return true;
  } catch (error) {
    console.error('Error wiping discussion data:', error);
    return false;
  }
};

export async function POST(req: Request) {
  try {
    // Check API key before processing
    if (!validateApiKey(req)) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data: QuestionData[] = await req.json();
    
    if (!Array.isArray(data)) {
      return Response.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Wipe existing data before processing new batch
    const wiped = await wipeExistingData();
    if (!wiped) {
      return Response.json(
        { error: 'Failed to clear existing data' },
        { status: 500 }
      );
    }

    const results = await Promise.all(
      data.map(async (item) => {
        try {
          return await createResource({
            content: item.content,
            type: 'discussion',
            metadata: {
              type: 'discussion',
              ...item.metadata
            }
          });
        } catch (error) {
          console.error(`Failed to process item with thread_id ${item.metadata.thread_id}:`, error);
          return `Failed to process thread ${item.metadata.thread_id}`;
        }
      })
    );

    return Response.json({ 
      message: 'Database wiped and new batch processing complete',
      results 
    });
  } catch (error) {
    console.error('Batch ingestion error:', error);
    return Response.json(
      { error: 'Failed to process batch content' },
      { status: 500 }
    );
  }
} 