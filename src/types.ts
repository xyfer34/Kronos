export type AssetType = 'stock' | 'etf' | 'index' | 'crypto' | 'commodity' | 'forex';

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Technical indicators
  sma20?: number;
  ema50?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  bbUpper?: number;
  bbLower?: number;
  bbMiddle?: number;
  vwap?: number;
  atr?: number;
  fib236?: number;
  fib382?: number;
  fib500?: number;
  fib618?: number;
  // Prediction overlay (optional)
  predictedClose?: number;
  predictedLower?: number;
  predictedUpper?: number;
}

export interface FinancialStatement {
  revenue: number[];
  netIncome: number[];
  years: string[];
}

export interface FinancialRatios {
  pe: number;
  peg: number;
  roe: number;
  roa: number;
  debtEquity: number;
  currentRatio: number;
  grossMargin: number;
  operatingMargin: number;
}

export interface CompanyProfile {
  name: string;
  symbol: string;
  type: AssetType;
  industry: string;
  sector: string;
  ceo: string;
  founders: string[];
  headquarters: string;
  employees: number;
  revenue: number; // TTM
  profit: number;  // TTM
  marketCap: number;
  dividendYield: number;
  splitsHistory: string;
  financials: {
    incomeStatement: FinancialStatement;
    balanceSheet: {
      assets: number[];
      liabilities: number[];
      equity: number[];
      years: string[];
    };
    cashFlow: {
      operating: number[];
      investing: number[];
      financing: number[];
      years: string[];
    };
  };
  ratios: FinancialRatios;
}

export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  summary: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  impactScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  shortTermEffect: string;
  longTermEffect: string;
  timestamp: string;
}

export interface MacroIndicator {
  name: string;
  value: string | number;
  change: string | number;
  unit: string;
  status: 'Bullish' | 'Neutral' | 'Bearish';
  description: string;
}

export interface SentimentData {
  fearGreedIndex: number; // 0-100
  panicLevel: number; // 0-100
  optimismLevel: number; // 0-100
  hypeLevel: number; // 0-100
  redditScore: number; // -100 to 100
  xScore: number; // -100 to 100
  history: {
    date: string;
    sentimentScore: number; // -100 to 100
  }[];
}

export interface ProbabilityRange {
  increase: number; // e.g. 72
  sideways: number; // e.g. 18
  decline: number; // e.g. 10
}

export interface PredictionTarget {
  timeframe: string; // "1 Day" | "1 Week" | "1 Month" | "3 Months" | "6 Months"
  probabilityRange: ProbabilityRange;
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
}

export interface PredictionEngineOutput {
  symbol: string;
  confidenceScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  rating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  targets: PredictionTarget[];
  explanation: {
    technicals: string[];
    fundamentals: string[];
    newsSentiment: string[];
    macroeconomics: string[];
    socialSentiment: string[];
    institutionalActivity: string[];
  };
  summaryText: string;
}

export interface PortfolioItem {
  symbol: string;
  shares: number;
  avgPurchasePrice: number;
  currentPrice: number;
}

export interface Portfolio {
  id: string;
  name: string;
  cash: number;
  items: PortfolioItem[];
  riskTolerance: 'Low' | 'Medium' | 'High';
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  parts: { text: string }[];
}
