import React from 'react';
import { StockItem } from '../../types';
import { Building2, Calendar, User, Briefcase, Globe, MapPin, Hash, BarChart } from 'lucide-react';

interface CompanyInfoTabProps {
  stock: StockItem;
}

export const CompanyInfoTab: React.FC<CompanyInfoTabProps> = ({ stock }) => {
  const { companyInfo } = stock;

  return (
    <div className="space-y-6">
      {/* 1. Corporate Profile Overview */}
      <div className="bg-[#101827] border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building2 className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">
            기업 개요 및 비즈니스 모델
          </h3>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          {companyInfo.description}
        </p>

        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1 font-semibold flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>주요 사업 영역</span>
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">
            {companyInfo.mainBusiness}
          </p>
        </div>
      </div>

      {/* 2. Structured Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 업종 */}
        <div className="bg-[#101827] border border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <BarChart className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">업종 분류</span>
            <span className="text-sm font-semibold text-white">
              {companyInfo.sector}
            </span>
          </div>
        </div>

        {/* 대표자 */}
        <div className="bg-[#101827] border border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">대표이사</span>
            <span className="text-sm font-semibold text-white">
              {companyInfo.ceo}
            </span>
          </div>
        </div>

        {/* 설립일 */}
        <div className="bg-[#101827] border border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">설립일</span>
            <span className="text-sm font-semibold text-white">
              {companyInfo.foundedDate}
            </span>
          </div>
        </div>

        {/* 상장 주식 수 */}
        <div className="bg-[#101827] border border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">발행주식수</span>
            <span className="text-sm font-semibold text-white font-mono">
              {companyInfo.sharesOutstanding}
            </span>
          </div>
        </div>

        {/* 본사 위치 */}
        {companyInfo.headquarters && (
          <div className="bg-[#101827] border border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">본점 소재지</span>
              <span className="text-xs font-semibold text-white">
                {companyInfo.headquarters}
              </span>
            </div>
          </div>
        )}

        {/* 공식 홈페이지 */}
        {companyInfo.website && (
          <div className="bg-[#101827] border border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">공식 웹사이트</span>
              <span className="text-xs font-semibold text-blue-400">
                {companyInfo.website}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
