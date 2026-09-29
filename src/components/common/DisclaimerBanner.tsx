import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface DisclaimerBannerProps {
  className?: string;
  variant?: 'subtle' | 'card';
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ className = '', variant = 'card' }) => {
  if (variant === 'subtle') {
    return (
      <div className={`flex items-center gap-2 text-xs text-slate-400 py-2 px-3 bg-slate-900/60 rounded-lg border border-slate-800 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          본 서비스의 AI 분석 결과는 투자 참고용 정보이며, 투자 권유 또는 수익을 보장하지 않습니다. 실제 투자 결정과 그에 따른 책임은 사용자 본인에게 있습니다.
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl bg-[#101827] border border-slate-800 text-xs text-slate-400 flex items-start gap-3 shadow-xs ${className}`}>
      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
        <ShieldCheck className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-slate-200">
          투자 유의사항 및 면책 공지
        </p>
        <p className="leading-relaxed">
          본 서비스의 AI 분석 결과는 공개된 재무 데이터 및 가상 데모 정보를 바탕으로 한 <strong>투자 참고용 정보</strong>이며, 특정 종목의 매수·매도 권유 또는 미래 수익을 절대 보장하지 않습니다.
          모든 실제 투자 판단과 손익에 대한 최종 책임은 투자자 본인에게 있습니다.
        </p>
      </div>
    </div>
  );
};
