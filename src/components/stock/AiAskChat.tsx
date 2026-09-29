import React, { useState, useRef, useEffect } from 'react';
import { StockItem, AIChatMessage } from '../../types';
import { askStockQuestion } from '../../services/aiService';
import { Bot, User, Send, Sparkles, AlertCircle, CornerDownLeft } from 'lucide-react';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

interface AiAskChatProps {
  stock: StockItem;
}

export const AiAskChat: React.FC<AiAskChatProps> = ({ stock }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `안녕하세요! **${stock.name}(${stock.code})**에 대해 궁금한 점을 질문해 주세요.\n\n주요 실적 지표, 사업 포트폴리오의 장단점, 잠재 리스크 요인 등을 금융 데이터 기반으로 객관적으로 설명해 드립니다.`,
      timestamp: '방금 전',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    `${stock.name}의 핵심 장점은 뭐야?`,
    `최근 실적과 이익 추이는 어때?`,
    `이 회사의 주요 위험요인은 뭐야?`,
    `경쟁사와 비교하면 어떤 특징이 있어?`,
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const answer = await askStockQuestion(stock, q);
      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: AIChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '일시적인 오류로 답변을 생성하지 못했습니다. 잠시 후 다시 질문해 주세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#101827] border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden min-h-[560px]">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0d1424] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>AI에게 이 종목 질문하기</span>
              <span className="text-[11px] font-normal text-blue-400">· Gemini 연동</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              투자 결정을 대신하지 않으며, 균형 잡힌 분석 정보를 제공합니다.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>투자 참고용 답변</span>
        </div>
      </div>

      {/* Recommended Question Chips */}
      <div className="px-4 py-2.5 bg-[#0b0f19]/80 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>추천 질문:</span>
        </span>
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(sq)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs whitespace-nowrap transition-colors border border-slate-700/50 cursor-pointer disabled:opacity-50"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[460px]">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-[#162136] text-slate-200 border border-slate-700/60 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-line font-normal">
                {msg.content}
              </div>
              <div
                className={`text-[10px] mt-1.5 flex justify-end ${
                  msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#162136] border border-slate-700/60 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-300 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>{stock.name} 기업 데이터를 기반으로 답변을 작성하고 있습니다...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-800 bg-[#0d1424] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={`${stock.name}에 대해 궁금한 점을 입력하세요 (예: 최근 영업이익 추이는 어때?)`}
          disabled={isLoading}
          className="flex-1 bg-[#0b0f19] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isLoading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <span>보내기</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Disclaimer subtext */}
      <div className="px-4 py-2 bg-[#090d16] border-t border-slate-800/60 text-[10px] text-slate-500 text-center">
        AI 응답은 투자 권유가 아니며 오류가 있을 수 있으므로 실제 투자 판단 전 반드시 공시 자료를 확인하세요.
      </div>
    </div>
  );
};
