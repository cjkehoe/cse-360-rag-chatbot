import { createResource } from '@/lib/actions/resources';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';
import { validateApiKey } from '@/lib/auth/validate-api-key';
import { sql } from 'drizzle-orm';

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

// Function to wipe existing instruction data only
const wipeExistingInstructions = async () => {
  try {
    // Delete only instruction type resources
    // Due to cascade delete, this will also remove their embeddings
    await db.delete(resources)
      .where(sql`${resources.type} = 'instruction'`);
    return true;
  } catch (error) {
    console.error('Error wiping instruction data:', error);
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

    const data: InstructionData[] = await req.json();
    
    if (!Array.isArray(data)) {
      return Response.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Wipe existing instruction data before processing new batch
    const wiped = await wipeExistingInstructions();
    if (!wiped) {
      return Response.json(
        { error: 'Failed to clear existing instruction data' },
        { status: 500 }
      );
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
      message: 'Instructions wiped and new batch processing complete',
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