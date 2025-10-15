
import React from 'react';
import type { RevisionCard } from '../types';

interface RevisionCardsProps {
    cards: RevisionCard[];
}

export const RevisionCards: React.FC<RevisionCardsProps> = ({ cards }) => {
    return (
        <div className="space-y-4">
            {cards.map((card, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-bold text-white">{card.title}</h4>
                    <p className="text-gray-300 text-sm mt-1">{card.content}</p>
                </div>
            ))}
        </div>
    );
};
