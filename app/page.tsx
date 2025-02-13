'use client';

import { useChat } from '@ai-sdk/react';
import { ChatInput } from '@/components/ChatInput';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 3,
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(m => (
          <div key={m.id} className="rounded-lg p-4 bg-card text-card-foreground">
            <div>
              <div className="font-bold text-primary">{m.role}</div>
              <p className="text-foreground">
                {m.content.length > 0 ? (
                  m.content
                ) : (
                  <span className="italic text-muted-foreground">
                    {'calling tool: ' + m?.toolInvocations?.[0].toolName}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 w-full max-w-md mb-8">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}