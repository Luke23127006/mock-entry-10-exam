export type QuestionType = 'mcq' | 'short_input' | 'cloze' | 'essay';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  content: string;
  options: string[];
}

export interface ShortInputQuestion extends BaseQuestion {
  type: 'short_input';
  content: string;
  hintText?: string;
  prefix?: string;
}

export interface ClozeQuestion extends BaseQuestion {
  type: 'cloze';
  passageContent: string;
  blanks: {
    id: string;
    type: 'input' | 'select';
    options?: string[];
  }[];
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  promptText: string;
  minWords?: number;
  maxWords?: number;
}

export type Question = MCQQuestion | ShortInputQuestion | ClozeQuestion | EssayQuestion;

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
