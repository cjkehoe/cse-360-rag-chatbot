import { createResource } from '@/lib/actions/resources';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';
import { validateApiKey } from '@/lib/auth/validate-api-key';

// Type for the instruction data coming from Python script
interface InstructionData {
  content: string;
  metadata: {
    document_id: string;
    title: string;
    created_at: string;
    section: string;
    assignment_type: 'homework' | 'project' | 'syllabus' | 'other';
    page_number?: number;
  }
}

export async function POST(req: Request) {
  try {
    // Check API key before processing
    if (!validateApiKey(req)) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data: InstructionData[] = await req.json();
    
    if (!Array.isArray(data)) {
      return Response.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Process each instruction document
    const results = await Promise.all(
      data.map(async (item) => {
        try {
          return await createResource({
            content: item.content,
            type: 'instruction',
            metadata: {
              type: 'instruction',
              ...item.metadata
            }
          });
        } catch (error) {
          console.error(`Failed to process document ${item.metadata.document_id}:`, error);
          return `Failed to process document ${item.metadata.document_id}`;
        }
      })
    );

    return Response.json({ 
      message: 'Instructions batch processing complete',
      results 
    });
  } catch (error) {
    console.error('Instruction ingestion error:', error);
    return Response.json(
      { error: 'Failed to process instruction content' },
      { status: 500 }
    );
  }
} 