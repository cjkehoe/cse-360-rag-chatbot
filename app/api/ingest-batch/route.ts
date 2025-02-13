import { createResource } from '@/lib/actions/resources';
import { QuestionData } from '@/lib/types';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';
import { embeddings } from '@/lib/db/schema/embeddings';

// Add API key validation
const validateApiKey = (request: Request) => {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.INGESTION_API_KEY;
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  return true;
};

// Function to wipe existing data
const wipeExistingData = async () => {
  try {
    // Delete all records from both tables
    // Note: Due to cascade delete in schema, deleting from resources
    // will automatically delete related embeddings
    await db.delete(resources);
    return true;
  } catch (error) {
    console.error('Error wiping database:', error);
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
            metadata: item.metadata,
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