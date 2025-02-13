export interface QuestionMetadata {
  thread_id: number;
  title: string;
  created_at: string;
  is_answered: boolean;
  is_staff_answered: boolean;
  category: string;
  subcategory: string;
  answer_count: number;
  view_count: number;
}

export interface QuestionData {
  content: string;
  metadata: QuestionMetadata;
} 