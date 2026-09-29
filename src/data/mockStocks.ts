import { StockItem, TimeRange, PricePoint } from '../types';

function generatePriceSeries(
  basePrice: number,
  pointsCount: number,
  volatility: number,
  trend: number, // positive for uptrend, negative for downtrend
  startDate: Date,
  intervalType: 'minute' | 'day' | 'week' | 'month'
): PricePoint[] {
  const points: PricePoint[] = [];
  let current = basePrice * (1 - trend * 0.5);

  for (let i = 0; i < pointsCount; i++) {
    const randomChange = (Math.random() - 0.48 + trend * 0.1) * volatility * current;
    const open = Math.round(current);
    const close = Math.round(current + randomChange);
    const high = Math.round(Math.max(open, close) + Math.random() * volatility * 0.5 * current);
    const low = Math.round(Math.min(open, close) - Math.random() * volatility * 0.5 * current);
    const volume = Math.round(50000 + Math.random() * 200000 + (Math.abs(open - close) / current) * 500000);

    const d = new Date(startDate.getTime());
    if (intervalType === 'minute') {
      d.setMinutes(d.getMinutes() + i * 5);
      points.push({
        date: d.toISOString().split('T')[0],
        time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        open,
        high,
        low,
        close,
        volume
      });
    } else if (intervalType === 'day') {
      d.setDate(d.getDate() + i);
      points.push({
        date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`,
        open,
        high,
        low,
        close,
        volume
      });
    } else if (intervalType === 'week') {
      d.setDate(d.getDate() + i * 7);
      points.push({
        date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`,
        open,
        high,
        low,
        close,
        volume: volume * 4
      });
    } else {
      d.setMonth(d.getMonth() + i);
      points.push({
        date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`,
        open,
        high,
        low,
        close,
        volume: volume * 15
      });
    }
    current = close;
  }
  return points;
}

function buildChartData(basePrice: number, volatility: number, trend: number): Record<TimeRange, PricePoint[]> {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
  const weekStart = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const monthStart = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const month3Start = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
  const yearStart = new Date(now.getTime() - 365 * 24 * 3600 * 1000);
  const year5Start = new Date(now.getTime() - 5 * 365 * 24 * 3600 * 1000);

  return {
    '1D': generatePriceSeries(basePrice, 30, volatility * 0.4, trend, dayStart, 'minute'),
    '1W': generatePriceSeries(basePrice, 7, volatility * 0.8, trend, weekStart, 'day'),
    '1M': generatePriceSeries(basePrice, 22, volatility, trend, monthStart, 'day'),
    '3M': generatePriceSeries(basePrice, 60, volatility * 1.2, trend, month3Start, 'day'),
    '1Y': generatePriceSeries(basePrice, 52, volatility * 1.5, trend, yearStart, 'week'),
    '5Y': generatePriceSeries(basePrice, 60, volatility * 2.0, trend, year5Start, 'month')
  };
}

export const MOCK_STOCKS: StockItem[] = [
  {
    id: 'samsung-electronics',
    name: '삼성전자',
    code: '005930',
    market: 'KOSPI',
    currency: 'KRW',
    currentPrice: 78500,
    changeAmount: 1800,
    changeRate: 2.35,
    openPrice: 77200,
    highPrice: 79100,
    lowPrice: 77000,
    volume: 18542310,
    tradingValue: 1452000000000,
    chartData: buildChartData(78500, 0.015, 0.08),
    companyInfo: {
      companyName: '삼성전자주식회사 (Samsung Electronics Co., Ltd.)',
      sector: '전기전자 / 반도체',
      foundedDate: '1969.01.13',
      ceo: '한종희, 경계현',
      mainBusiness: '메모리 반도체(DRAM, NAND), 시스템 LSI, 파운드리, 스마트폰(Galaxy), 가전 및 디스플레이',
      description: '삼성전자는 글로벌 메모리 반도체 및 스마트폰 시장 점유율 1위를 유지하고 있는 대한민국 대표 종합 IT 기업입니다. AI 시대 도래에 따른 고대역폭메모리(HBM) 및 최첨단 파운드리 선단공정 개발에 집중하고 있으며, 모바일 경험(MX)과 소비자가전(VD/DA) 부문에서도 프리미엄 생태계를 지속 강화하고 있습니다.',
      headquarters: '경기도 수원시 영통구 삼성로 129',
      website: 'www.samsung.com/sec',
      marketCap: 4686278, // 468조 원
      marketCapFormatted: '468조 6,278억 원',
      sharesOutstanding: '5,969,782,550주',
      week52High: 88800,
      week52Low: 67100
    },
    financialYears: [
      { year: '2021', revenue: 2796048, operatingIncome: 516339, netIncome: 399074, assets: 4266212, liabilities: 1217212 },
      { year: '2022', revenue: 3022314, operatingIncome: 433766, netIncome: 556541, assets: 4484245, liabilities: 936749 },
      { year: '2023', revenue: 2589355, operatingIncome: 65670, netIncome: 154871, assets: 4559060, liabilities: 922281 },
      { year: '2024(E)', revenue: 3125000, operatingIncome: 365000, netIncome: 315000, assets: 4890000, liabilities: 950000 }
    ],
    financialRatios: {
      per: 15.2,
      pbr: 1.35,
      roe: 10.4,
      debtRatio: 24.8,
      dividendYield: 2.15,
      eps: 5164,
      bps: 58150
    },
    newsIds: ['news-samsung-1', 'news-samsung-2', 'news-semi-1']
  },
  {
    id: 'sk-hynix',
    name: 'SK하이닉스',
    code: '000660',
    market: 'KOSPI',
    currency: 'KRW',
    currentPrice: 198000,
    changeAmount: 7500,
    changeRate: 3.94,
    openPrice: 192000,
    highPrice: 201000,
    lowPrice: 191500,
    volume: 6420100,
    tradingValue: 1265000000000,
    chartData: buildChartData(198000, 0.025, 0.15),
    companyInfo: {
      companyName: '에스케이하이닉스주식회사 (SK hynix Inc.)',
      sector: '전기전자 / 반도체',
      foundedDate: '1949.10.15',
      ceo: '곽노정',
      mainBusiness: 'HBM(고대역폭메모리), DRAM, NAND Flash, MCP 등 메모리 반도체',
      description: 'SK하이닉스는 AI 연산에 필수적인 HBM(고대역폭 메모리) 시장에서 글로벌 선도 지위를 확보하고 있는 글로벌 메모리 반도체 전문 기업입니다. 엔비디아(NVIDIA) 등 빅테크 기업에 HBM3E를 선제적으로 공급하며 초격차 기술 경쟁력을 유지하고 있습니다.',
      headquarters: '경기도 이천시 부발읍 경충대로 2091',
      website: 'www.skhynix.com',
      marketCap: 1441440,
      marketCapFormatted: '144조 1,440억 원',
      sharesOutstanding: '728,002,365주',
      week52High: 248500,
      week52Low: 114000
    },
    financialYears: [
      { year: '2021', revenue: 429978, operatingIncome: 124103, netIncome: 96162, assets: 963854, liabilities: 337300 },
      { year: '2022', revenue: 446481, operatingIncome: 70067, netIncome: 24389, assets: 1038724, liabilities: 508100 },
      { year: '2023', revenue: 327657, operatingIncome: -77303, netIncome: -91375, assets: 969440, liabilities: 539655 },
      { year: '2024(E)', revenue: 645000, operatingIncome: 228000, netIncome: 184000, assets: 1120000, liabilities: 480000 }
    ],
    financialRatios: {
      per: 8.9,
      pbr: 1.82,
      roe: 22.4,
      debtRatio: 48.5,
      dividendYield: 0.95,
      eps: 22247,
      bps: 108800
    },
    newsIds: ['news-skhynix-1', 'news-semi-1']
  },
  {
    id: 'naver',
    name: 'NAVER',
    code: '035420',
    market: 'KOSPI',
    currency: 'KRW',
    currentPrice: 172500,
    changeAmount: -2100,
    changeRate: -1.20,
    openPrice: 174600,
    highPrice: 175500,
    lowPrice: 171800,
    volume: 894500,
    tradingValue: 154800000000,
    chartData: buildChartData(172500, 0.018, -0.04),
    companyInfo: {
      companyName: '네이버 주식회사 (NAVER Corporation)',
      sector: '서비스업 / 인터넷 플랫폼',
      foundedDate: '1999.06.02',
      ceo: '최수연',
      mainBusiness: '인터넷 검색 포털(NAVER), 전자상거래(커머스), 웹툰/콘텐츠, 핀테크(네이버페이), 클라우드 및 생성형 AI(하이퍼클로바X)',
      description: '국내 1위 인터넷 검색 포털을 기반으로 커머스, 핀테크, 콘텐츠, 클라우드 등 다양한 디지털 사업을 영위하는 대표 플랫폼 기업입니다. 자체 초거대 생성형 AI 모델인 하이퍼클로바X(HyperCLOVA X)를 통해 B2B 엔터프라이즈 솔루션과 서비스 지능화를 추진 중입니다.',
      headquarters: '경기도 성남시 분당구 정자일로 95 네이버 1784',
      website: 'www.navercorp.com',
      marketCap: 283120,
      marketCapFormatted: '28조 3,120억 원',
      sharesOutstanding: '164,127,624주',
      week52High: 224000,
      week52Low: 151500
    },
    financialYears: [
      { year: '2021', revenue: 68176, operatingIncome: 13255, netIncome: 164776, assets: 336906, liabilities: 90226 },
      { year: '2022', revenue: 82201, operatingIncome: 13047, netIncome: 7604, assets: 338997, liabilities: 95528 },
      { year: '2023', revenue: 96706, operatingIncome: 14888, netIncome: 9884, assets: 361580, liabilities: 106720 },
      { year: '2024(E)', revenue: 106000, operatingIncome: 18500, netIncome: 14200, assets: 395000, liabilities: 110000 }
    ],
    financialRatios: {
      per: 19.8,
      pbr: 1.15,
      roe: 6.2,
      debtRatio: 38.6,
      dividendYield: 0.72,
      eps: 8712,
      bps: 150000
    },
    newsIds: ['news-naver-1', 'news-platform-1']
  },
  {
    id: 'kakao',
    name: '카카오',
    code: '035720',
    market: 'KOSPI',
    currency: 'KRW',
    currentPrice: 38400,
    changeAmount: -650,
    changeRate: -1.66,
    openPrice: 39050,
    highPrice: 39300,
    lowPrice: 38200,
    volume: 1250300,
    tradingValue: 48200000000,
    chartData: buildChartData(38400, 0.022, -0.09),
    companyInfo: {
      companyName: '주식회사 카카오 (Kakao Corp.)',
      sector: '서비스업 / 모바일 플랫폼',
      foundedDate: '1995.02.16',
      ceo: '정신아',
      mainBusiness: '카카오톡 메신저, 광고, 커머스(선물하기), 모빌리티, 페이, 엔터테인먼트, 게임',
      description: '국민 메신저 카카오톡을 중심으로 강력한 모바일 생태계를 구축한 플랫폼 기업입니다. 최근 카카오톡 개편과 AI 에이전트 서비스인 카나나(Kanana)를 통한 새로운 성장 모멘텀 발굴 및 그룹 지배구조 쇄신에 집중하고 있습니다.',
      headquarters: '제주특별자치도 제주시 첨단로 242',
      website: 'www.kakaocorp.com',
      marketCap: 170940,
      marketCapFormatted: '17조 940억 원',
      sharesOutstanding: '445,156,000주',
      week52High: 61900,
      week52Low: 34100
    },
    financialYears: [
      { year: '2021', revenue: 61366, operatingIncome: 5949, netIncome: 16460, assets: 228941, liabilities: 93240 },
      { year: '2022', revenue: 71068, operatingIncome: 5803, netIncome: 10629, assets: 229780, liabilities: 92830 },
      { year: '2023', revenue: 75570, operatingIncome: 4607, netIncome: -18230, assets: 215400, liabilities: 91200 },
      { year: '2024(E)', revenue: 81200, operatingIncome: 5800, netIncome: 3400, assets: 226000, liabilities: 90000 }
    ],
    financialRatios: {
      per: 45.2,
      pbr: 1.48,
      roe: 2.8,
      debtRatio: 66.2,
      dividendYield: 0.16,
      eps: 849,
      bps: 25945
    },
    newsIds: ['news-kakao-1', 'news-platform-1']
  },
  {
    id: 'hyundai-motor',
    name: '현대차',
    code: '005380',
    market: 'KOSPI',
    currency: 'KRW',
    currentPrice: 242000,
    changeAmount: 3500,
    changeRate: 1.47,
    openPrice: 239000,
    highPrice: 245000,
    lowPrice: 238000,
    volume: 980200,
    tradingValue: 237000000000,
    chartData: buildChartData(242000, 0.016, 0.06),
    companyInfo: {
      companyName: '현대자동차주식회사 (Hyundai Motor Company)',
      sector: '운수장비 / 완성차',
      foundedDate: '1967.12.29',
      ceo: '정의선, 이동석, 장재훈',
      mainBusiness: '승용차, SUV, 상용차, 친환경차(EV, 하이브리드, 수소차), 제네시스 럭셔리 브랜드',
      description: '글로벌 3위 완성차 그룹의 핵심 기업으로, 내연기관뿐 아니라 아이오닉(IONIQ) 시리즈를 앞세운 전동화(EV)와 하이브리드(HEV) 라인업에서 높은 수익성을 증명하고 있습니다. 주주환원 정책 확대와 밸류업 프로그램의 대표 수혜주로 평가받고 있습니다.',
      headquarters: '서울특별시 서초구 헌릉로 12',
      website: 'www.hyundai.com',
      marketCap: 507960,
      marketCapFormatted: '50조 7,960억 원',
      sharesOutstanding: '209,901,000주',
      week52High: 298000,
      week52Low: 178000
    },
    financialYears: [
      { year: '2021', revenue: 1176106, operatingIncome: 66789, netIncome: 56931, assets: 2339460, liabilities: 1530320 },
      { year: '2022', revenue: 1425275, operatingIncome: 98198, netIncome: 79826, assets: 2557425, liabilities: 1667230 },
      { year: '2023', revenue: 1626636, operatingIncome: 151269, netIncome: 122714, assets: 2795890, liabilities: 1823500 },
      { year: '2024(E)', revenue: 1740000, operatingIncome: 162000, netIncome: 135000, assets: 2950000, liabilities: 1880000 }
    ],
    financialRatios: {
      per: 5.4,
      pbr: 0.65,
      roe: 14.8,
      debtRatio: 175.4,
      dividendYield: 4.85,
      eps: 44814,
      bps: 372300
    },
    newsIds: ['news-hyundai-1']
  },
  {
    id: 'celltrion',
    name: '셀트리온',
    code: '068270',
    market: 'KOSPI',
    currency: 'KRW',
    currentPrice: 191200,
    changeAmount: -1300,
    changeRate: -0.68,
    openPrice: 193000,
    highPrice: 194500,
    lowPrice: 189800,
    volume: 520400,
    tradingValue: 99400000000,
    chartData: buildChartData(191200, 0.02, 0.02),
    companyInfo: {
      companyName: '주식회사 셀트리온 (Celltrion, Inc.)',
      sector: '의약품 / 바이오시밀러',
      foundedDate: '2002.02.26',
      ceo: '서정진, 기우성, 김형기',
      mainBusiness: '자가면역질환 및 항암 바이오시밀러(램시마, 램시마SC/짐펜트라, 트룩시마, 유플라이마) 개발 및 제조',
      description: '글로벌 바이오시밀러 산업을 개척한 대한민국 대표 바이오 제약 기업입니다. 셀트리온헬스케어와의 합병을 완료하고 미국 시장에서 신약으로 승인받은 짐펜트라(Zymfentra)의 처방 확대를 통해 글로벌 빅파마로 도약하고 있습니다.',
      headquarters: '인천광역시 연수구 아카데미로 23',
      website: 'www.celltrion.com',
      marketCap: 418700,
      marketCapFormatted: '41조 8,700억 원',
      sharesOutstanding: '218,985,000주',
      week52High: 241000,
      week52Low: 165000
    },
    financialYears: [
      { year: '2021', revenue: 19116, operatingIncome: 7569, netIncome: 5914, assets: 55430, liabilities: 17200 },
      { year: '2022', revenue: 22840, operatingIncome: 6472, netIncome: 5378, assets: 59300, liabilities: 16800 },
      { year: '2023', revenue: 21764, operatingIncome: 6515, netIncome: 5397, assets: 78500, liabilities: 24100 },
      { year: '2024(E)', revenue: 35200, operatingIncome: 8900, netIncome: 7100, assets: 94000, liabilities: 28000 }
    ],
    financialRatios: {
      per: 38.6,
      pbr: 3.12,
      roe: 8.5,
      debtRatio: 42.4,
      dividendYield: 0.65,
      eps: 4953,
      bps: 61280
    },
    newsIds: ['news-bio-1']
  },
  {
    id: 'apple',
    name: 'Apple',
    code: 'AAPL',
    market: 'NASDAQ',
    currency: 'USD',
    currentPrice: 228.5,
    changeAmount: 3.2,
    changeRate: 1.42,
    openPrice: 226.0,
    highPrice: 229.8,
    lowPrice: 225.4,
    volume: 48920000,
    tradingValue: 11178220000,
    chartData: buildChartData(228.5, 0.012, 0.09),
    companyInfo: {
      companyName: 'Apple Inc.',
      sector: 'Consumer Electronics & Software',
      foundedDate: '1976.04.01',
      ceo: 'Tim Cook',
      mainBusiness: 'iPhone, Mac, iPad, Apple Watch, Apple Vision Pro, Services (App Store, iCloud, Apple Pay)',
      description: '애플은 강력한 하드웨어와 독점적 소프트웨어 생태계를 통합한 글로벌 시가총액 최상위 빅테크 기업입니다. Apple Intelligence를 통한 디바이스 온디바이스 AI 혁신과 고수익 서비스 매출 비중 확대로 안정적인 현금 창출력을 입증하고 있습니다.',
      headquarters: '1 Apple Park Way, Cupertino, CA, USA',
      website: 'www.apple.com',
      marketCap: 3480000,
      marketCapFormatted: '$3.48T (약 4,800조 원)',
      sharesOutstanding: '15,204,000,000주',
      week52High: 237.2,
      week52Low: 164.1
    },
    financialYears: [
      { year: '2021', revenue: 365817, operatingIncome: 108949, netIncome: 94680, assets: 351002, liabilities: 287912 },
      { year: '2022', revenue: 394328, operatingIncome: 119437, netIncome: 99803, assets: 352755, liabilities: 302083 },
      { year: '2023', revenue: 383285, operatingIncome: 114301, netIncome: 96995, assets: 352583, liabilities: 290437 },
      { year: '2024(E)', revenue: 391000, operatingIncome: 123000, netIncome: 101000, assets: 364000, liabilities: 292000 }
    ],
    financialRatios: {
      per: 34.2,
      pbr: 47.8,
      roe: 154.2,
      debtRatio: 395.2,
      dividendYield: 0.44,
      eps: 6.68,
      bps: 4.78
    },
    newsIds: ['news-apple-1']
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    code: 'NVDA',
    market: 'NASDAQ',
    currency: 'USD',
    currentPrice: 124.8,
    changeAmount: 5.1,
    changeRate: 4.26,
    openPrice: 120.5,
    highPrice: 126.0,
    lowPrice: 119.8,
    volume: 92300000,
    tradingValue: 11519040000,
    chartData: buildChartData(124.8, 0.035, 0.22),
    companyInfo: {
      companyName: 'NVIDIA Corporation',
      sector: 'Semiconductors & AI Hardware',
      foundedDate: '1993.04.05',
      ceo: 'Jensen Huang',
      mainBusiness: 'GPU for AI/Data Center (H100, H200, Blackwell B200), CUDA Software Architecture, GeForce Gaming',
      description: '엔비디아는 전 세계 생성형 AI 열풍의 최대 수혜 기업이자 AI 가속기 GPU 및 가속 컴퓨팅 생태계의 절대 강자입니다. 차세대 블랙웰(Blackwell) 아키텍처 출시와 엔터프라이즈 AI 인프라 수요 폭증에 힘입어 기록적인 실적 성장을 구가하고 있습니다.',
      headquarters: '2788 San Tomas Expressway, Santa Clara, CA, USA',
      website: 'www.nvidia.com',
      marketCap: 3060000,
      marketCapFormatted: '$3.06T (약 4,220조 원)',
      sharesOutstanding: '24,520,000,000주',
      week52High: 140.7,
      week52Low: 40.8
    },
    financialYears: [
      { year: '2021', revenue: 26914, operatingIncome: 10041, netIncome: 9752, assets: 44187, liabilities: 17575 },
      { year: '2022', revenue: 26974, operatingIncome: 4224, netIncome: 4368, assets: 41182, liabilities: 19081 },
      { year: '2023', revenue: 60922, operatingIncome: 32972, netIncome: 29760, assets: 65728, liabilities: 22750 },
      { year: '2024(E)', revenue: 125000, operatingIncome: 78000, netIncome: 65000, assets: 98000, liabilities: 26000 }
    ],
    financialRatios: {
      per: 46.8,
      pbr: 42.5,
      roe: 91.5,
      debtRatio: 36.1,
      dividendYield: 0.03,
      eps: 2.67,
      bps: 2.94
    },
    newsIds: ['news-nvidia-1', 'news-semi-1']
  },
  {
    id: 'tesla',
    name: 'Tesla',
    code: 'TSLA',
    market: 'NASDAQ',
    currency: 'USD',
    currentPrice: 254.2,
    changeAmount: -4.8,
    changeRate: -1.85,
    openPrice: 258.0,
    highPrice: 261.2,
    lowPrice: 252.1,
    volume: 68100000,
    tradingValue: 17311020000,
    chartData: buildChartData(254.2, 0.032, -0.03),
    companyInfo: {
      companyName: 'Tesla, Inc.',
      sector: 'Automotive & Clean Energy / AI Robotics',
      foundedDate: '2003.07.01',
      ceo: 'Elon Musk',
      mainBusiness: '전기차(Model 3, Y, S, X, Cybertruck), 에너지 저장장치(Megapack), FSD(자율주행), Optimus 휴머노이드 로봇',
      description: '테슬라는 전기차 대중화를 주도한 모빌리티 기업을 넘어 자율주행(FSD), 로보택시(Cybercab), 에너지 솔루션 및 휴머노이드 로봇을 아우르는 차세대 피지컬 AI 플랫폼 기업으로 전환하고 있습니다.',
      headquarters: '1 Tesla Road, Austin, TX, USA',
      website: 'www.tesla.com',
      marketCap: 810000,
      marketCapFormatted: '$810B (약 1,118조 원)',
      sharesOutstanding: '3,189,000,000주',
      week52High: 271.0,
      week52Low: 138.8
    },
    financialYears: [
      { year: '2021', revenue: 53823, operatingIncome: 6523, netIncome: 5519, assets: 62131, liabilities: 30548 },
      { year: '2022', revenue: 81462, operatingIncome: 13656, netIncome: 12583, assets: 82338, liabilities: 36440 },
      { year: '2023', revenue: 96773, operatingIncome: 8891, netIncome: 14997, assets: 106618, liabilities: 43009 },
      { year: '2024(E)', revenue: 102000, operatingIncome: 9800, netIncome: 11200, assets: 118000, liabilities: 45000 }
    ],
    financialRatios: {
      per: 72.5,
      pbr: 11.2,
      roe: 15.4,
      debtRatio: 61.5,
      dividendYield: 0.0,
      eps: 3.51,
      bps: 22.69
    },
    newsIds: ['news-tesla-1']
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    code: 'MSFT',
    market: 'NASDAQ',
    currency: 'USD',
    currentPrice: 428.1,
    changeAmount: 4.6,
    changeRate: 1.09,
    openPrice: 424.0,
    highPrice: 429.5,
    lowPrice: 423.2,
    volume: 18450000,
    tradingValue: 7898445000,
    chartData: buildChartData(428.1, 0.014, 0.08),
    companyInfo: {
      companyName: 'Microsoft Corporation',
      sector: 'Cloud & Enterprise Software / AI',
      foundedDate: '1975.04.04',
      ceo: 'Satya Nadella',
      mainBusiness: '클라우드 플랫폼(Azure), 생산성 소프트웨어(Office 365, Copilot), Windows OS, Gaming(Xbox, Activision Blizzard)',
      description: '마이크로소프트는 OpenAI와의 전략적 제휴를 통해 AI 시대를 선도하는 글로벌 클라우드 및 소프트웨어 거인입니다. 기업용 클라우드 Azure와 M365 Copilot을 앞세워 실질적인 생성형 AI 수익화를 가장 빠르게 실현하고 있습니다.',
      headquarters: 'One Microsoft Way, Redmond, WA, USA',
      website: 'www.microsoft.com',
      marketCap: 3180000,
      marketCapFormatted: '$3.18T (약 4,390조 원)',
      sharesOutstanding: '7,430,000,000주',
      week52High: 468.3,
      week52Low: 309.4
    },
    financialYears: [
      { year: '2021', revenue: 168088, operatingIncome: 69916, netIncome: 61271, assets: 333779, liabilities: 191791 },
      { year: '2022', revenue: 198270, operatingIncome: 83383, netIncome: 72738, assets: 364840, liabilities: 198298 },
      { year: '2023', revenue: 211915, operatingIncome: 88523, netIncome: 72361, assets: 411976, liabilities: 205753 },
      { year: '2024(E)', revenue: 245000, operatingIncome: 109000, netIncome: 88000, assets: 450000, liabilities: 210000 }
    ],
    financialRatios: {
      per: 36.1,
      pbr: 13.2,
      roe: 36.8,
      debtRatio: 87.5,
      dividendYield: 0.75,
      eps: 11.86,
      bps: 32.43
    },
    newsIds: ['news-microsoft-1']
  }
];
