'use client';

import { useChat } from '@ai-sdk/react';
import { ChatInput } from '@/components/ChatInput';
import { Messages } from '@/components/Messages';
import { useState } from 'react';

export default function Chat() {
  const [model, setModel] = useState('gemini');
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 3,
    body: {
      model,
    },
  });

  return (
    <div className="flex flex-col w-full max-w-5xl py-24 mx-auto stretch px-4">
      <div className="flex-1 space-y-6 overflow-y-auto">
        <Messages messages={messages} isLoading={isLoading} />
      </div>

      <div className="fixed bottom-0 w-full max-w-5xl p-4 mx-auto left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          messages={messages}
          model={model}
          onModelChange={setModel}
        />
      </div>
    </div>
  );
}