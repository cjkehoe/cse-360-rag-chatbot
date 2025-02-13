import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';
import { QuestionMetadata } from '@/lib/types';

// Add API key validation
const validateApiKey = (request: Request) => {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.INGESTION_API_KEY;
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  return true;
};

export async function GET(req: Request) {
  try {
    // Check API key before processing
    if (!validateApiKey(req)) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const existingResources = await db
      .select({
        metadata: resources.metadata
      })
      .from(resources);

    const existingThreadIds = existingResources.map(
      (resource) => (resource.metadata as QuestionMetadata).thread_id
    );

    return Response.json({ threadIds: existingThreadIds });
  } catch (error) {
    console.error('Error fetching existing threads:', error);
    return Response.json(
      { error: 'Failed to fetch existing threads' },
      { status: 500 }
    );
  }
} 