'use client';

import { useChat } from '@ai-sdk/react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
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

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <Input
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          className="bg-background border-input"
        />
      </form>
    </div>
  );
}