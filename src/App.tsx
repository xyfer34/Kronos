import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SUPPORTED_ASSETS, 
  generateHistoricalData, 
  generateCompanyProfile, 
  generateNewsArticles, 
  generateSocialSentiment, 
  generateMacroeconomics,
  AssetInfo
} from './mockData';
import { 
  PricePoint, 
  CompanyProfile, 
  NewsArticle, 
  MacroIndicator, 
  SentimentData, 
  PredictionEngineOutput, 
  Portfolio, 
  Timeframe
} from './types';

// Import modular panels
import PredictiveChart from './components/PredictiveChart';
import CompanyProfileView from './components/CompanyProfileView';
import NewsPanel from './components/NewsPanel';
import MacroPanel from './components/MacroPanel';
import SocialPanel from './components/SocialPanel';
import PredictionEngineView from './components/PredictionEngineView';
import AdvisorChat from './components/AdvisorChat';
import PortfolioPanel from './components/PortfolioPanel';
import WatchlistPanel from './components/WatchlistPanel';

import { 
  TrendingUp, 
  Briefcase, 
  Star, 
  MessageSquare, 
  Search, 
  Sparkles, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Bell
} from 'lucide-react';

type TabType = 'terminal' | 'portfolio' | 'watchlist' | 'chat';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('terminal');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1Y');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Loaded Market Data state
  const [marketData, setMarketData] = useState<{
    asset: AssetInfo;
    history: PricePoint[];
    profile: CompanyProfile;
    news: NewsArticle[];
    social: SentimentData;
    macro: MacroIndicator[];
  } | null>(null);

  // Prediction engine forecast state
  const [forecast, setForecast] = useState<PredictionEngineOutput | null>(null);
  const [loadingMarket, setLoadingMarket] = useState<boolean>(true);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User Watchlist State (with localStorage backup)
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('ai_forecaster_watchlist');
    return saved ? JSON.parse(saved) : ['AAPL', 'MSFT', 'BTC', 'GOLD'];
  });

  // User Portfolio State (with localStorage backup)
  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    const saved = localStorage.getItem('ai_forecaster_portfolio');
    return saved ? JSON.parse(saved) : {
      id: 'default-portfolio',
      name: 'Simulated Asset Portfolio',
      cash: 100000, // 100K Starting Cash
      items: [],
      riskTolerance: 'Medium',
    };
  });

  // Backup watchlists & portfolios on edit
  useEffect(() => {
    localStorage.setItem('ai_forecaster_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('ai_forecaster_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Fetch full active asset market data
  const fetchMarketData = useCallback(async (symbol: string) => {
    setLoadingMarket(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/market-data/${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve terminal market data');
      }
      const data = await response.json();
      setMarketData(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Fatal terminal connection error');
    } finally {
      setLoadingMarket(false);
    }
  }, []);

  // Fetch prediction engine forecast
  const fetchPredictionForecast = useCallback(async (symbol: string) => {
    setLoadingForecast(true);
    try {
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      if (!response.ok) {
        throw new Error('Prediction calculations failed');
      }
      const data = await response.json();
      setForecast(data);
    } catch (err) {
      console.error('Error fetching prediction:', err);
    } finally {
      setLoadingForecast(false);
    }
  }, []);

  // Trigger loading on symbol shift
  useEffect(() => {
    fetchMarketData(selectedSymbol);
    fetchPredictionForecast(selectedSymbol);
  }, [selectedSymbol, fetchMarketData, fetchPredictionForecast]);

  // Handle re-trigger forecasting manually
  const handleRecalcForecast = () => {
    fetchPredictionForecast(selectedSymbol);
  };

  // Slice historical data based on timeframe selection
  const slicedHistory = useMemo(() => {
    if (!marketData || !marketData.history) return [];
    const full = marketData.history;
    const len = full.length;
    
    switch (selectedTimeframe) {
      case '1D': return full.slice(len - 30); // Hourly slice
      case '1W': return full.slice(len - 7);
      case '1M': return full.slice(len - 30);
      case '3M': return full.slice(len - 90);
      case '6M': return full.slice(len - 180);
      case '1Y': return full.slice(len - 365);
      case '5Y': return full.slice(len - Math.min(len, 1000));
      case 'MAX': return full;
      default: return full.slice(len - 365);
    }
  }, [marketData, selectedTimeframe]);

  // Watchlist manipulation
  const handleAddToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  // Portfolio Updates
  const handleUpdatePortfolio = (updatedPortfolio: Portfolio) => {
    setPortfolio(updatedPortfolio);
  };

  // Get active pricing indicators
  const activeQuote = useMemo(() => {
    if (!marketData || !marketData.history || marketData.history.length === 0) {
      return { price: 0, changeVal: 0, changePercent: 0, isPositive: true };
    }
    const history = marketData.history;
    const latest = history[history.length - 1];
    const prev = history[history.length - 2] || latest;
    
    const price = latest.close;
    const changeVal = price - prev.close;
    const changePercent = (changeVal / prev.close) * 100;
    const isPositive = changeVal >= 0;

    return { price, changeVal, changePercent, isPositive };
  }, [marketData]);

  // Filter asset list for search bar
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return SUPPORTED_ASSETS.filter(
      a => a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
           a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="bg-[#09090b] text-slate-200 min-h-screen flex flex-col font-sans antialiased selection:bg-indigo-500/30">
      
      {/* Sleek top Navigation bar (KronosQuant / Sleek Interface style) */}
      <header className="bg-[#0c0c0e] border-b border-white/10 px-6 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Platform Title & Branding */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white font-sans text-sm shadow-[0_0_15px_rgba(79,70,229,0.4)]">ΛI</div>
              <span className="font-semibold tracking-tight text-lg text-white font-sans">
                KRONOS<span className="text-indigo-400">QUANT</span>
              </span>
            </div>
            <span className="hidden md:inline-block bg-indigo-500/10 text-indigo-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest font-mono">
              QUANT TERMINAL v3.5
            </span>
          </div>

          {/* Search bar inside header */}
          <div className="relative w-64">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-md px-3 py-1.5 focus-within:border-indigo-500/50 transition-all">
              <Search className="text-slate-500 w-4 h-4 mr-2" />
              <input
                type="text"
                placeholder="Search ticker (e.g. NVDA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full font-sans"
                id="global-search-input"
              />
            </div>

            {/* Floating search results popover */}
            {filteredAssets.length > 0 && (
              <div className="absolute top-10 left-0 right-0 bg-[#0c0c0e] border border-white/10 rounded-md shadow-2xl z-50 p-1 divide-y divide-white/5 max-h-[220px] overflow-y-auto">
                {filteredAssets.map(asset => (
                  <div
                    key={asset.symbol}
                    onClick={() => {
                      setSelectedSymbol(asset.symbol);
                      setSearchQuery('');
                    }}
                    className="p-2 hover:bg-white/5 rounded cursor-pointer transition-colors flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-indigo-400 font-mono">{asset.symbol}</span>
                      <span className="text-[10px] text-slate-400 block">{asset.name}</span>
                    </div>
                    <span className="text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded uppercase font-semibold font-mono">
                      {asset.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Tab controllers */}
          <nav className="flex space-x-1.5 text-xs bg-white/5 p-1 rounded-md border border-white/10">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3.5 py-1.5 rounded text-xs font-medium cursor-pointer transition-all flex items-center ${
                activeTab === 'terminal' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
              id="tab-btn-terminal"
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3.5 py-1.5 rounded text-xs font-medium cursor-pointer transition-all flex items-center ${
                activeTab === 'portfolio' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
              id="tab-btn-portfolio"
            >
              <Briefcase className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-3.5 py-1.5 rounded text-xs font-medium cursor-pointer transition-all flex items-center ${
                activeTab === 'watchlist' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
              id="tab-btn-watchlist"
            >
              <Star className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Market
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded text-xs font-medium cursor-pointer transition-all flex items-center ${
                activeTab === 'chat' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
              id="tab-btn-chat"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Strategy
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs flex items-center space-x-2">
            <span className="font-bold uppercase">System Error:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Live Active Quote Ticker Bar */}
        {!loadingMarket && marketData && (
          <div className="bg-[#0c0c0e] border border-white/10 rounded-lg p-4 flex flex-wrap justify-between items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" id="terminal-quote-ticker">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Active Asset</span>
                <span className="text-xl font-bold font-mono text-white tracking-tight">{marketData.asset.symbol}</span>
                <span className="text-[10px] text-slate-400 block font-medium font-sans">{marketData.asset.name}</span>
              </div>
              <div className="border-l border-white/10 pl-6">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Last Close</span>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-xl font-bold font-mono tabular-nums ${activeQuote.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${activeQuote.price.toFixed(marketData.asset.type === 'forex' ? 4 : 2)}
                  </span>
                  <span className={`text-xs font-bold font-sans flex items-center ${activeQuote.isPositive ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                    {activeQuote.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                    {activeQuote.isPositive ? '+' : ''}{activeQuote.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Watchlist Bar in quote */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-slate-500 font-bold uppercase mr-2 font-sans tracking-wider">TICKER REELS:</span>
              {SUPPORTED_ASSETS.slice(0, 6).map(asset => {
                const isSelected = asset.symbol === selectedSymbol;
                return (
                  <button
                    key={asset.symbol}
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer border font-mono font-medium ${
                      isSelected 
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.15)]' 
                        : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200'
                    }`}
                  >
                    {asset.symbol}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dashboard Tab Content Switching */}
        
        {/* TAB 1: TERMINAL BOARD */}
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            
            {/* Row 1: Interactive Chart Module */}
            <div className="grid grid-cols-1">
              {loadingMarket ? (
                <div className="bg-[#0c0c0e] border border-white/10 rounded-lg p-12 flex flex-col items-center justify-center min-h-[400px]">
                  <RefreshCw className="animate-spin text-indigo-400 w-8 h-8 mb-4" />
                  <span className="text-sm text-slate-400 font-medium font-sans">Calibrating institutional charting streams...</span>
                </div>
              ) : (
                marketData && (
                  <div className="space-y-3">
                    {/* Timeframe Controller bar */}
                    <div className="flex bg-white/5 p-1 rounded-md border border-white/10 self-start space-x-1 w-fit text-[10px]">
                      {(['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'MAX'] as Timeframe[]).map(tf => (
                        <button
                          key={tf}
                          onClick={() => setSelectedTimeframe(tf)}
                          className={`px-3 py-1.5 rounded cursor-pointer font-bold transition-all ${
                            selectedTimeframe === tf 
                              ? 'bg-indigo-500/20 text-indigo-300 font-medium' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>

                    <PredictiveChart 
                      data={slicedHistory} 
                      predictionTargets={forecast ? forecast.targets : null}
                      selectedTimeframe={selectedTimeframe}
                      symbol={selectedSymbol}
                      assetType={marketData.asset.type}
                    />
                  </div>
                )
              )}
            </div>

            {/* Row 2: Prediction engine and Chat assistant */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <PredictionEngineView 
                  prediction={forecast}
                  loading={loadingForecast}
                  onRefresh={handleRecalcForecast}
                />
              </div>
              <div className="lg:col-span-2">
                <AdvisorChat 
                  symbol={selectedSymbol}
                  assetName={marketData ? marketData.asset.name : selectedSymbol}
                />
              </div>
            </div>

            {/* Row 3: Corporate intelligence, News Bulletin, Macro explanation & Social scores */}
            {!loadingMarket && marketData && (
              <div className="space-y-6">
                <CompanyProfileView 
                  profile={marketData.profile} 
                  assetPrice={activeQuote.price}
                />
                
                <NewsPanel 
                  news={marketData.news}
                  symbol={selectedSymbol}
                />

                <MacroPanel 
                  macro={marketData.macro}
                  symbol={selectedSymbol}
                  assetType={marketData.asset.type}
                />

                <SocialPanel 
                  social={marketData.social}
                  symbol={selectedSymbol}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PORTFOLIO TRADER DESK */}
        {activeTab === 'portfolio' && (
          <PortfolioPanel 
            portfolio={portfolio}
            onUpdatePortfolio={handleUpdatePortfolio}
            activeAssetPrice={activeQuote.price}
            activeAssetSymbol={selectedSymbol}
          />
        )}

        {/* TAB 3: WATCHLISTS & ALERTS */}
        {activeTab === 'watchlist' && (
          <WatchlistPanel 
            watchlist={watchlist}
            supportedAssets={SUPPORTED_ASSETS}
            activeAssetSymbol={selectedSymbol}
            activeAssetPrice={activeQuote.price}
            onSelectSymbol={(sym) => setSelectedSymbol(sym)}
            onAddToWatchlist={handleAddToWatchlist}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
          />
        )}

        {/* TAB 4: ADVISOR CHAT ASSISTANT FULL VIEW */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto">
            <AdvisorChat 
              symbol={selectedSymbol}
              assetName={marketData ? marketData.asset.name : selectedSymbol}
            />
          </div>
        )}

      </main>

      {/* Sleek bottom status ticker */}
      <footer className="h-10 border-t border-white/10 bg-[#0c0c0e] flex items-center px-4 overflow-hidden mt-8 select-none">
        <div className="flex items-center gap-6 whitespace-nowrap animate-marquee">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="text-indigo-400 font-bold italic">TICKER:</span>
            <span>BTCUSD: 68,421.2 <span className="text-emerald-400">+1.2%</span></span>
            <span className="mx-2 text-white/10">|</span>
            <span>SPX: 5,123.4 <span className="text-rose-400">-0.2%</span></span>
            <span className="mx-2 text-white/10">|</span>
            <span>GOLD: 2,154.3 <span className="text-emerald-400">+0.8%</span></span>
            <span className="mx-2 text-white/10">|</span>
            <span>AAPL: 172.5 <span className="text-slate-500">0.0%</span></span>
            <span className="mx-2 text-white/10">|</span>
            <span>TSLA: 164.2 <span className="text-rose-400">-3.4%</span></span>
            <span className="mx-2 text-white/10">|</span>
            <span>NVDA: 875.28 <span className="text-emerald-400">+2.63%</span></span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="text-indigo-400 font-bold italic">TICKER:</span>
            <span>BTCUSD: 68,421.2 <span className="text-emerald-400">+1.2%</span></span>
            <span className="mx-2 text-white/10">|</span>
            <span>SPX: 5,123.4 <span className="text-rose-400">-0.2%</span></span>
            <span className="mx-2 text-white/10">|</span>
            <span>GOLD: 2,154.3 <span className="text-emerald-400">+0.8%</span></span>
            <span className="mx-2 text-white/10">|</span>
            <span>AAPL: 172.5 <span className="text-slate-500">0.0%</span></span>
            <span className="mx-2 text-white/10">|</span>
            <span>TSLA: 164.2 <span className="text-rose-400">-3.4%</span></span>
            <span className="mx-2 text-white/10">|</span>
            <span>NVDA: 875.28 <span className="text-emerald-400">+2.63%</span></span>
          </div>
        </div>
      </footer>

      {/* Disclaimer Section */}
      <footer className="bg-[#09090b] border-t border-white/5 py-6 px-4 text-center text-[10px] text-slate-500">
        <p className="max-w-xl mx-auto leading-relaxed font-sans">
          The ensembled predictive evaluations displayed on this platform are probabilistic forecasts with confidence margin intervals. They represent machine-intelligence calculations and should not be treated as literal financial advice. Past simulated walk history does not guarantee future yield parameters.
        </p>
      </footer>
    </div>
  );
}
