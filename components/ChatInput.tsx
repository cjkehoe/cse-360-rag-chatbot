'use client';

import { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import { ArrowUpIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { SuggestedActions } from './SuggestedActions';
import { Message } from 'ai';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  messages: Array<Message>;
}

export function ChatInput({ 
  input, 
  handleInputChange, 
  handleSubmit,
  isLoading,
  messages
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [input]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-4">
      {!input && messages.length === 0 && (
        <SuggestedActions
          input={input}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
        />
      )}
      
      <div className="relative w-full">
        <Textarea
          ref={textareaRef}
          placeholder="Send a message..."
          value={input}
          onChange={handleInputChange}
          className={cn(
            "min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl text-base md:text-lg bg-muted pb-12 dark:border-zinc-700",
          )}
          rows={1}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (!isLoading) {
                handleSubmit(event);
              }
            }
          }}
        />
        
        <div className="absolute bottom-0 right-0 p-3 w-fit flex flex-row justify-end">
          <Button
            className="rounded-full p-2 h-fit border dark:border-zinc-600"
            onClick={handleSubmit}
            disabled={input.length === 0 || isLoading}
          >
            <ArrowUpIcon className="size-4 md:size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 