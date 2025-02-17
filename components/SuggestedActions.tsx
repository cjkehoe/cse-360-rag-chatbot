'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';
import { analytics } from '@/lib/analytics';

interface SuggestedActionsProps {
  input: string;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function PureSuggestedActions({ input, handleSubmit, handleInputChange }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'How many UML diagrams',
      label: 'do we need in HW2',
      action: 'How many UML diagrams do we need in HW2?',
    },
    {
      title: 'Can you explain',
      label: 'the user story #6?',
      action: 'Can you explain the user story #6?',
    },
    {
      title: 'Is Astah requried',
      label: 'for HW2?',
      action: 'Is Astah required for HW2?',
    },
    {
      title: 'How many classes',
      label: 'are required for HW2?',
      action: 'How many classes are required for HW2?',
    },
  ];

  const handleSuggestedActionClick = (action: string, title: string) => {
    analytics.trackSuggestedActionClick(title);
    
    const syntheticEvent = {
      target: { value: action },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleInputChange(syntheticEvent);
    setTimeout(() => {
      handleSubmit({} as React.FormEvent);
    }, 100);
  };

  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={() => handleSuggestedActionClick(
              suggestedAction.action,
              suggestedAction.title
            )}
            className="text-left border rounded-xl px-4 py-3.5 text-base flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions); 