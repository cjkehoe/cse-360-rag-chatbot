import { Message } from 'ai';
import { memo } from 'react';
import { cn } from "@/lib/utils";
import { Overview } from './Overview';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useScrollToBottom } from '@/lib/hooks/use-scroll-to-bottom';

interface MessagesProps {
  messages: Array<Message>;
  isLoading: boolean;
}

function MessageComponent({ role, content }: { role: string; content: string }) {
  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "w-full mx-auto max-w-3xl px-4 group/message",
          role === 'user' && "flex justify-end"
        )}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={role}
      >
        <div className={cn(
          'flex gap-4',
          role === 'user' ? 'max-w-2xl' : 'w-full'
        )}>
          {role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className={cn(
            'flex flex-col gap-4',
            role === 'user' ? 'bg-primary text-primary-foreground px-3 py-2 rounded-xl' : ''
          )}>
            {role === 'user' ? (
              <p className="text-sm">{content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Optional: customize how different elements are rendered
                    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 list-disc pl-4">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 list-decimal pl-4">{children}</ol>,
                    code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded">{children}</code>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ThinkingMessage() {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
    >
      <div className="flex gap-4">
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>
        <div className="flex flex-col gap-2 text-muted-foreground">
          Searching Ed Discussion...
        </div>
      </div>
    </motion.div>
  );
}

function PureMessages({ messages, isLoading }: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  return (
    <div 
      ref={messagesContainerRef}
      className="flex flex-col-reverse min-w-0 gap-6 flex-1 overflow-y-auto pt-4"
    >
      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />

      {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
        <ThinkingMessage />
      )}

      {messages.map((message) => (
        <MessageComponent 
          key={message.id} 
          role={message.role}
          content={message.content}
        />
      )).reverse()}

      {messages.length === 0 && <Overview />}
    </div>
  );
}

export const Messages = memo(PureMessages); 