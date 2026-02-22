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
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredGroup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseStyles = `w-full p-2 border rounded-lg cursor-pointer flex justify-between items-center text-left select-none relative transition-colors ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
  }`;

  const dropdownBg = darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900';
  const itemHover = darkMode ? 'bg-gray-700' : 'bg-gray-100';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className={baseStyles}>
        <span className="truncate mr-2">{value || "Выберите категорию"}</span>
        <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>

      {isOpen && (
        <div className={`absolute top-full left-0 w-full md:w-60 mt-1 rounded-lg shadow-xl border z-50 py-1 ${dropdownBg}`}>
          {Object.entries(groups).map(([group, items]) => (
            <div 
              key={group}
              className="relative"
              onMouseEnter={() => setHoveredGroup(group)}
              onClick={() => setHoveredGroup(group)}
            >
              <div className={`px-4 py-2.5 flex justify-between items-center cursor-pointer transition-colors ${hoveredGroup === group ? itemHover : ''}`}>
                <span className="font-semibold text-sm">{group}</span>
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </div>

              {hoveredGroup === group && (
                <div className={`absolute top-0 left-full ml-1 w-48 rounded-lg shadow-xl border py-1 z-50 min-w-[12rem] ${dropdownBg}`}>
                  {(items as readonly string[]).map(cat => (
                    <div
                      key={cat}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(cat);
                        setIsOpen(false);
                        setHoveredGroup(null);
                      }}
                      className={`px-4 py-2 cursor-pointer text-sm border-l-4 border-transparent ${
                        darkMode 
                          ? 'hover:bg-blue-900/50 hover:text-blue-200' + (value === cat ? ' border-blue-500 bg-blue-900/30 text-white' : ' text-gray-300')
                          : 'hover:bg-blue-50 hover:text-blue-700' + (value === cat ? ' border-blue-500 bg-blue-50 text-blue-700 font-medium' : ' text-gray-600')
                      }`}
                    >
                      {cat}
                    </div>
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
