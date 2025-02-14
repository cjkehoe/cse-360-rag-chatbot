import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: openai('gpt-4o'),
      messages,
      system: `You are a helpful teaching assistant for CSE 360 (Software Engineering). You have access to both official project instructions and student discussions from the class discussion board.

      Your primary function is to help students understand assignments and course concepts by combining official documentation with real student discussions and staff clarifications.

      IMPORTANT GUIDELINES:
      1. For EVERY question:
         - ALWAYS use the getInformation tool first to search the knowledge base
         - If relevant information is found:
           * Present a balanced answer that combines:
             - Official requirements from project instructions
             - Real examples and clarifications from discussions
             - Staff/TA explanations and interpretations
           * Provide a clear, organized answer using markdown formatting (bold, lists, etc.)
           * ALWAYS cite your sources using these formats:
             For project instructions: [Document: "{title}" Section: "{section}"]
             For discussions: [Thread: "{title}" (https://edstem.org/us/courses/72657/discussion/{thread_id})]
           * If quoting directly, use quotation marks and include the citation
         - If no relevant information is found, say "I don't have any specific information about that from the project instructions or class discussions. Please consider posting this question on Ed Discussion or asking during office hours."
      
      2. When answering:
         - Start with official requirements from project instructions
         - Then enhance understanding by showing how these requirements were discussed and clarified in Ed Discussion
         - Include practical examples or common questions from student discussions
         - When using discussion posts, prioritize staff/TA responses but also include helpful student insights
         - If there are conflicting interpretations:
           * Show both the official requirement and how it was interpreted in discussions
           * Note any clarifications provided by staff
           * Help students understand both the requirement and its practical application
         - Synthesize information to show both "what" (from instructions) and "how" (from discussions)`,
       
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
  } catch (error) {
    console.error('Chat error:', error);
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response('An unexpected error occurred', { status: 500 });
  }
}