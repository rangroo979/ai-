import { MarketIndex } from '../types';

export const MOCK_INDICES: MarketIndex[] = [
  {
    id: 'kospi',
    name: 'KOSPI',
    code: 'KS11',
    currentValue: 2685.45,
    changeAmount: 24.30,
    changeRate: 0.91,
    history: [
      { time: '09:00', value: 2661.15 },
      { time: '10:00', value: 2672.40 },
      { time: '11:00', value: 2668.80 },
      { time: '12:00', value: 2675.30 },
      { time: '13:00', value: 2681.20 },
      { time: '14:00', value: 2679.50 },
      { time: '15:30', value: 2685.45 }
    ]
  },
  {
    id: 'kosdaq',
    name: 'KOSDAQ',
    code: 'KQ11',
    currentValue: 778.20,
    changeAmount: -3.85,
    changeRate: -0.49,
    history: [
      { time: '09:00', value: 782.05 },
      { time: '10:00', value: 780.40 },
      { time: '11:00', value: 776.30 },
      { time: '12:00', value: 779.10 },
      { time: '13:00', value: 777.60 },
      { time: '14:00', value: 775.90 },
      { time: '15:30', value: 778.20 }
    ]
  },
  {
    id: 'sp500',
    name: 'S&P 500',
    code: 'SPX',
    currentValue: 5738.17,
    changeAmount: 32.14,
    changeRate: 0.56,
    history: [
      { time: '09:30', value: 5706.03 },
      { time: '11:00', value: 5718.40 },
      { time: '12:30', value: 5724.80 },
      { time: '14:00', value: 5731.50 },
      { time: '15:00', value: 5729.10 },
      { time: '16:00', value: 5738.17 }
    ]
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ',
    code: 'IXIC',
    currentValue: 18179.59,
    changeAmount: 185.32,
    changeRate: 1.03,
    history: [
      { time: '09:30', value: 17994.27 },
      { time: '11:00', value: 18055.10 },
      { time: '12:30', value: 18092.40 },
      { time: '14:00', value: 18140.20 },
      { time: '15:00', value: 18125.80 },
      { time: '16:00', value: 18179.59 }
    ]
  }
];

export interface SectorItem {
  name: string;
  changeRate: number;
  leaderStock: string;
  description: string;
}

export const MOCK_SECTORS: SectorItem[] = [
  { name: '반도체 및 관련장비', changeRate: 3.42, leaderStock: 'SK하이닉스, 삼성전자', description: 'AI 반도체 수요 폭증과 HBM 공급 확대 기대감' },
  { name: '자동차 및 부품', changeRate: 1.35, leaderStock: '현대차, 기아', description: '하이브리드 판매 호조 및 주주환원 기대' },
  { name: '금융 / 은행', changeRate: 0.88, leaderStock: 'KB금융, 신한지주', description: '밸류업 지수 편입 및 안정적 배당 매력' },
  { name: '바이오 / 제약', changeRate: -0.45, leaderStock: '셀트리온, 삼성바이오', description: '금리 인하 지연 우려에 따른 단기 숨고르기' },
  { name: '인터넷 / 플랫폼', changeRate: -1.43, leaderStock: 'NAVER, 카카오', description: '광고 업황 둔화 및 글로벌 빅테크와의 경쟁' },
  { name: '2차전지 / 배터리', changeRate: -2.18, leaderStock: 'LG에너지솔루션, POSCO', description: '글로벌 전기차 캐즘(일시적 수요정체) 지속' }
];

export const DEFAULT_AI_MARKET_SUMMARY = {
  mood: '반도체 대형주 중심의 선택적 강세장',
  leadingFactors: [
    'AI 인프라 투자 지속에 따른 고대역폭메모리(HBM) 및 반도체 업종 외국인 순매수',
    '글로벌 주요 중앙은행의 완만한 통화정책 완화 기조',
    '정부 밸류업 프로그램 관련 저PBR 자동차·금융주의 안정적 하방 지지'
  ],
  downsideRisks: [
    '원/달러 환율 변동성 확대 및 원자재 가격 불안 요인',
    '전기차 및 2차전지 등 일부 성장 섹터의 실적 캐즘(수요 둔화)',
    '미국 기술주 밸류에이션 부담에 따른 일시적 차익실현 매물 출회'
  ],
  interestSectors: [
    'AI 반도체 및 첨단 패키징 장비/소재',
    '하이브리드 중심의 고배당 완성차',
    '현금흐름이 견고한 글로벌 빅테크'
  ],
  keyIssues: '반도체 업종 강세와 외국인 매수세가 시장 상승을 이끌고 있습니다. 다만 원/달러 환율과 글로벌 금리 변동성은 단기 위험요인으로 확인됩니다.',
  analyzedAt: '오늘 15:40 기준'
};
