import Link from 'next/link'

export const Overview = () => {
  return (
    <div className="max-w-4xl mx-auto md:mt-20">
      <div className="rounded-xl p-8 md:p-10 flex flex-col gap-8 leading-relaxed text-center max-w-2xl mx-auto">
        <p className="text-2xl md:text-4xl font-medium">
          CSE 360 Chatbot
        </p>
        <p className="text-muted-foreground text-lg md:text-xl">
          An{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://github.com/cjkehoe/cse-360-rag-chatbot"
            target="_blank"
          >
            open source
          </Link>{' '}
          AI assistant powered by Retrieval-Augmented Generation. Using a vector database and semantic search, it finds and synthesizes relevant information from past Ed Discussion posts and Official Course Documents to provide accurate answers about assignments and project requirements.
        </p>
      </div>
    </div>
  );
} 