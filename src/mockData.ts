import { AssetType, CompanyProfile, PricePoint, NewsArticle, MacroIndicator, SentimentData } from './types';

export interface AssetInfo {
  symbol: string;
  name: string;
  type: AssetType;
  basePrice: number;
  volatility: number; // Daily volatility percentage
  drift: number; // Daily price drift
}

export const SUPPORTED_ASSETS: AssetInfo[] = [
  // Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', basePrice: 175.50, volatility: 0.015, drift: 0.0003 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', basePrice: 415.20, volatility: 0.013, drift: 0.0004 },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', basePrice: 180.10, volatility: 0.035, drift: -0.0002 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', basePrice: 178.40, volatility: 0.018, drift: 0.0003 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', basePrice: 152.30, volatility: 0.016, drift: 0.0002 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', basePrice: 875.00, volatility: 0.038, drift: 0.0012 },
  
  // ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf', basePrice: 510.50, volatility: 0.008, drift: 0.0002 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf', basePrice: 438.20, volatility: 0.012, drift: 0.0003 },

  // Indices
  { symbol: '^SPX', name: 'S&P 500 Index', type: 'index', basePrice: 5130.00, volatility: 0.008, drift: 0.0002 },
  { symbol: '^IXIC', name: 'NASDAQ Composite', type: 'index', basePrice: 16100.00, volatility: 0.012, drift: 0.0003 },

  // Cryptocurrencies
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', basePrice: 64200.00, volatility: 0.045, drift: 0.0008 },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', basePrice: 3450.00, volatility: 0.050, drift: 0.0006 },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', basePrice: 142.50, volatility: 0.075, drift: 0.0015 },

  // Commodities
  { symbol: 'GOLD', name: 'Gold Spot', type: 'commodity', basePrice: 2175.80, volatility: 0.009, drift: 0.0001 },
  { symbol: 'SILVER', name: 'Silver Spot', type: 'commodity', basePrice: 24.30, volatility: 0.016, drift: 0.0001 },
  { symbol: 'OIL', name: 'Crude Oil WTI', type: 'commodity', basePrice: 78.50, volatility: 0.022, drift: -0.0001 },

  // Forex
  { symbol: 'EURUSD', name: 'EUR / USD', type: 'forex', basePrice: 1.0850, volatility: 0.004, drift: -0.00005 },
  { symbol: 'USDJPY', name: 'USD / JPY', type: 'forex', basePrice: 151.20, volatility: 0.005, drift: 0.0001 },
  { symbol: 'GBPUSD', name: 'GBP / USD', type: 'forex', basePrice: 1.2630, volatility: 0.004, drift: -0.00003 },
];

// Generate deterministic-looking pseudo-random price walk
export function generateHistoricalData(symbol: string, daysCount: number = 365): PricePoint[] {
  const asset = SUPPORTED_ASSETS.find(a => a.symbol === symbol) || SUPPORTED_ASSETS[0];
  const points: PricePoint[] = [];
  
  // Use a hash of the symbol as a random seed multiplier
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) {
    seed += symbol.charCodeAt(i) * (i + 1);
  }
  
  const rand = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  let currentPrice = asset.basePrice;
  const now = new Date();
  
  // Create raw price walk starting from the past
  for (let i = daysCount; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    
    // Brownian motion: daily change is a normal-like distribution
    const changePercent = asset.volatility * (rand() + rand() - 1) + asset.drift;
    const prevPrice = currentPrice;
    currentPrice = Math.max(0.0001, currentPrice * (1 + changePercent));
    
    const intradayVolatility = asset.volatility * 1.5;
    const openOffset = (rand() - 0.5) * prevPrice * intradayVolatility;
    const open = prevPrice + openOffset;
    
    const close = currentPrice;
    const high = Math.max(open, close) + rand() * currentPrice * intradayVolatility * 0.7;
    const low = Math.min(open, close) - rand() * currentPrice * intradayVolatility * 0.7;
    
    // Highly realistic volumes
    let volume = Math.floor((100000 + rand() * 900000) * (500 / currentPrice));
    if (asset.type === 'crypto') volume *= 10;
    if (asset.type === 'forex') volume = 0; // Forex volume is decentralized

    points.push({
      date: d.toISOString().split('T')[0],
      open: Number(open.toFixed(asset.type === 'forex' ? 4 : 2)),
      high: Number(high.toFixed(asset.type === 'forex' ? 4 : 2)),
      low: Number(low.toFixed(asset.type === 'forex' ? 4 : 2)),
      close: Number(close.toFixed(asset.type === 'forex' ? 4 : 2)),
      volume,
    });
  }

  // Calculate Technical Indicators
  calculateIndicators(points);

  return points;
}

function calculateIndicators(points: PricePoint[]): void {
  const len = points.length;
  if (len === 0) return;

  const closes = points.map(p => p.close);

  // 1. SMA (20)
  for (let i = 0; i < len; i++) {
    if (i >= 19) {
      const sum = closes.slice(i - 19, i + 1).reduce((a, b) => a + b, 0);
      points[i].sma20 = Number((sum / 20).toFixed(4));
    }
  }

  // 2. EMA (50)
  let prevEma50 = closes[0];
  points[0].ema50 = prevEma50;
  const k = 2 / (50 + 1);
  for (let i = 1; i < len; i++) {
    const ema = closes[i] * k + prevEma50 * (1 - k);
    points[i].ema50 = Number(ema.toFixed(4));
    prevEma50 = ema;
  }

  // 3. RSI (14)
  const rsiPeriod = 14;
  let avgGain = 0;
  let avgLoss = 0;

  // Initial gains/losses
  for (let i = 1; i <= rsiPeriod && i < len; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }
  avgGain /= rsiPeriod;
  avgLoss /= rsiPeriod;

  if (rsiPeriod < len) {
    points[rsiPeriod].rsi = avgLoss === 0 ? 100 : Number((100 - 100 / (1 + avgGain / avgLoss)).toFixed(2));
  }

  for (let i = rsiPeriod + 1; i < len; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (rsiPeriod - 1) + gain) / rsiPeriod;
    avgLoss = (avgLoss * (rsiPeriod - 1) + loss) / rsiPeriod;

    points[i].rsi = avgLoss === 0 ? 100 : Number((100 - 100 / (1 + avgGain / avgLoss)).toFixed(2));
  }

  // 4. MACD (12, 26, 9)
  const ema12K = 2 / (12 + 1);
  const ema26K = 2 / (26 + 1);
  let ema12 = closes[0];
  let ema26 = closes[0];
  const macdLine: number[] = [];

  for (let i = 0; i < len; i++) {
    ema12 = closes[i] * ema12K + ema12 * (1 - ema12K);
    ema26 = closes[i] * ema26K + ema26 * (1 - ema26K);
    const macdVal = ema12 - ema26;
    macdLine.push(macdVal);
    points[i].macd = Number(macdVal.toFixed(4));
  }

  const signalK = 2 / (9 + 1);
  let signal = macdLine[0];
  points[0].macdSignal = Number(signal.toFixed(4));
  points[0].macdHist = 0;

  for (let i = 1; i < len; i++) {
    signal = macdLine[i] * signalK + signal * (1 - signalK);
    points[i].macdSignal = Number(signal.toFixed(4));
    points[i].macdHist = Number((macdLine[i] - signal).toFixed(4));
  }

  // 5. Bollinger Bands (20, 2)
  for (let i = 0; i < len; i++) {
    if (i >= 19) {
      const slice = closes.slice(i - 19, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / 20;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 20;
      const stdDev = Math.sqrt(variance);

      points[i].bbMiddle = Number(mean.toFixed(4));
      points[i].bbUpper = Number((mean + 2 * stdDev).toFixed(4));
      points[i].bbLower = Number((mean - 2 * stdDev).toFixed(4));
    }
  }

  // 6. VWAP
  let cumPV = 0;
  let cumV = 0;
  for (let i = 0; i < len; i++) {
    const tp = (points[i].high + points[i].low + points[i].close) / 3;
    cumPV += tp * points[i].volume;
    cumV += points[i].volume;
    points[i].vwap = cumV === 0 ? points[i].close : Number((cumPV / cumV).toFixed(4));
  }

  // 7. ATR (14)
  const trueRanges: number[] = [points[0].high - points[0].low];
  for (let i = 1; i < len; i++) {
    const tr = Math.max(
      points[i].high - points[i].low,
      Math.abs(points[i].high - points[i - 1].close),
      Math.abs(points[i].low - points[i - 1].close)
    );
    trueRanges.push(tr);
  }

  let atrSum = trueRanges.slice(0, 14).reduce((a, b) => a + b, 0);
  points[13] = { ...points[13], atr: Number((atrSum / 14).toFixed(4)) };
  for (let i = 14; i < len; i++) {
    const atr = (points[i - 1].atr! * 13 + trueRanges[i]) / 14;
    points[i].atr = Number(atr.toFixed(4));
  }

  // 8. Fibonacci Retracement (computed over whole series range for simplicity/overlay)
  const minPrice = Math.min(...closes);
  const maxPrice = Math.max(...closes);
  const diff = maxPrice - minPrice;

  for (let i = 0; i < len; i++) {
    points[i].fib236 = Number((maxPrice - 0.236 * diff).toFixed(4));
    points[i].fib382 = Number((maxPrice - 0.382 * diff).toFixed(4));
    points[i].fib500 = Number((maxPrice - 0.500 * diff).toFixed(4));
    points[i].fib618 = Number((maxPrice - 0.618 * diff).toFixed(4));
  }
}

// Generate company profiles and financials
export function generateCompanyProfile(symbol: string): CompanyProfile {
  const asset = SUPPORTED_ASSETS.find(a => a.symbol === symbol) || SUPPORTED_ASSETS[0];

  // Deterministic seed
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i) * (i + 1);
  const rand = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const years = ['2023', '2024', '2025', '2026'];
  const multiplier = asset.basePrice * (1 + rand() * 5);
  
  // Mock Revenues (thousands)
  const baseRevenue = Math.floor(15000000 + rand() * 50000000);
  const revenue = years.map((_, idx) => Math.floor(baseRevenue * Math.pow(1.05 + rand() * 0.15, idx)));
  
  // Mock Profit (net income)
  const profitMargin = 0.08 + rand() * 0.20;
  const netIncome = revenue.map(rev => Math.floor(rev * profitMargin * (0.9 + rand() * 0.2)));

  // Balance sheet
  const baseAssets = Math.floor(baseRevenue * 1.5);
  const bsAssets = years.map((_, idx) => Math.floor(baseAssets * Math.pow(1.08 + rand() * 0.1, idx)));
  const liabilities = bsAssets.map(ast => Math.floor(ast * (0.35 + rand() * 0.3)));
  const equity = bsAssets.map((ast, idx) => ast - liabilities[idx]);

  // Cash Flow
  const operating = netIncome.map(ni => Math.floor(ni * (1.1 + rand() * 0.3)));
  const investing = operating.map(op => Math.floor(-op * (0.4 + rand() * 0.3)));
  const financing = operating.map(op => Math.floor(op * (rand() - 0.6) * 0.5));

  // Profile details based on category
  let sector = 'Technology';
  let industry = 'Consumer Electronics';
  let ceo = 'Tim Cook';
  let founders = ['Steve Jobs', 'Steve Wozniak', 'Ronald Wayne'];
  let headquarters = 'Cupertino, California, USA';
  let employees = 164000;

  if (symbol === 'MSFT') {
    sector = 'Technology';
    industry = 'Software - Infrastructure';
    ceo = 'Satya Nadella';
    founders = ['Bill Gates', 'Paul Allen'];
    headquarters = 'Redmond, Washington, USA';
    employees = 221000;
  } else if (symbol === 'TSLA') {
    sector = 'Consumer Cyclical';
    industry = 'Auto Manufacturers';
    ceo = 'Elon Musk';
    founders = ['Martin Eberhard', 'Marc Tarpenning', 'Elon Musk', 'JB Straubel', 'Ian Wright'];
    headquarters = 'Austin, Texas, USA';
    employees = 140000;
  } else if (symbol === 'AMZN') {
    sector = 'Consumer Cyclical';
    industry = 'Internet Retail';
    ceo = 'Andy Jassy';
    founders = ['Jeff Bezos'];
    headquarters = 'Seattle, Washington, USA';
    employees = 1541000;
  } else if (symbol === 'GOOGL') {
    sector = 'Communication Services';
    industry = 'Internet Content & Information';
    ceo = 'Sundar Pichai';
    founders = ['Larry Page', 'Sergey Brin'];
    headquarters = 'Mountain View, California, USA';
    employees = 182000;
  } else if (symbol === 'NVDA') {
    sector = 'Technology';
    industry = 'Semiconductors';
    ceo = 'Jensen Huang';
    founders = ['Jensen Huang', 'Chris Malachowsky', 'Curtis Priem'];
    headquarters = 'Santa Clara, California, USA';
    employees = 296000;
  } else if (asset.type === 'crypto') {
    sector = 'Financial Technology';
    industry = 'Decentralized Network';
    ceo = 'Decentralized Governance';
    founders = symbol === 'BTC' ? ['Satoshi Nakamoto'] : symbol === 'ETH' ? ['Vitalik Buterin'] : ['Anatoly Yakovenko'];
    headquarters = 'Global / Distributed';
    employees = 0;
  } else if (asset.type === 'commodity' || asset.type === 'forex' || asset.type === 'etf' || asset.type === 'index') {
    sector = 'Global Finance';
    industry = 'Financial Asset';
    ceo = 'N/A';
    founders = ['N/A'];
    headquarters = 'Global Market';
    employees = 0;
  }

  const pe = 12 + rand() * 45;
  const currentRatio = 1.1 + rand() * 2.5;

  return {
    name: asset.name,
    symbol,
    type: asset.type,
    industry,
    sector,
    ceo,
    founders,
    headquarters,
    employees,
    revenue: revenue[revenue.length - 1] / 1000, // TTM in Millions
    profit: netIncome[netIncome.length - 1] / 1000,   // TTM in Millions
    marketCap: Math.floor(asset.basePrice * (symbol === 'BTC' ? 19600000 : symbol === 'ETH' ? 120000000 : 5000000) / 1000), // Mcap in Millions
    dividendYield: asset.type === 'stock' ? Number((rand() * 0.03).toFixed(4)) : 0,
    splitsHistory: asset.type === 'stock' ? (rand() > 0.5 ? '10-for-1 split in 2024' : 'None') : 'N/A',
    financials: {
      incomeStatement: {
        revenue,
        netIncome,
        years,
      },
      balanceSheet: {
        assets: bsAssets,
        liabilities,
        equity,
        years,
      },
      cashFlow: {
        operating,
        investing,
        financing,
        years,
      },
    },
    ratios: {
      pe: pe,
      peg: pe / (5 + rand() * 25),
      roe: 0.10 + rand() * 0.35,
      roa: 0.05 + rand() * 0.20,
      debtEquity: 0.2 + rand() * 1.5,
      currentRatio,
      grossMargin: 0.25 + rand() * 0.55,
      operatingMargin: 0.10 + rand() * 0.35,
    },
  };
}

// Generate Global Macroeconomics
export function generateMacroeconomics(): MacroIndicator[] {
  return [
    {
      name: 'Federal Funds Rate',
      value: 5.25,
      change: -0.25,
      unit: '%',
      status: 'Bullish',
      description: 'The US central bank interest rate. Recent cuts signal monetary easing, typically bullish for equities and cryptos.',
    },
    {
      name: 'US Inflation (CPI)',
      value: 2.8,
      change: -0.1,
      unit: '%',
      status: 'Bullish',
      description: 'Consumer Price Index change year-over-year. Cool-down towards the 2% target drives hopes of lower bond yields.',
    },
    {
      name: 'GDP Growth Rate (QoQ)',
      value: 2.4,
      change: 0.2,
      unit: '%',
      status: 'Bullish',
      description: 'US Gross Domestic Product growth annualized. Stronger growth shows robust consumer demand, averting hard recession fears.',
    },
    {
      name: 'Unemployment Rate',
      value: 4.1,
      change: 0.1,
      unit: '%',
      status: 'Neutral',
      description: 'Labor market tightness indicator. Slightly loosening labor conditions relieves inflation pressures, allowing Fed flexibility.',
    },
    {
      name: '10-Year Treasury Yield',
      value: 4.12,
      change: 0.05,
      unit: '%',
      status: 'Bearish',
      description: 'Yield on 10-Year US government bonds. Rising yields increase the discount rate for equity valuation models, presenting a headwind.',
    },
    {
      name: 'Gold Price Spot',
      value: '$2,175.80',
      change: '+1.2%',
      unit: 'USD/oz',
      status: 'Bullish',
      description: 'Global gold prices. Safe-haven buying signals underlying macro caution and currency hedge demand.',
    },
    {
      name: 'Crude Oil (WTI)',
      value: '$78.50',
      change: '-0.8%',
      unit: 'USD/bbl',
      status: 'Neutral',
      description: 'West Texas Intermediate crude oil. Lower fuel prices cool supply-side inflation, but trigger slowing global industrial demand worries.',
    },
    {
      name: 'DXY Dollar Index',
      value: 103.45,
      change: -0.32,
      unit: 'Points',
      status: 'Bullish',
      description: 'US Dollar strength relative to a basket of currencies. A weaker dollar enhances international earnings value for multinational stocks.',
    }
  ];
}

// Generate Global News Sentiment
export function generateNewsArticles(symbol: string): NewsArticle[] {
  const assetName = SUPPORTED_ASSETS.find(a => a.symbol === symbol)?.name || symbol;
  
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i);
  const rand = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const sources = ['Bloomberg', 'Reuters', 'Financial Times', 'CNBC', 'Wall Street Journal', 'MarketWatch'];
  
  const templateNews = [
    {
      headline: `${symbol} Exceeds Analysts Q1 Estimates, Revenue Up 14%`,
      summary: `${assetName} announced its financial results today, reporting revenues that surpassed top Wall Street expectations. Strong operations, high margins, and solid balance sheets drove investor excitement.`,
      sentiment: 'Bullish' as const,
      impactScore: 88,
      shortTerm: 'Highly positive momentum as funds adjust target valuations upwards.',
      longTerm: 'Solidifies industry leadership and enables continuous share buybacks.',
    },
    {
      headline: `Regulatory Headwinds Emerge for ${symbol} Sector Globally`,
      summary: `In a surprise announcement, state regulatory authorities proposed tighter oversight and compliance mandates across the industry. This could trigger elevated legal costs and slower expansion plans.`,
      sentiment: 'Bearish' as const,
      impactScore: 65,
      shortTerm: 'Panic-selling and high short-interest accumulation.',
      longTerm: 'Structural margin pressure and reduced pace of innovative products launch.',
    },
    {
      headline: `Institutional Buying Surges in ${symbol} According to Latest 13F Filings`,
      summary: `Major hedge funds and pension boards added significantly to their positions in ${symbol} during the last quarter. This capital inflow signals deep value commitment from institutional players.`,
      sentiment: 'Bullish' as const,
      impactScore: 78,
      shortTerm: 'Stabilizes price ranges during broad market pullbacks.',
      longTerm: 'Enhanced liquidity and lower extreme downward volatility.',
    },
    {
      headline: `Macro Inflation Data Triggers Uncertainty for ${symbol} Valuation`,
      summary: `As inflation indexes hover slightly above comfort zones, market strategists debate whether long-duration growth assets like ${symbol} will face near-term multiples compression under elevated discount rates.`,
      sentiment: 'Neutral' as const,
      impactScore: 35,
      shortTerm: 'Sideways consolidation and tight trading ranges.',
      longTerm: 'Uncertainty slows long-term capital expenditure commitments.',
    },
    {
      headline: `${symbol} Unveils Next-Gen AI Integration Strategy to High Acclaim`,
      summary: `At its developer summit, ${symbol} showcased its deep integration with state-of-the-art transformer architectures. The move aims to automate key operations and introduce high-margin software capabilities.`,
      sentiment: 'Bullish' as const,
      impactScore: 92,
      shortTerm: 'Immediate retail hype, short squeeze triggers, and heavy options flow.',
      longTerm: 'Exponential margin expansion and creation of sticky enterprise subscription channels.',
    },
    {
      headline: `Supply Chain Bottlenecks Pose Risk to ${symbol} Shipping Schedules`,
      summary: `A logistics bottleneck at major cargo shipping ports is slowing transit times for hardware components. Analysts warn this could trigger deferred revenue and temporary product shortages.`,
      sentiment: 'Bearish' as const,
      impactScore: 48,
      shortTerm: 'Marginal pullbacks and options hedging.',
      longTerm: 'Slight delay in annual profit delivery, but core demand remains unaffected.',
    }
  ];

  return templateNews.map((n, idx) => {
    const d = new Date();
    d.setHours(d.getHours() - idx * 4 - Math.floor(rand() * 3));
    
    return {
      id: `${symbol}-news-${idx}-${Math.floor(rand() * 10000)}`,
      headline: n.headline,
      source: sources[Math.floor(rand() * sources.length)],
      summary: n.summary,
      sentiment: n.sentiment,
      impactScore: Math.floor(n.impactScore - 5 + rand() * 10),
      confidenceScore: Math.floor(75 + rand() * 20),
      shortTermEffect: n.shortTerm,
      longTermEffect: n.longTerm,
      timestamp: d.toISOString(),
    };
  });
}

// Generate Social Sentiment
export function generateSocialSentiment(symbol: string): SentimentData {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i) * 2;
  const rand = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const fgIndex = Math.floor(35 + rand() * 50);
  const history: { date: string; sentimentScore: number }[] = [];
  const now = new Date();

  let score = fgIndex;
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    score = Math.max(-100, Math.min(100, score + (rand() - 0.5) * 15));
    history.push({
      date: d.toISOString().split('T')[0],
      sentimentScore: Math.floor(score),
    });
  }

  return {
    fearGreedIndex: fgIndex,
    panicLevel: Math.floor(rand() * 40),
    optimismLevel: Math.floor(20 + rand() * 60),
    hypeLevel: Math.floor(rand() * 95),
    redditScore: Math.floor(-50 + rand() * 110),
    xScore: Math.floor(-30 + rand() * 90),
    history,
  };
}
