import { track as clientTrack } from '@vercel/analytics';
import { track as serverTrack } from '@vercel/analytics/server';

const isServer = typeof window === 'undefined';
const track = isServer ? serverTrack : clientTrack;

export const analytics = {
  // Message Events
  trackMessageSent: (messageLength: number, model: string) => {
    track('message_sent', {
      messageLength,
      model,
    });
  },

  trackResponseReceived: (responseLength: number, model: string, latency: number) => {
    track('response_received', {
      responseLength,
      model,
      latency,
    });
  },

  // Model Events
  trackModelSwitch: (fromModel: string, toModel: string) => {
    track('model_switched', {
      fromModel,
      toModel,
    });
  },

  // Error Events
  trackError: (errorType: string, errorMessage: string) => {
    track('error_occurred', {
      errorType,
      errorMessage,
    });
  },

  // Suggested Action Events
  trackSuggestedActionClick: (actionTitle: string) => {
    track('suggested_action_clicked', {
      actionTitle,
    });
  },
}; 