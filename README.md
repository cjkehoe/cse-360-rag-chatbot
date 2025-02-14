# CSE 360 RAG Chatbot

An AI teaching assistant that helps CSE 360 students by providing accurate answers from past Ed Discussion posts. Built with Retrieval-Augmented Generation (RAG) to ensure responses are grounded in official course content.

## How It Works

This chatbot uses advanced AI techniques to provide reliable answers about course content:

1. **Fetching Ed Discussion Content**: Ed Discussion posts are fetched directly from the ed discussion API and sent to our endpoint /api/ingest-batch
1. **Vector Database Storage**: Ingest batch generates embeddings for each post and stores them in a vector database
2. **Semantic Search**: When the user asks a question, the system performs semantic search to find the most relevant past discussions
3. **Contextual Responses**: GPT-4o synthesizes information from multiple sources to provide comprehensive, accurate answers
4. **Source Citations**: Every response includes links to the original Ed Discussion posts

## Tech Stack

- [Next.js](https://nextjs.org) 14 (App Router)
- [Vercel AI SDK](https://sdk.vercel.ai/docs) for streaming chat responses
- [OpenAI](https://openai.com) GPT-4o for natural language understanding
- [Drizzle ORM](https://orm.drizzle.team) with [Postgres](https://www.postgresql.org/) 
- [pgvector](https://github.com/pgvector/pgvector) for vector similarity search
- [shadcn/ui](https://ui.shadcn.com) and [TailwindCSS](https://tailwindcss.com) for the UI


## Features

- 🔍 Semantic search across all Ed Discussion posts
- 💬 Natural conversation interface
- 📚 Citations linking to original discussions
- ⚡ Real-time streaming responses
- 🎨 Clean, responsive UI

## Future Ideas (Feel free to add me on discord (onlamron is my username) if you are interested in contributing)

- Include canvas content in the vector database for retrieval
- Expand to include courses on ed discussion, not just CSE 360
- Add a chat history feature
- Add a share chat feature