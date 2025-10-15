
import React from 'react';
import type { VocabularyItem } from '../types';
import { Loader } from './ui/Loader';

interface VocabularyWidgetProps {
  vocabulary: VocabularyItem[];
  isLoading: boolean;
}

export const VocabularyWidget: React.FC<VocabularyWidgetProps> = ({ vocabulary, isLoading }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">Movie Vocabulary</h3>
      {isLoading ? <Loader /> : (
        <div className="space-y-4">
          {vocabulary.map((item) => (
            <div key={item.word} className="bg-gray-900 p-3 rounded-md border border-gray-800">
              <p className="font-bold text-white">{item.word}</p>
              <p className="text-sm text-gray-400 italic">({item.urduTranslation})</p>
              <p className="text-sm text-gray-300 mt-1">{item.definition}</p>
              <p className="text-xs text-gray-500 mt-2">e.g., "{item.example}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
