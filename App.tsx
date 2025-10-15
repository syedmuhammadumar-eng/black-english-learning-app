import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { PracticeArea } from './components/PracticeArea';
import { WritingTask } from './components/WritingTask';
import { WritingTutor } from './components/WritingTutor';
import { RevisionCards } from './components/RevisionCards';
import { VocabularyWidget } from './components/VocabularyWidget';
import { Loader } from './components/ui/Loader';
// FIX: Removed getTensesList as it is not exported from geminiService and tenses are hardcoded from constants.
import { generateRevisionCards, generateVocabularyList } from './services/geminiService';
import type { RevisionCard, VocabularyItem } from './types';
import { TENSES } from './constants';

type View = 'practice' | 'writing' | 'revision' | 'tutor';

export default function App() {
  const [tenses, setTenses] = useState<string[]>(TENSES);
  const [selectedTense, setSelectedTense] = useState<string>(TENSES[0]);
  const [revisionCards, setRevisionCards] = useState<RevisionCard[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [activeView, setActiveView] = useState<View>('tutor');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Parallelize API calls
      const [cards, vocabList] = await Promise.all([
        generateRevisionCards(),
        generateVocabularyList()
      ]);

      setRevisionCards(cards);
      setVocabulary(vocabList);

    } catch (err) {
      console.error("Failed to load initial data:", err);
      setError("Failed to load content. Please check your Gemini API key and refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleTenseSelect = (tense: string) => {
    setSelectedTense(tense);
    setActiveView('practice');
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-full"><Loader /></div>;
    }
    if (error) {
      return <div className="flex items-center justify-center h-full text-red-400 p-8">{error}</div>;
    }
    switch (activeView) {
      case 'practice':
        return <PracticeArea key={selectedTense} tense={selectedTense} />;
      case 'writing':
        return <WritingTask />;
      case 'tutor':
        return <WritingTutor />;
      case 'revision':
        return <div className="p-8"><RevisionCards cards={revisionCards} /></div>;
      default:
        return <PracticeArea tense={selectedTense} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans flex antialiased">
      <Sidebar
        tenses={tenses}
        selectedTense={selectedTense}
        onSelectTense={handleTenseSelect}
        onSelectView={setActiveView}
        activeView={activeView}
      />
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto" style={{ maxHeight: '100vh' }}>
        <h1 className="text-4xl font-bold mb-2 tracking-tighter">Black</h1>
        <p className="text-gray-400 mb-8">Your daily path to English fluency.</p>
        {renderContent()}
      </main>
      <aside className="w-1/4 hidden lg:block border-l border-gray-800 p-6 overflow-y-auto" style={{ maxHeight: '100vh' }}>
        <VocabularyWidget vocabulary={vocabulary} isLoading={isLoading} />
        <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Daily Revision</h3>
            {isLoading ? <Loader /> : <RevisionCards cards={revisionCards} />}
        </div>
      </aside>
    </div>
  );
}