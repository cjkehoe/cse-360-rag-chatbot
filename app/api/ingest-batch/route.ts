import { createResource } from '@/lib/actions/resources';
import { QuestionData } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const data: QuestionData[] = await req.json();
    
    if (!Array.isArray(data)) {
      return Response.json({ error: 'Invalid data format' }, { status: 400 });
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
      message: 'Batch processing complete',
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