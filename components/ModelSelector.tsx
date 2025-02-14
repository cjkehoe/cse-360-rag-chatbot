'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SparklesIcon } from 'lucide-react';

interface ModelSelectorProps {
  model: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ model, onModelChange }: ModelSelectorProps) {
  return (
    <Select value={model} onValueChange={onModelChange}>
      <SelectTrigger className="w-[120px] h-8 gap-2 border-none bg-transparent hover:bg-muted/50 hover:text-accent-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
        <SparklesIcon className="size-3.5" />
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent className="border-none bg-muted backdrop-blur-sm">
        <SelectItem 
          value="gemini" 
          className="font-medium focus:bg-muted focus:text-foreground cursor-pointer"
        >
          Gemini
        </SelectItem>
        <SelectItem 
          value="gpt4" 
          className="font-medium focus:bg-muted focus:text-foreground cursor-pointer"
        >
          GPT-4
        </SelectItem>
      </SelectContent>
    </Select>
  );
} 