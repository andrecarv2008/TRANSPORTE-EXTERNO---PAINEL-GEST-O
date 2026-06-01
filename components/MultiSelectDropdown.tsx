'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Check, Square, CheckSquare, ChevronDown, Filter, X } from 'lucide-react';

interface MultiSelectDropdownProps {
  title: string;
  placeholder: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  icon?: React.ReactNode;
}

export default function MultiSelectDropdown({
  title,
  placeholder,
  options,
  selectedValues,
  onChange,
  icon
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when user clicks outside the dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle individual toggle click
  const handleToggleOption = (value: string) => {
    let nextValues: string[];
    if (selectedValues.includes(value)) {
      nextValues = selectedValues.filter(val => val !== value);
    } else {
      nextValues = [...selectedValues, value];
    }
    onChange(nextValues);
  };

  // Select all matching options
  const handleSelectAll = () => {
    // Collect options that match search filter if search is active, else all options
    const filtered = options.filter(opt =>
      opt.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Union current selection with filtered matching ones
    const newSelection = Array.from(new Set([...selectedValues, ...filtered]));
    onChange(newSelection);
  };

  // Clear all matching options from selection
  const handleClearSelection = () => {
    if (!searchTerm) {
      onChange([]);
    } else {
      const filtered = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const newSelection = selectedValues.filter(val => !filtered.includes(val));
      onChange(newSelection);
    }
  };

  // Filter options based on live search keywords
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return options;
    }
    const term = searchTerm.toLowerCase();
    return options.filter(opt => opt.toLowerCase().includes(term));
  }, [options, searchTerm]);

  // Label to render inside the closed button
  const statusLabel = React.useMemo(() => {
    if (selectedValues.length === 0) {
      return 'Nenhum selecionado';
    }
    if (selectedValues.length === options.length) {
      return 'Todos';
    }
    if (selectedValues.length === 1) {
      return selectedValues[0];
    }
    return `${selectedValues.length} selecionados`;
  }, [selectedValues, options]);

  return (
    <div className="relative inline-block text-left" ref={containerRef} id={`multiselect-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => { if (isOpen) setSearchTerm(''); setIsOpen(!isOpen); }}
        className={`flex items-center gap-2 px-3.5 py-1.5 bg-[#eff4ff] border rounded-lg text-[11px] font-extrabold text-[#0b1c30] hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#004ac6] select-none ${
          selectedValues.length > 0 
            ? 'border-[#004ac6] bg-[#eff4ff]' 
            : 'border-[#c3c6d7]/40 bg-white/70'
        }`}
      >
        <span className="shrink-0 text-[#004ac6]">{icon}</span>
        <span className="truncate max-w-[120px] sm:max-w-[160px]">
          {title} ({statusLabel})
        </span>
        <ChevronDown className={`w-3 h-3 text-[#434655] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 bg-white rounded-xl shadow-2xl border border-[#c3c6d7] z-50 overflow-hidden flex flex-col"
          >
            {/* Header / Info bar */}
            <div className="px-4 py-3 bg-[#f8f9ff] border-b border-[#c3c6d7]/40 flex items-center justify-between">
              <span className="font-bold text-[11px] text-[#0b1c30] uppercase tracking-wider">
                Filtrar {title}
              </span>
              <span className="text-[10px] bg-[#004ac6] text-white px-2 py-0.5 rounded-full font-black">
                {selectedValues.length} selecionado{selectedValues.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Quick Actions Panel */}
            <div className="px-4 py-2 border-b border-[#c3c6d7]/20 flex items-center justify-between gap-2 bg-white">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[10.5px] font-extrabold text-[#004ac6] hover:underline flex items-center gap-1 select-none cursor-pointer"
              >
                Selecionar Todos
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[10.5px] font-extrabold text-red-500 hover:underline flex items-center gap-1 select-none cursor-pointer"
              >
                Limpar Seleção
              </button>
            </div>

            {/* Live Search Input */}
            <div className="p-2 border-b border-[#c3c6d7]/20 bg-gray-50/50">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#737686]" />
                <input
                  type="text"
                  placeholder={`Pesquisar ${placeholder}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-[11px] font-medium pl-8 pr-7 py-1.5 bg-white border border-[#c3c6d7]/40 rounded-md text-[#0b1c30] placeholder-[#737686] focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-2.5 h-2.5 text-[#737686]" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-[#737686]">
                  Nenhum registro correspondente
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isChecked = selectedValues.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleToggleOption(opt)}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-all flex items-center justify-between hover:bg-[#eff4ff]/60 border-b border-gray-50 last:border-b-0 cursor-pointer ${
                        isChecked ? 'text-[#004ac6] bg-[#eff4ff]/20' : 'text-[#434655]'
                      }`}
                    >
                      <span className="truncate pr-2 select-none uppercase">{opt}</span>
                      <div className="shrink-0">
                        {isChecked ? (
                          <div className="w-4 h-4 rounded bg-[#004ac6] flex items-center justify-center text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded border border-[#c3c6d7] bg-white hover:border-[#004ac6]" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
