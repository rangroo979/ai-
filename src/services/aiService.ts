import { AIAnalysisResult, AICompareResult, AIMarketSummaryResult, StockItem, MarketIndex } from '../types';
import { SectorItem } from '../data/mockMarket';

export async function fetchStockAnalysis(stock: StockItem): Promise<AIAnalysisResult> {
  try {
    const res = await fetch('/api/ai/stock-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.analysis;
  } catch (error) {
    console.warn('API error fetching stock analysis, returning fallback analysis:', error);
    return {
      summary: `${stock.name}(${stock.code})은(는) ${stock.companyInfo.sector} 업종의 선도 기업으로, 최근 현재가 ${stock.currentPrice.toLocaleString()}${stock.currency === 'KRW' ? '원' : '달러'}에 거래되고 있습니다. 견조한 펀더멘털을 유지하고 있으나 거시경제 변동성과 환율 추이에 대한 주의가 필요합니다.`,
      positiveFactors: [
        `${stock.companyInfo.mainBusiness.split(',')[0]} 분야에서의 확고한 시장 점유율 및 기술적 해자`,
        `ROE ${stock.financialRatios.roe}% 기반의 우수한 자기자본 수익 창출력`,
        `신성장 동력 및 차세대 기술 분야에 대한 적극적인 투자 집행`
      ],
      cautionFactors: [
        `글로벌 경기 둔화 우려 및 원자재/환율 변동성 확대 리스크`,
        `주요 전방 산업의 수요 사이클에 따른 단기 실적 변동 가능성`,
        `PER ${stock.financialRatios.per}배 수준에 따른 밸류에이션 점검 필요`
      ],
      evaluation: {
        profitability: { rating: stock.financialRatios.roe > 12 ? '좋음' : '보통', reason: `ROE ${stock.financialRatios.roe}%로 자본 대비 양호한 수익성을 유지하고 있습니다.` },
        growth: { rating: stock.changeRate >= 0 ? '좋음' : '보통', reason: '글로벌 수요 확대 및 신규 라인업 확장을 통한 실적 성장 잠재력을 보유하고 있습니다.' },
        stability: { rating: stock.financialRatios.debtRatio < 100 ? '좋음' : '보통', reason: `부채비율 ${stock.financialRatios.debtRatio}%로 안정적인 재무 완충력을 갖추고 있습니다.` },
        valuation: { rating: stock.financialRatios.per < 25 ? '좋음' : '보통', reason: `PER ${stock.financialRatios.per}배, PBR ${stock.financialRatios.pbr}배로 적정 수준에서 거래되고 있습니다.` },
      },
      reliability: '보통',
      reliabilityReason: '데모 데이터 기반 분석입니다. 실시간 공시 및 공식 재무제표와 교차 확인을 권장합니다.',
      analyzedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' 기준',
    };
  }
}

export async function askStockQuestion(stock: StockItem, question: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock, question }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.answer;
  } catch (error) {
    console.warn('API error asking question, returning fallback:', error);
    return `${stock.name}(${stock.code})에 관해 질문해 주신 내용에 대해, 현재 데이터 기준 현재가 ${stock.currentPrice.toLocaleString()}${stock.currency === 'KRW' ? '원' : '달러'}, PER ${stock.financialRatios.per}배, ROE ${stock.financialRatios.roe}%를 나타내고 있습니다. 단기 주가 변동보다 기업의 기초 체력과 산업 성장성을 종합적으로 고려하시기 바랍니다.`;
  }
}

export async function fetchMarketSummary(indices: MarketIndex[], sectors: SectorItem[]): Promise<AIMarketSummaryResult> {
  try {
    const res = await fetch('/api/ai/market-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indices, sectors }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.summary;
  } catch (error) {
    console.warn('API error fetching market summary, returning fallback:', error);
    return {
      mood: '반도체 대형주 중심의 선택적 강세장',
      leadingFactors: [
        'AI 반도체 수요 지속 및 외국인 매수세 유입',
        '주요 대형 기술주들의 견조한 펀더멘털',
        '저PBR 가치주의 안정적 배당 매력'
      ],
      downsideRisks: [
        '환율 변동성 확대 및 글로벌 금리 경로의 불확실성',
        '전기차 및 2차전지 등 일부 성장 섹터의 실적 캐즘'
      ],
      interestSectors: ['AI 반도체 및 첨단 패키징', '하이브리드 완성차', '글로벌 빅테크'],
      keyIssues: '반도체 업종 강세와 외국인 매수세가 시장 상승을 이끌고 있습니다. 다만 환율과 글로벌 금리 변동성은 단기 위험요인으로 확인됩니다.',
      analyzedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' 기준',
    };
  }
}

export async function fetchStockComparison(stocks: StockItem[]): Promise<AICompareResult> {
  try {
    const res = await fetch('/api/ai/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stocks }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.comparison;
  } catch (error) {
    console.warn('API error comparing stocks, returning fallback:', error);
    return {
      summary: `${stocks.map(s => s.name).join(', ')}의 재무 및 밸류에이션 비교 분석 결과입니다. 각 종목은 고유의 사업 모델과 경쟁력을 갖추고 있으므로, 성장성과 밸류에이션 사이의 균형을 검토해야 합니다.`,
      strengths: stocks.map(s => ({
        stockCode: s.code,
        stockName: s.name,
        text: `${s.companyInfo.sector} 분야에서의 탄탄한 입지와 ROE ${s.financialRatios.roe}% 수준의 우수한 자기자본 수익률`
      })),
      risks: stocks.map(s => ({
        stockCode: s.code,
        stockName: s.name,
        text: `PER ${s.financialRatios.per}배 수준에 따른 밸류에이션 검증 및 거시경제 경기 사이클 민감도`
      })),
      financialComparison: `재무 지표를 비교했을 때 수익성(ROE)은 ${stocks.reduce((prev, cur) => cur.financialRatios.roe > prev.financialRatios.roe ? cur : prev).name}이(가) 가장 앞서며, 안정성(부채비율)은 ${stocks.reduce((prev, cur) => cur.financialRatios.debtRatio < prev.financialRatios.debtRatio ? cur : prev).name}이(가) 견고한 모습을 보입니다.`,
      growthComparison: `선단 기술 및 AI 가치사슬과의 연계 정도에 따라 미래 성장 프리미엄이 차별화되고 있습니다.`,
      conclusionNote: '본 비교는 객관적 지표에 기반한 참고 정보이며 특정 종목의 매수를 권유하지 않습니다.'
    };
  }
}
