import React, { useState, useRef, useEffect } from 'react';

interface CategorySelectProps {
  value: string;
  onChange: (cat: string) => void;
  groups: Record<string, readonly string[]>;
  className?: string;
  darkMode?: boolean;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange, groups, className = '', darkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (openGroup && !(openGroup in groups)) {
      setOpenGroup(null);
    }
  }, [groups, openGroup]);

  const baseStyles = `w-full p-2 border rounded-lg cursor-pointer flex justify-between items-center text-left select-none relative transition-colors ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
  }`;

  const dropdownBg = darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900';
  const itemHover = darkMode ? 'bg-gray-700' : 'bg-gray-100';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={baseStyles}>
        <span className="truncate mr-2">{value || "Выберите категорию"}</span>
        <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 w-full mt-1 max-h-80 overflow-y-auto rounded-lg shadow-xl border z-50 py-1 ${dropdownBg}`}>
          {Object.entries(groups).map(([group, items]) => (
            <div 
              key={group}
              className="border-b last:border-b-0 border-gray-200/20"
            >
              <button
                type="button"
                onClick={() => setOpenGroup(current => current === group ? null : group)}
                className={`w-full px-4 py-2.5 flex justify-between items-center text-left cursor-pointer transition-colors ${openGroup === group ? itemHover : ''}`}
              >
                <span className="font-semibold text-sm">{group}</span>
                <svg className={`w-3 h-3 opacity-50 transition-transform ${openGroup === group ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {openGroup === group && (
                <div className={`px-2 pb-2 ${darkMode ? 'bg-gray-900/20' : 'bg-gray-50/60'}`}>
                  {(items as readonly string[]).map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(cat);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2 cursor-pointer rounded-md text-left text-sm border-l-4 border-transparent ${
                        darkMode 
                          ? 'hover:bg-blue-900/50 hover:text-blue-200' + (value === cat ? ' border-blue-500 bg-blue-900/30 text-white' : ' text-gray-300')
                          : 'hover:bg-blue-50 hover:text-blue-700' + (value === cat ? ' border-blue-500 bg-blue-50 text-blue-700 font-medium' : ' text-gray-600')
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
