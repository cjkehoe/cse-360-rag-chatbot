import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '../db';
import { cosineDistance, desc, gt, sql, eq } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';
import { resources } from '../db/schema/resources';

const embeddingModel = openai.embedding('text-embedding-ada-002');

interface InstructionChunk {
  section: 'introduction' | 'task' | 'deliverable';
  number?: number;  // For tasks/deliverables
  content: string;
}

const generateInstructionChunks = (input: string): InstructionChunk[] => {
  // First clean the input
  let cleanedInput = input
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\d{1,2}\/\d{1,2}\/\d{2,4},\s+\d{1,2}:\d{2}\s+[AP]M[^\n]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const chunks: InstructionChunk[] = [];

  // Extract introduction
  const introMatch = cleanedInput.match(/Introduction(.*?)(?=Tasks)/s);
  if (introMatch) {
    chunks.push({
      section: 'introduction',
      content: introMatch[1].trim()
    });
  }

  // Extract tasks
  const tasksMatch = cleanedInput.match(/Tasks.*?(?=Deliverables)/s);
  if (tasksMatch) {
    const taskContent = tasksMatch[0];
    const taskMatches = taskContent.match(/\d+\.\s+(.*?)(?=\d+\.|Deliverables|$)/gs);
    taskMatches?.forEach(task => {
      const taskNumber = parseInt(task.match(/\d+/)?.[0] || '0');
      chunks.push({
        section: 'task',
        number: taskNumber,
        content: task.replace(/^\d+\.\s+/, '').trim()
      });
    });
  }

  // Extract deliverables
  const deliverablesMatch = cleanedInput.match(/Deliverables(.*?)$/s);
  if (deliverablesMatch) {
    const deliverableContent = deliverablesMatch[1];
    const deliverableMatches = deliverableContent.match(/Task \d+:.*?(?=Task \d+:|$)/gs);
    deliverableMatches?.forEach(deliverable => {
      const deliverableNumber = parseInt(deliverable.match(/Task (\d+):/)?.[1] || '0');
      chunks.push({
        section: 'deliverable',
        number: deliverableNumber,
        content: deliverable.trim()
      });
    });
  }

  return chunks;
};

const generateChunks = (input: string, type: string): string[] => {
  if (type === 'instruction') {
    const instructionChunks = generateInstructionChunks(input);
    return instructionChunks.map(chunk => {
      const prefix = chunk.section === 'task' ? `Task ${chunk.number}: ` :
                    chunk.section === 'deliverable' ? `Deliverable ${chunk.number}: ` :
                    'Introduction: ';
      return prefix + chunk.content;
    });
  }

  // For discussion posts, keep existing logic
  return input
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .reduce((chunks: string[], sentence) => {
      const currentChunk = chunks[chunks.length - 1];
      if (!currentChunk || (currentChunk + sentence).length > 500) {
        chunks.push(sentence);
      } else {
        chunks[chunks.length - 1] += ' ' + sentence;
      }
      return chunks;
    }, []);
};

export const generateEmbeddings = async (
  value: string,
  type: string = 'discussion'
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value, type);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;

  // Fetch results with type information and balanced boosting
  const similarContent = await db
    .select({
      content: embeddings.content,
      similarity,
      resourceId: embeddings.resourceId,
      metadata: resources.metadata,
      type: resources.type,
    })
    .from(embeddings)
    .leftJoin(resources, eq(embeddings.resourceId, resources.id))
    .where(gt(similarity, 0.5))
    .orderBy(
      // More balanced boosting between instructions and discussions
      sql`CASE 
        WHEN ${resources.type} = 'instruction' THEN ${similarity} + 0.1
        WHEN ${resources.type} = 'discussion' AND (${resources.metadata}->>'is_staff_answered')::boolean = true THEN ${similarity} + 0.08
        WHEN ${resources.type} = 'discussion' THEN ${similarity}
      END DESC`
    )
    .limit(8);  // Increased limit to get more varied context

  return similarContent;
};