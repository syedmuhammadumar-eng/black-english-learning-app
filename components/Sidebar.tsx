
import React from 'react';

interface SidebarProps {
  tenses: string[];
  selectedTense: string;
  onSelectTense: (tense: string) => void;
  onSelectView: (view: 'practice' | 'writing' | 'revision') => void;
  activeView: 'practice' | 'writing' | 'revision';
}

export const Sidebar: React.FC<SidebarProps> = ({ tenses, selectedTense, onSelectTense, onSelectView, activeView }) => {
  const NavItem: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
  }> = ({ onClick, isActive, children }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-white text-black font-semibold'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <nav className="w-64 bg-black border-r border-gray-800 p-4 flex flex-col space-y-6">
      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4">Main</h2>
        <div className="space-y-1">
          <NavItem onClick={() => onSelectView('writing')} isActive={activeView === 'writing'}>
            Writing Practice
          </NavItem>
          <NavItem onClick={() => onSelectView('revision')} isActive={activeView === 'revision'}>
            Revision
          </NavItem>
        </div>
      </div>
      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4">Tenses</h2>
        <div className="space-y-1 max-h-[70vh] overflow-y-auto">
          {tenses.map((tense) => (
            <NavItem
              key={tense}
              onClick={() => onSelectTense(tense)}
              isActive={activeView === 'practice' && selectedTense === tense}
            >
              {tense}
            </NavItem>
          ))}
        </div>
      </div>
    </nav>
  );
};
