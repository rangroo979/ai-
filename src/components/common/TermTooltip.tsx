import React, { useState } from 'react';
import { HelpCircle, X, ExternalLink, Lightbulb } from 'lucide-react';
import { GLOSSARY_TERMS } from '../../data/glossary';

interface TermTooltipProps {
  termKey: string;
  label?: string;
  className?: string;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({ termKey, label, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const termData = GLOSSARY_TERMS[termKey];

  if (!termData) {
    return label ? <span className={className}>{label}</span> : null;
  }

  return (
    <>
      <span className={`inline-flex items-center gap-1 group cursor-pointer ${className}`} onClick={() => setIsOpen(true)}>
        {label && <span>{label}</span>}
        <button
          type="button"
          aria-label={`${termKey} 용어 설명 보기`}
          className="text-slate-400 hover:text-blue-400 transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <HelpCircle className="w-3.5 h-3.5 inline opacity-75 group-hover:opacity-100" />
        </button>
      </span>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className="bg-[#131b2e] border border-slate-700/80 rounded-xl p-5 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    투자 용어 가이드
                  </span>
                  {termData.abbr && (
                    <span className="text-xs text-slate-400 font-mono">
                      {termData.abbr}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {termData.term}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {termData.fullDesc}
            </p>

            {termData.formula && (
              <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-3 mb-3">
                <span className="text-xs text-slate-400 block mb-1">계산 공식</span>
                <code className="text-xs text-blue-300 font-mono font-medium block">
                  {termData.formula}
                </code>
              </div>
            )}

            {termData.goodRange && (
              <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-3 mb-3 text-xs">
                <span className="text-slate-400 block mb-1">판단 기준</span>
                <span className="text-slate-200">{termData.goodRange}</span>
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200/90 flex gap-2 items-start">
              <Lightbulb className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-300 block mb-0.5">초보 투자자 Tip</strong>
                <span>{termData.beginnerTip}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
