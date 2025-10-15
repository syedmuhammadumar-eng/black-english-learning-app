
export interface FillInTheBlankExercise {
  id: string;
  sentence: string;
  correctAnswer: string;
  baseVerb: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
  urduTranslation: string;
}

export interface RevisionCard {
    title: string;
    content: string;
}

export interface GrammarError {
    error: string;
    correction: string;
    explanation: string;
}
