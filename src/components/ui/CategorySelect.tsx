import React, { useState, useRef, useEffect } from 'react';
import { CATEGORY_GROUPS } from '../../types';

interface CategorySelectProps {
  value: string;
  onChange: (cat: string) => void;
  className?: string;
  darkMode?: boolean;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange, className = '', darkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Закрываем при клике вне
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

  const baseStyles = `w-full p-2 border rounded-lg cursor-pointer flex justify-between items-center text-left select-none relative ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
  }`;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Сама кнопка селекта */}
      <div onClick={() => setIsOpen(!isOpen)} className={baseStyles}>
        <span>{value}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>

      {/* Выпадающее меню */}
      {isOpen && (
        <div className={`absolute top-full left-0 w-48 mt-1 rounded-lg shadow-xl border z-50 ${
          darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          {Object.entries(CATEGORY_GROUPS).map(([group, items]) => (
            <div 
              key={group}
              className="relative group/item"
              onMouseEnter={() => setHoveredGroup(group)}
              // Для мобилок: клик тоже открывает подменю
              onClick={() => setHoveredGroup(group)}
            >
              <div className={`px-4 py-2 flex justify-between items-center cursor-pointer ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } ${hoveredGroup === group ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}>
                <span className="font-semibold">{group}</span>
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </div>

              {/* Подменю второго уровня (вылетает справа) */}
              {hoveredGroup === group && (
                <div className={`absolute top-0 left-full ml-1 w-48 rounded-lg shadow-xl border overflow-hidden max-h-64 overflow-y-auto ${
                  darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  {items.map(cat => (
                    <div
                      key={cat}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(cat);
                        setIsOpen(false);
                        setHoveredGroup(null);
                      }}
                      className={`px-4 py-2 cursor-pointer text-sm ${
                        darkMode 
                          ? 'hover:bg-blue-600 hover:text-white' + (value === cat ? ' bg-blue-900 text-blue-200' : '')
                          : 'hover:bg-blue-50 hover:text-blue-700' + (value === cat ? ' bg-blue-50 text-blue-700 font-medium' : '')
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