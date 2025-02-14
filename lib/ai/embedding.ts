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
  // Generate embedding for user query
  const userQueryEmbedded = await generateEmbedding(userQuery);
  
  // Calculate similarity score
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;

  // First fetch highly relevant instruction content
  const instructionContent = await db
    .select({
      content: embeddings.content,
      similarity,
      resourceId: embeddings.resourceId,
      metadata: resources.metadata,
      type: resources.type,
    })
    .from(embeddings)
    .leftJoin(resources, eq(embeddings.resourceId, resources.id))
    .where(sql`${resources.type} = 'instruction' AND ${similarity} > 0.6`)
    .orderBy(desc(similarity))
    .limit(3);

  // Then fetch relevant discussion posts with smart boosting
  const discussionContent = await db
    .select({
      content: embeddings.content,
      similarity,
      resourceId: embeddings.resourceId,
      metadata: resources.metadata,
      type: resources.type,
    })
    .from(embeddings)
    .leftJoin(resources, eq(embeddings.resourceId, resources.id))
    .where(sql`${resources.type} = 'discussion' AND ${similarity} > 0.5`)
    .orderBy(
      sql`CASE 
        WHEN (${resources.metadata}->>'is_staff_answered')::boolean = true AND ${similarity} > 0.7 THEN ${similarity} + 0.2
        WHEN (${resources.metadata}->>'is_staff_answered')::boolean = true THEN ${similarity} + 0.1
        WHEN (${resources.metadata}->>'answer_count')::int > 3 THEN ${similarity} + 0.05
        ELSE ${similarity}
      END DESC`
    )
    .limit(6);

  // Combine and sort results
  return [...instructionContent, ...discussionContent]
    .sort((a, b) => {
      // Custom sorting logic that prioritizes:
      // 1. Official instructions with high similarity
      // 2. Staff-answered posts with high similarity
      // 3. Popular discussion threads
      const aScore = getCustomScore(a);
      const bScore = getCustomScore(b);
      return bScore - aScore;
    })
    .slice(0, 8);
};

const getCustomScore = (content: any) => {
  let score = content.similarity;
  
  // Boost official instructions
  if (content.type === 'instruction') {
    score += 0.1;
  }
  
  // Boost staff-answered posts
  if (content.type === 'discussion' && content.metadata.is_staff_answered) {
    score += 0.08;
  }
  
  // Small boost for popular threads
  if (content.metadata.answer_count > 3) {
    score += 0.03;
  }
  
  return score;
};