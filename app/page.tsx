'use client';

import { useChat } from '@ai-sdk/react';
import { ChatInput } from '@/components/ChatInput';
import { Messages } from '@/components/Messages';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 3,
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="flex-1 space-y-4 overflow-y-auto">
        <Messages messages={messages} isLoading={isLoading} />
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