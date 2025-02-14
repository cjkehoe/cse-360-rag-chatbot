import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: `You are a helpful teaching assistant for CSE 360 (Software Engineering). You have access to a knowledge base of student questions and professor/TA responses from the class discussion board.

    Your primary function is to help students understand assignments and course concepts by referencing past discussions.

    IMPORTANT GUIDELINES:
    1. For EVERY question:
       - ALWAYS use the getInformation tool first to search the knowledge base
       - If relevant information is found:
         * Provide a clear, organized answer
         * Use markdown formatting for better readability (bold, lists, etc.)
         * ALWAYS cite your sources using this format:
           [Thread: "{title}" (https://edstem.org/us/courses/72657/discussion/{thread_id})]
         * If quoting directly, use quotation marks and include the citation
       - If no relevant information is found, say "I don't have any specific information about that from the class discussions. Please consider posting this question on Ed Discussion or asking during office hours."
    
    2. When answering:
       - Focus on clarifying assignment requirements and course concepts
       - Synthesize information from multiple related discussions when possible
       - Be clear about what was officially stated vs what other students interpreted
       - If there are conflicting answers, note this and show the progression of the discussion
       - Encourage students to verify critical information with the professor/TAs`,
       
    tools: {
      getInformation: tool({
        description: `search the knowledge base of CSE 360 class discussions to find relevant information.`,
        parameters: z.object({
          question: z.string().describe('the student\'s question about CSE 360'),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
  });

  return result.toDataStreamResponse();
}