export type QuestionType = 'mcq' | 'short_input' | 'essay';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  explanation?: string;
  correctAnswers: string[];
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  content: string;
  options: string[];
  variant?: 'default' | 'compact';
  layout?: '4x1' | '2x2' | '1x4';
}

export interface ShortInputQuestion extends BaseQuestion {
  type: 'short_input';
  content: string;
  hintText?: string;
  prefix?: string;
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  promptText: string;
  minWords?: number;
  maxWords?: number;
  rubric?: string;
}

export type Question = MCQQuestion | ShortInputQuestion | EssayQuestion;

export interface Section {
  title: string;
  instruction?: string;
  components: Question[];
  readingPassage?: string;
  wordBank?: string[];
}

export interface ExamDefinition {
  title: string;
  sections: Section[];
}
