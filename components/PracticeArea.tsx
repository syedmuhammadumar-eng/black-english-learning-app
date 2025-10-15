
import React, { useState, useEffect, useCallback } from 'react';
import { generateFillInTheBlanks, generateQuiz } from '../services/geminiService';
import type { FillInTheBlankExercise, QuizQuestion } from '../types';
import { Loader } from './ui/Loader';
import { Button } from './ui/Button';

interface PracticeAreaProps {
  tense: string;
}

type AnswerStatus = 'unchecked' | 'correct' | 'incorrect';

export const PracticeArea: React.FC<PracticeAreaProps> = ({ tense }) => {
  const [exercises, setExercises] = useState<FillInTheBlankExercise[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [answerStatuses, setAnswerStatuses] = useState<Record<string, AnswerStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'fill' | 'quiz'>('fill');

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setUserAnswers({});
    setAnswerStatuses({});
    try {
      const [fetchedExercises, fetchedQuizzes] = await Promise.all([
        generateFillInTheBlanks(tense),
        generateQuiz(tense)
      ]);
      setExercises(fetchedExercises);
      setQuizQuestions(fetchedQuizzes);
    } catch (err) {
      console.error("Failed to fetch practice content:", err);
      setError("Could not load exercises. Please try a different topic or refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [tense]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleAnswerChange = (id: string, value: string) => {
    setUserAnswers(prev => ({ ...prev, [id]: value }));
    setAnswerStatuses(prev => ({ ...prev, [id]: 'unchecked' }));
  };

  const checkFillInTheBlank = (exercise: FillInTheBlankExercise) => {
    const userAnswer = userAnswers[exercise.id]?.trim() || '';
    const isCorrect = userAnswer.toLowerCase() === exercise.correctAnswer.toLowerCase();
    setAnswerStatuses(prev => ({ ...prev, [exercise.id]: isCorrect ? 'correct' : 'incorrect' }));
  };

  const checkQuizAnswer = (question: QuizQuestion) => {
    const userAnswer = userAnswers[question.id];
    const isCorrect = userAnswer === question.correctAnswer;
    setAnswerStatuses(prev => ({ ...prev, [question.id]: isCorrect ? 'correct' : 'incorrect' }));
  };

  const getInputColor = (status: AnswerStatus) => {
    switch (status) {
      case 'correct': return 'border-green-500 focus:ring-green-500';
      case 'incorrect': return 'border-red-500 focus:ring-red-500';
      default: return 'border-gray-600 focus:ring-white';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96"><Loader /></div>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">{tense} Practice</h2>
      <div className="flex border-b border-gray-700 mb-6">
          <button onClick={() => setActiveTab('fill')} className={`px-4 py-2 font-medium ${activeTab === 'fill' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>Fill in the Blanks</button>
          <button onClick={() => setActiveTab('quiz')} className={`px-4 py-2 font-medium ${activeTab === 'quiz' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}>Quiz</button>
      </div>
      
      {activeTab === 'fill' && (
        <div className="space-y-6">
          {exercises.map((ex, index) => (
            <div key={ex.id} className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-300 mb-2">{index + 1}. {ex.sentence.replace('___', '______')}</p>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={userAnswers[ex.id] || ''}
                  onChange={e => handleAnswerChange(ex.id, e.target.value)}
                  placeholder={`(${ex.baseVerb})`}
                  className={`bg-gray-800 border-2 rounded-md px-3 py-1 w-1/3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black transition-colors ${getInputColor(answerStatuses[ex.id] || 'unchecked')}`}
                />
                <Button onClick={() => checkFillInTheBlank(ex)} variant="secondary" size-sm>Check</Button>
                {answerStatuses[ex.id] === 'incorrect' && <span className="text-green-400 text-sm">Correct: {ex.correctAnswer}</span>}
                {answerStatuses[ex.id] === 'correct' && <span className="text-green-400 text-sm">Correct!</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'quiz' && (
         <div className="space-y-6">
            {quizQuestions.map((q, index) => (
              <div key={q.id} className="bg-gray-900 p-4 rounded-lg">
                <p className="font-semibold mb-3">{index + 1}. {q.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map(option => {
                      const status = answerStatuses[q.id];
                      const isSelected = userAnswers[q.id] === option;
                      const isCorrect = option === q.correctAnswer;
                      let optionClass = 'bg-gray-800 hover:bg-gray-700';
                      if (status !== 'unchecked' && isSelected) {
                          optionClass = isCorrect ? 'bg-green-700' : 'bg-red-700';
                      } else if (status !== 'unchecked' && isCorrect) {
                          optionClass = 'bg-green-700';
                      }

                      return (
                          <button
                            key={option}
                            onClick={() => handleAnswerChange(q.id, option)}
                            className={`p-2 rounded-md text-left transition-colors ${optionClass} ${isSelected && status === 'unchecked' ? 'ring-2 ring-white' : ''}`}
                          >
                            {option}
                          </button>
                      );
                  })}
                </div>
                <div className="mt-4">
                    <Button onClick={() => checkQuizAnswer(q)} variant="secondary" size-sm>Check Answer</Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
