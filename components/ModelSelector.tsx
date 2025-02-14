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
      <SelectTrigger className="w-[180px] h-8 gap-2 border-none bg-transparent hover:bg-muted/50 hover:text-accent-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 justify-start">
        <SparklesIcon className="size-3.5 shrink-0" />
        <SelectValue placeholder="Select model" className="text-left" />
      </SelectTrigger>
      <SelectContent className="border-none bg-muted backdrop-blur-sm min-w-[180px]">
        <SelectItem 
          value="gemini" 
          className="font-medium focus:bg-muted focus:text-foreground cursor-pointer whitespace-nowrap text-left pl-2"
        >
          Gemini 2.0 Flash
        </SelectItem>
        <SelectItem 
          value="gpt4" 
          className="font-medium focus:bg-muted focus:text-foreground cursor-pointer whitespace-nowrap text-left pl-2"
        >
          GPT-4o-mini
        </SelectItem>
      </SelectContent>
    </Select>
  );
} 