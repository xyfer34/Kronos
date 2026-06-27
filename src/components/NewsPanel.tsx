import React from 'react';
import { NewsArticle } from '../types';
import { Newspaper, Brain, ArrowUpRight, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

interface NewsPanelProps {
  news: NewsArticle[];
  symbol: string;
}

export default function NewsPanel({ news, symbol }: NewsPanelProps) {
  if (!news || news.length === 0) return null;

  // Synthesize key insights (mimicking the AI synthesis summarizing hundreds of articles)
  const synthesis = React.useMemo(() => {
    const bullishCount = news.filter(n => n.sentiment === 'Bullish').length;
    const bearishCount = news.filter(n => n.sentiment === 'Bearish').length;
    
    let tone = 'neutral with equal bullish and bearish forces';
    let summaryBullets = [
      `Earnings growth and operational expansions are serving as primary liquidity support lines.`,
      `Elevated regulatory hurdles globally present ongoing structural cost bottlenecks.`,
      `Options positioning indicates major volume supports are firming up around lower Fibonacci zones.`
    ];

    if (bullishCount > bearishCount + 1) {
      tone = 'decisively bullish, powered by strong corporate earnings and massive AI/technological integrations';
      summaryBullets = [
        `Strong Q1 revenue beating top Wall Street estimates signals structural business acceleration.`,
        `Unveiling of state-of-the-art AI strategies has generated massive retail options momentum and long-term fund commitments.`,
        `Institutional 13F filings display accelerated accumulation of positions, establishing deep valuation floors on pullbacks.`
      ];
    } else if (bearishCount > bullishCount) {
      tone = 'bearish to consolidating, driven by logistics bottlenecks and elevated discount rates';
      summaryBullets = [
        `Tighter regulatory compliance mandates could compress future operating margins by 1.5 - 2%.`,
        `Supply chain bottlenecks at cargo hubs are delaying parts delivery, potentially deferring short-term product revenues.`,
        `Macro bond yield rises are triggering minor valuation multiple contractions for high-duration growth segments.`
      ];
    }

    return { tone, summaryBullets };
  }, [news]);

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full" id="news-intelligence-container">
      <div className="flex items-center space-x-2 border-b border-[#1f2937] pb-3 mb-4">
        <Newspaper className="text-[#3b82f6] w-5 h-5" />
        <span className="text-sm font-semibold tracking-wide text-gray-200">
          {symbol} NEWS SENTIMENT & AI SUMMARY BULLETIN
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* AI Synthesis Column */}
        <div className="lg:col-span-1 bg-[#1c1917]/40 border border-[#44403c]/40 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase mb-3 tracking-wider">
              <Brain className="w-4 h-4 text-amber-500" />
              <span>AI NEWS SYNTHESIS</span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              We analyzed all current articles from trusted sources. The aggregate sentiment for <span className="text-amber-400 font-bold">{symbol}</span> is currently <span className="text-gray-100 font-semibold">{synthesis.tone}</span>.
            </p>

            <div className="space-y-3">
              {synthesis.summaryBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start space-x-2.5">
                  <div className="bg-amber-500/15 text-amber-400 font-bold rounded-full w-5 h-5 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="text-xs text-gray-400 leading-relaxed">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#44403c]/30 text-[10px] text-gray-500 flex items-center justify-between">
            <span className="flex items-center"><Sparkles className="w-3 h-3 text-amber-500 mr-1" /> Multi-Source Synthesis Engine</span>
            <span>Real-time Active</span>
          </div>
        </div>

        {/* News Feed List Column */}
        <div className="lg:col-span-2 space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
          {news.map((item) => {
            const isBullish = item.sentiment === 'Bullish';
            const isBearish = item.sentiment === 'Bearish';
            
            return (
              <div 
                key={item.id} 
                className="bg-[#182235] hover:bg-[#1e2c44] border border-[#1f2937] p-4 rounded-lg transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wide bg-[#1e293b] px-2 py-0.5 rounded-full">
                      {item.source}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-gray-200 hover:text-white leading-snug cursor-pointer">
                    {item.headline}
                  </h5>

                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] border-t border-[#1f2937]/50">
                    <div>
                      <span className="text-gray-500 uppercase block font-semibold mb-0.5">Short-Term Effect</span>
                      <span className="text-gray-300 leading-relaxed">{item.shortTermEffect}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase block font-semibold mb-0.5">Long-Term Effect</span>
                      <span className="text-gray-300 leading-relaxed">{item.longTermEffect}</span>
                    </div>
                  </div>
                </div>

                {/* Sentiment Badge Column */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 border-[#1f2937]/50 pt-2 sm:pt-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Sentiment:</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      isBullish 
                        ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20' 
                        : isBearish 
                          ? 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/20' 
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-right sm:mt-2 w-full sm:w-auto">
                    <div className="flex justify-between sm:justify-end items-center text-[10px] gap-2">
                      <span className="text-gray-500 uppercase font-semibold">Impact:</span>
                      <span className="text-amber-400 font-bold">{item.impactScore}%</span>
                    </div>
                    <div className="flex justify-between sm:justify-end items-center text-[10px] gap-2">
                      <span className="text-gray-500 uppercase font-semibold">Confidence:</span>
                      <span className="text-gray-300 font-medium">{item.confidenceScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
