import { Message } from 'ai';
import { memo } from 'react';
import { cn } from "@/lib/utils";
import { Overview } from './Overview';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';

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
            <p className="text-sm">{content}</p>
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
          Thinking...
        </div>
      </div>
    </motion.div>
  );
}

function PureMessages({ messages, isLoading }: MessagesProps) {
  return (
    <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-auto pt-4">
      {messages.length === 0 && <Overview />}

      {messages.map((message) => (
        <MessageComponent 
          key={message.id} 
          role={message.role}
          content={message.content}
        />
      ))}

      {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
        <ThinkingMessage />
      )}
    </div>
  );
}

export const Messages = memo(PureMessages); 