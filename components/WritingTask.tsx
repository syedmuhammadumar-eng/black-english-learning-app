
import React, { useState, useEffect, useCallback } from 'react';
import { generateWritingTask, checkWritingGrammar } from '../services/geminiService';
import type { GrammarError } from '../types';
import { Loader } from './ui/Loader';
import { Button } from './ui/Button';

export const WritingTask: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [writing, setWriting] = useState('');
  const [feedback, setFeedback] = useState<GrammarError[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompt = useCallback(async () => {
    setIsLoadingPrompt(true);
    setError(null);
    try {
      const newPrompt = await generateWritingTask();
      setPrompt(newPrompt);
    } catch (err) {
      console.error("Failed to fetch writing prompt:", err);
      setError("Could not load a writing prompt. Please try again.");
    } finally {
      setIsLoadingPrompt(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  const handleGrammarCheck = async () => {
    if (!writing.trim()) return;
    setIsChecking(true);
    setFeedback(null);
    setError(null);
    try {
      const results = await checkWritingGrammar(writing);
      setFeedback(results);
    } catch (err) {
      console.error("Failed to check grammar:", err);
      setError("Grammar check failed. Please try again later.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Writing Practice</h2>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-300 mb-2">Your Task:</h3>
        {isLoadingPrompt ? <Loader /> : <p className="text-lg text-white">{prompt}</p>}
        {error && <p className="text-red-400 mt-2">{error}</p>}
        <Button onClick={fetchPrompt} variant="secondary" className="mt-3 text-sm py-1 px-3">New Task</Button>
      </div>

      <textarea
        value={writing}
        onChange={(e) => setWriting(e.target.value)}
        placeholder="Start writing here..."
        className="w-full h-64 p-4 bg-gray-800 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-colors"
      />

      <Button onClick={handleGrammarCheck} disabled={isChecking || !writing.trim()}>
        {isChecking ? 'Checking...' : 'Check Grammar'}
      </Button>

      {isChecking && <div className="flex items-center gap-2 text-gray-400"><Loader /><span>Analyzing your text...</span></div>}

      {feedback && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold mt-4">Feedback</h3>
          {feedback.length === 0 ? (
            <div className="bg-green-900/50 border border-green-700 p-4 rounded-lg">
              <p className="font-semibold text-green-300">Great job! No grammatical errors found.</p>
            </div>
          ) : (
            feedback.map((item, index) => (
              <div key={index} className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <p className="text-red-400 line-through">"{item.error}"</p>
                <p className="text-green-400">"{item.correction}"</p>
                <p className="text-gray-300 mt-2 text-sm">{item.explanation}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
