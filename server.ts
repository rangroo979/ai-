import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  getAllStocks,
  searchKrxStocks,
  getKrxStockByCode,
  formatDateKRX,
  getSpotlightStocks,
  getMarketMovers,
} from './krxService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client utility
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `당신은 투자 결정을 대신하는 투자 자문가가 아니라 금융 데이터를 이해하기 쉽게 분석하는 AI 분석 도우미입니다.
제공된 데이터만을 기반으로 분석하십시오.
확인되지 않은 최신 주가, 기업 실적, 뉴스 또는 시장 데이터를 사실처럼 만들어내지 마십시오.
데이터가 없거나 확인할 수 없는 경우 '현재 제공된 데이터만으로는 판단하기 어렵습니다.'라고 설명하십시오.
수익을 보장하거나 특정 종목의 매수 또는 매도를 강요하지 마십시오. ('무조건 사세요', '지금 매수하세요', '100% 오릅니다' 등의 표현은 절대 사용하지 마십시오)
긍정적인 요소와 위험요인을 균형 있게 설명하십시오.
사용자가 투자 판단을 직접 할 수 있도록 분석 근거를 이해하기 쉽게 설명하십시오.
모든 답변은 한국어로 정중하고 명확하게 작성하십시오.`;

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  const krxKey = process.env.KRX_API_KEY;
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    hasKrxKey: !!(krxKey && krxKey !== 'MY_KRX_API_KEY'),
    mode: 'production-ready',
    timestamp: new Date().toISOString(),
  });
});

// KRX OPEN API Endpoints
// 0. GET /api/krx/status - Status check for KRX API configuration & live state
app.get('/api/krx/status', async (_req: Request, res: Response) => {
  try {
    const krxKey = process.env.KRX_API_KEY;
    const isConfigured = !!(krxKey && krxKey !== 'MY_KRX_API_KEY');
    const result = await getAllStocks();
    res.json({
      isConfigured,
      isLive: result.isLive,
      baseDate: result.baseDate,
      baseDateFormatted: formatDateKRX(result.baseDate),
      kospiCount: result.kospiCount,
      kosdaqCount: result.kosdaqCount,
      totalCount: result.stocks.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'KRX 상태 확인 실패', details: err.message });
  }
});

// GET /api/krx/spotlight - Returns the spotlight stocks with real KRX prices
app.get('/api/krx/spotlight', async (_req: Request, res: Response) => {
  try {
    const stocks = await getSpotlightStocks();
    const result = await getAllStocks();
    res.json({
      success: true,
      isLive: result.isLive,
      baseDateFormatted: formatDateKRX(result.baseDate),
      stocks,
    });
  } catch (err: any) {
    console.error('Error in /api/krx/spotlight:', err);
    res.status(500).json({ error: '관심 종목을 가져오지 못했습니다.', details: err.message });
  }
});

// GET /api/krx/market-movers - Returns top gainers, losers, volume from KRX
app.get('/api/krx/market-movers', async (_req: Request, res: Response) => {
  try {
    const movers = await getMarketMovers();
    const result = await getAllStocks();
    res.json({
      success: true,
      isLive: result.isLive,
      baseDateFormatted: formatDateKRX(result.baseDate),
      ...movers,
    });
  } catch (err: any) {
    console.error('Error in /api/krx/market-movers:', err);
    res.status(500).json({ error: '시장 상위 종목을 가져오지 못했습니다.', details: err.message });
  }
});

// 1. GET /api/krx/stocks - Returns combined KOSPI + KOSDAQ daily trading data
app.get('/api/krx/stocks', async (req: Request, res: Response) => {
  try {
    const basDd = req.query.basDd as string | undefined;
    const result = await getAllStocks(basDd);
    res.json({
      success: true,
      baseDate: result.baseDate,
      baseDateFormatted: formatDateKRX(result.baseDate),
      isLive: result.isLive,
      count: result.stocks.length,
      stocks: result.stocks,
    });
  } catch (err: any) {
    console.error('Error in /api/krx/stocks:', err);
    res.status(500).json({ error: 'KRX 주식 데이터를 가져오지 못했습니다.', details: err.message });
  }
});

// 2. GET /api/krx/stocks/search?q=삼성 - Search by name or code
app.get('/api/krx/stocks/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const limit = Number(req.query.limit) || 20;
    const result = await searchKrxStocks(q, limit);
    res.json({
      success: true,
      query: q,
      baseDate: result.baseDate,
      baseDateFormatted: formatDateKRX(result.baseDate),
      isLive: result.isLive,
      count: result.stocks.length,
      stocks: result.stocks,
    });
  } catch (err: any) {
    console.error('Error in /api/krx/stocks/search:', err);
    res.status(500).json({ error: 'KRX 주식 검색에 실패했습니다.', details: err.message });
  }
});

// 3. GET /api/krx/stocks/:code - Get single stock detail by code (e.g. 005930)
app.get('/api/krx/stocks/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    const stock = await getKrxStockByCode(code);
    if (!stock) {
      return res.status(404).json({ error: `종목코드 '${code}'를 찾을 수 없습니다.` });
    }
    res.json({
      success: true,
      stock,
    });
  } catch (err: any) {
    console.error(`Error in /api/krx/stocks/${req.params.code}:`, err);
    res.status(500).json({ error: '종목 상세 정보를 가져오지 못했습니다.', details: err.message });
  }
});

// 1. Stock AI Analysis Endpoint
app.post('/api/ai/stock-analysis', async (req: Request, res: Response) => {
  const { stock } = req.body;
  if (!stock) {
    return res.status(400).json({ error: '종목 데이터가 누락되었습니다.' });
  }

  // Fallback high-quality demo analysis in case API key is unavailable or fails
  const fallbackAnalysis = {
    summary: `${stock.name}(${stock.code})은(는) ${stock.companyInfo.sector} 업종의 주요 기업으로, 최근 현재가 ${stock.currentPrice.toLocaleString()}${stock.currency === 'KRW' ? '원' : '달러'}에 거래되고 있습니다. 최근 재무제표 기준 매출과 영업이익 흐름은 업종 사이클의 영향을 받고 있으며, 선단 기술 및 시장 점유율 확대를 위한 전략적 투자를 지속하고 있습니다. 다만 글로벌 경기 변동 및 환율 위험에 대한 점검이 필요한 시점입니다.`,
    positiveFactors: [
      `${stock.companyInfo.mainBusiness.split(',')[0] || '주력 사업'} 부문의 견고한 시장 지배력 및 기술 경쟁력`,
      `ROE ${stock.financialRatios.roe}% 및 부채비율 ${stock.financialRatios.debtRatio}% 수준의 안정적인 재무 구조`,
      `신성장 동력 분야의 선제적 투자 및 글로벌 수요 회복 기대감`
    ],
    cautionFactors: [
      `글로벌 거시경제 둔화 및 원자재/환율 변동성 확대 리스크`,
      `동종 업계 내 경쟁 심화 및 설비투자에 따른 단기 마진 변동 가능성`,
      `주요 전방 산업의 수요 주기(Cycle) 변동에 따른 실적 변동성`
    ],
    evaluation: {
      profitability: {
        rating: stock.financialRatios.roe > 12 ? '좋음' : stock.financialRatios.roe > 6 ? '보통' : '주의',
        reason: `ROE ${stock.financialRatios.roe}% 수준으로 자본 투입 대비 ${stock.financialRatios.roe > 10 ? '우수한' : '보통의'} 이익 창출력을 시현하고 있습니다.`
      },
      growth: {
        rating: stock.changeRate > 0 ? '좋음' : '보통',
        reason: '주요 신사업 추진 및 시장 확대 전략에 따라 실적 개선 여력이 존재합니다.'
      },
      stability: {
        rating: stock.financialRatios.debtRatio < 100 ? '좋음' : stock.financialRatios.debtRatio < 200 ? '보통' : '주의',
        reason: `부채비율 ${stock.financialRatios.debtRatio}%로 ${stock.financialRatios.debtRatio < 100 ? '매우 건전한 재무 상태를 유지하고 있습니다.' : '적정 수준의 레버리지를 활용하고 있습니다.'}`
      },
      valuation: {
        rating: stock.financialRatios.per < 20 ? '좋음' : stock.financialRatios.per < 40 ? '보통' : '주의',
        reason: `PER ${stock.financialRatios.per}배, PBR ${stock.financialRatios.pbr}배 수준으로 ${stock.financialRatios.per < 20 ? '상대적 밸류에이션 부담이 적은 편입니다.' : '미래 성장 기대감이 주가에 선반영되어 있습니다.'}`
      }
    },
    reliability: '보통',
    reliabilityReason: '데모 데이터 기반 분석입니다. 실시간 공시 및 외부 감사 보고서와 함께 교차 검증을 권장합니다.',
    analyzedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' 기준'
  };

  if (!ai) {
    return res.json({ analysis: fallbackAnalysis });
  }

  try {
    const prompt = `다음 기업 데이터를 바탕으로 초보 투자자도 이해하기 쉬운 객관적이고 균형 잡힌 분석 보고서를 JSON 형식으로 작성해 주십시오.

기업명: ${stock.name} (${stock.code})
거래시장: ${stock.market}
현재가: ${stock.currentPrice} ${stock.currency} (변동률: ${stock.changeRate}%)
시가총액: ${stock.companyInfo.marketCapFormatted}
업종: ${stock.companyInfo.sector}
주요사업: ${stock.companyInfo.mainBusiness}
기업설명: ${stock.companyInfo.description}
주요 재무비율:
- PER: ${stock.financialRatios.per}배
- PBR: ${stock.financialRatios.pbr}배
- ROE: ${stock.financialRatios.roe}%
- 부채비율: ${stock.financialRatios.debtRatio}%
- 배당수익률: ${stock.financialRatios.dividendYield}%
- EPS: ${stock.financialRatios.eps}
- BPS: ${stock.financialRatios.bps}
연도별 실적 (최근 연도):
${JSON.stringify(stock.financialYears)}

요구사항:
1. summary: 기업의 현재 상황을 3~5문장의 자연스러운 한국어 문장으로 서술. 특정 종목 매수/매도를 권유하지 말 것.
2. positiveFactors: 3~4개의 구체적인 긍정적 요인 배열.
3. cautionFactors: 3~4개의 주의할 위험 요인 배열.
4. evaluation: profitability(수익성), growth(성장성), stability(안정성), valuation(밸류에이션) 4개 영역 각각 rating('좋음' | '보통' | '주의')과 reason(평가 근거 문장) 작성.
5. reliability: '높음' | '보통' | '낮음' 중 하나.
6. reliabilityReason: 데이터 완결성과 주의사항 설명.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            positiveFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            cautionFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            evaluation: {
              type: Type.OBJECT,
              properties: {
                profitability: {
                  type: Type.OBJECT,
                  properties: {
                    rating: { type: Type.STRING, enum: ['좋음', '보통', '주의'] },
                    reason: { type: Type.STRING }
                  },
                  required: ['rating', 'reason']
                },
                growth: {
                  type: Type.OBJECT,
                  properties: {
                    rating: { type: Type.STRING, enum: ['좋음', '보통', '주의'] },
                    reason: { type: Type.STRING }
                  },
                  required: ['rating', 'reason']
                },
                stability: {
                  type: Type.OBJECT,
                  properties: {
                    rating: { type: Type.STRING, enum: ['좋음', '보통', '주의'] },
                    reason: { type: Type.STRING }
                  },
                  required: ['rating', 'reason']
                },
                valuation: {
                  type: Type.OBJECT,
                  properties: {
                    rating: { type: Type.STRING, enum: ['좋음', '보통', '주의'] },
                    reason: { type: Type.STRING }
                  },
                  required: ['rating', 'reason']
                }
              },
              required: ['profitability', 'growth', 'stability', 'valuation']
            },
            reliability: { type: Type.STRING, enum: ['높음', '보통', '낮음'] },
            reliabilityReason: { type: Type.STRING }
          },
          required: ['summary', 'positiveFactors', 'cautionFactors', 'evaluation', 'reliability', 'reliabilityReason']
        }
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      parsed.analyzedAt = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' 기준';
      return res.json({ analysis: parsed });
    }
    return res.json({ analysis: fallbackAnalysis });
  } catch (err) {
    console.error('Gemini stock analysis error:', err);
    return res.json({ analysis: fallbackAnalysis });
  }
});

// 2. Ask AI about this stock
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  const { stock, question, history } = req.body;
  if (!stock || !question) {
    return res.status(400).json({ error: '종목과 질문 내용이 필요합니다.' });
  }

  const fallbackAnswer = (q: string): string => {
    if (q.includes('장점') || q.includes('강점')) {
      return `${stock.name}의 주요 장점은 ${stock.companyInfo.sector} 분야에서의 탄탄한 시장 입지와 ROE ${stock.financialRatios.roe}%에 달하는 견고한 이익 체력입니다. 특히 ${stock.companyInfo.mainBusiness} 부문에서 확보한 기술적 해자와 글로벌 네트워크가 지속적인 경쟁 우위 요소로 평가받고 있습니다.`;
    }
    if (q.includes('실적') || q.includes('매출')) {
      return `${stock.name}의 최근 재무 실적을 살펴보면, 최근 결산 기준 연간 매출과 영업이익 흐름이 안정적인 기조를 유지하고 있습니다. 부채비율은 ${stock.financialRatios.debtRatio}%로 재무 안정성이 양호하며, 주당순이익(EPS)은 ${stock.financialRatios.eps.toLocaleString()} 수준입니다.`;
    }
    if (q.includes('위험') || q.includes('주의')) {
      return `${stock.name} 투자 시 고려해야 할 위험 요인으로는 거시경제 환경(금리, 환율)의 불확실성과 글로벌 경쟁 심화에 따른 마진 압박 가능성이 있습니다. 또한 주가수익비율(PER)이 ${stock.financialRatios.per}배 수준이므로 향후 실적 성장성이 둔화될 경우 주가 조정 압력이 발생할 수 있습니다.`;
    }
    return `${stock.name}(${stock.code})에 대해 문의하신 내용과 관련하여, 현재 제공된 기업 데이터에 따르면 현재가 ${stock.currentPrice.toLocaleString()}${stock.currency === 'KRW' ? '원' : '달러'}, PER ${stock.financialRatios.per}배, PBR ${stock.financialRatios.pbr}배를 기록하고 있습니다. 긍정적인 요소와 리스크 요인을 함께 고려하시어 신중한 투자 판단을 권장합니다.`;
  };

  if (!ai) {
    return res.json({ answer: fallbackAnswer(question) });
  }

  try {
    const contextPrompt = `현재 사용자가 보고 있는 기업 데이터입니다:
기업명: ${stock.name} (${stock.code})
거래시장: ${stock.market}
현재가: ${stock.currentPrice} ${stock.currency}
업종: ${stock.companyInfo.sector}
주요 사업: ${stock.companyInfo.mainBusiness}
기업 소개: ${stock.companyInfo.description}
재무 지표: PER ${stock.financialRatios.per}배, PBR ${stock.financialRatios.pbr}배, ROE ${stock.financialRatios.roe}%, 부채비율 ${stock.financialRatios.debtRatio}%, 배당수익률 ${stock.financialRatios.dividendYield}%, EPS ${stock.financialRatios.eps}
최근 연도별 실적: ${JSON.stringify(stock.financialYears)}

사용자의 질문:
"${question}"

답변 지침:
1. 투자 자문가가 아닌 객관적 분석 도우미로서 답변하십시오.
2. 특정 종목을 사라고 하거나("지금 매수하세요", "무조건 오릅니다"), 팔라고 강요하지 마십시오.
3. 긍정적인 요소와 위험 요소를 균형 있게 설명하십시오.
4. 초보 투자자도 이해하기 쉬운 친절한 한국어로 답변하십시오 (3~5문단 이내).
5. 마지막에 투자 판단의 책임은 본인에게 있다는 취지의 안내를 자연스럽게 덧붙이십시오.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    const answer = response.text || fallbackAnswer(question);
    return res.json({ answer });
  } catch (err) {
    console.error('Gemini ask error:', err);
    return res.json({ answer: fallbackAnswer(question) });
  }
});

// 3. AI Market Summary Endpoint
app.post('/api/ai/market-summary', async (req: Request, res: Response) => {
  const { indices, sectors } = req.body;

  const fallback = {
    mood: '반도체 대형주 중심의 선택적 강세장',
    leadingFactors: [
      'AI 데이터센터 및 반도체 업종을 중심으로 한 외국인 매수세 유입',
      '주요 기업들의 견조한 분기 실적 가이던스 확인',
      '밸류업 정책 관련 저PBR 가치주의 하방 지지력'
    ],
    downsideRisks: [
      '환율 변동성 확대 및 글로벌 금리 경로의 불확실성',
      '성장 섹터 내 개별 종목별 차별화 심화에 따른 변동성 확대'
    ],
    interestSectors: ['AI 반도체 및 부품', '자동차/하이브리드', '배당 가치주'],
    keyIssues: '반도체 업종 강세와 외국인 매수세가 시장 상승을 이끌고 있습니다. 다만 환율과 글로벌 금리 변동성은 단기 위험요인으로 확인됩니다.',
    analyzedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' 기준'
  };

  if (!ai) {
    return res.json({ summary: fallback });
  }

  try {
    const prompt = `오늘의 주요 주식 시장 지수 및 섹터 데이터입니다:
지수 정보: ${JSON.stringify(indices || [])}
업종 정보: ${JSON.stringify(sectors || [])}

위 시장 데이터를 종합 분석하여, 투자자가 오늘 하루 시장 흐름을 한눈에 파악할 수 있는 요약 정보를 JSON으로 작성해 주십시오.

요구사항:
1. mood: 현재 시장의 분위기를 1문장으로 요약 (예: '반도체 업종 강세와 외국인 매수세가 이끄는 선별적 반등장')
2. leadingFactors: 시장 상승을 이끈 주요 요인 3가지 (문자열 배열)
3. downsideRisks: 시장이 경계해야 할 주요 위험 요인 2~3가지 (문자열 배열)
4. interestSectors: 주목할 만한 유망/관심 업종 3가지 (문자열 배열)
5. keyIssues: 2~3문장으로 정리된 종합 시장 코멘트`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            leadingFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            downsideRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            interestSectors: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyIssues: { type: Type.STRING }
          },
          required: ['mood', 'leadingFactors', 'downsideRisks', 'interestSectors', 'keyIssues']
        }
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      parsed.analyzedAt = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' 기준';
      return res.json({ summary: parsed });
    }
    return res.json({ summary: fallback });
  } catch (err) {
    console.error('Gemini market summary error:', err);
    return res.json({ summary: fallback });
  }
});

// 4. Compare Stocks AI Endpoint
app.post('/api/ai/compare', async (req: Request, res: Response) => {
  const { stocks } = req.body;
  if (!stocks || !Array.isArray(stocks) || stocks.length < 2) {
    return res.status(400).json({ error: '비교할 종목이 최소 2개 이상 필요합니다.' });
  }

  const fallback = {
    summary: `${stocks.map((s: any) => s.name).join(', ')}의 재무 및 밸류에이션 비교 분석 결과입니다. 각 종목은 속한 산업과 성장 국면에 따라 서로 다른 강점과 위험요인을 지니고 있으므로 투자 성향에 맞춘 다각적 접근이 필요합니다.`,
    strengths: stocks.map((s: any) => ({
      stockCode: s.code,
      stockName: s.name,
      text: `${s.companyInfo.sector} 내에서의 높은 시장 인지도 및 자기자본이익률(ROE ${s.financialRatios.roe}%) 기반의 안정적 수익 모델`
    })),
    risks: stocks.map((s: any) => ({
      stockCode: s.code,
      stockName: s.name,
      text: `PER ${s.financialRatios.per}배 수준에 따른 밸류에이션 점검 필요 및 업종 경기 사이클 변동 위험`
    })),
    financialComparison: `수익성(ROE) 측면에서는 ${stocks.reduce((prev: any, cur: any) => cur.financialRatios.roe > prev.financialRatios.roe ? cur : prev).name}이(가) 가장 돋보이며, 안정성(부채비율) 측면에서는 ${stocks.reduce((prev: any, cur: any) => cur.financialRatios.debtRatio < prev.financialRatios.debtRatio ? cur : prev).name}이(가) 낮은 부채비율을 보입니다.`,
    growthComparison: `기술 혁신 및 차세대 성장 모멘텀에서는 글로벌 기술 공급망과 연계된 기업이 상대적으로 높은 밸류에이션 프리미엄을 부여받고 있습니다.`,
    conclusionNote: '본 비교 분석은 투자자의 합리적 결정을 돕기 위한 참고자료이며 특정 종목의 매수를 추천하지 않습니다.'
  };

  if (!ai) {
    return res.json({ comparison: fallback });
  }

  try {
    const prompt = `다음 ${stocks.length}개 종목의 주요 투자 지표와 기업 데이터를 비교 분석하여 JSON 형식으로 출력해 주십시오.

비교 대상 기업 데이터:
${JSON.stringify(stocks.map((s: any) => ({
  name: s.name,
  code: s.code,
  sector: s.companyInfo.sector,
  currentPrice: s.currentPrice,
  currency: s.currency,
  marketCapFormatted: s.companyInfo.marketCapFormatted,
  per: s.financialRatios.per,
  pbr: s.financialRatios.pbr,
  roe: s.financialRatios.roe,
  debtRatio: s.financialRatios.debtRatio,
  dividendYield: s.financialRatios.dividendYield,
  recentRevenue: s.financialYears[s.financialYears.length - 1]?.revenue,
  recentOperatingIncome: s.financialYears[s.financialYears.length - 1]?.operatingIncome,
})))}

요구사항:
1. summary: 전체 비교 총평 (2~3문장). 특정 종목을 일방적으로 추천하지 말 것.
2. strengths: 각 기업별 고유의 핵심 강점 (stockCode, stockName, text 객체 배열)
3. risks: 각 기업별 주의해야 할 핵심 리스크 (stockCode, stockName, text 객체 배열)
4. financialComparison: 수익성(ROE), 재무안정성(부채비율), 밸류에이션(PER/PBR) 측면의 상세 비교 분석 (2~3문장)
5. growthComparison: 미래 성장성 및 산업 경쟁력 차이점 비교 (2~3문장)
6. conclusionNote: 투자 성향별(안정형 vs 성장추구형) 고려사항 안내 (중립적 어조)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stockCode: { type: Type.STRING },
                  stockName: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ['stockCode', 'stockName', 'text']
              }
            },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stockCode: { type: Type.STRING },
                  stockName: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ['stockCode', 'stockName', 'text']
              }
            },
            financialComparison: { type: Type.STRING },
            growthComparison: { type: Type.STRING },
            conclusionNote: { type: Type.STRING }
          },
          required: ['summary', 'strengths', 'risks', 'financialComparison', 'growthComparison', 'conclusionNote']
        }
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json({ comparison: parsed });
    }
    return res.json({ comparison: fallback });
  } catch (err) {
    console.error('Gemini compare error:', err);
    return res.json({ comparison: fallback });
  }
});

// Vite & Static file serving setup
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const krxKey = process.env.KRX_API_KEY;
  const isKrxConfigured = !!(krxKey && krxKey !== 'MY_KRX_API_KEY');

  // 1. KRX_API_KEY presence confirmation log
  console.log(`KRX_API_KEY configured: ${isKrxConfigured}`);

  // 2. Pre-fetch and warm up live KRX trading data
  if (isKrxConfigured) {
    try {
      await getAllStocks();
    } catch (e: any) {
      console.warn('Initial KRX data fetch failed:', e?.message || e);
    }
  }

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer();
