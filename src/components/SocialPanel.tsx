import React from 'react';
import { SentimentData } from '../types';
import { Users, Smile, Frown, TrendingUp, AlertTriangle, BarChart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SocialPanelProps {
  social: SentimentData | null;
  symbol: string;
}

export default function SocialPanel({ social, symbol }: SocialPanelProps) {
  if (!social) return null;

  // Determine Fear / Greed status text and color
  const fg = social.fearGreedIndex;
  let statusText = 'Neutral';
  let statusColor = 'text-gray-400';
  let statusBg = 'bg-gray-800/50';
  let icon = <Smile className="w-5 h-5 text-gray-400" />;

  if (fg >= 75) {
    statusText = 'Extreme Greed';
    statusColor = 'text-red-500';
    statusBg = 'bg-red-950/20';
    icon = <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
  } else if (fg >= 55) {
    statusText = 'Greed';
    statusColor = 'text-green-400';
    statusBg = 'bg-green-950/20';
    icon = <Smile className="w-5 h-5 text-green-400" />;
  } else if (fg <= 25) {
    statusText = 'Extreme Fear';
    statusColor = 'text-orange-500';
    statusBg = 'bg-orange-950/20';
    icon = <Frown className="w-5 h-5 text-orange-500 animate-pulse" />;
  } else if (fg <= 45) {
    statusText = 'Fear';
    statusColor = 'text-yellow-400';
    statusBg = 'bg-yellow-950/20';
    icon = <Frown className="w-5 h-5 text-yellow-400" />;
  }

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full" id="social-sentiment-panel">
      <div className="flex items-center space-x-2 border-b border-[#1f2937] pb-3 mb-4">
        <Users className="text-[#3b82f6] w-5 h-5" />
        <span className="text-sm font-semibold tracking-wide text-gray-200">
          {symbol} SOCIAL SENTIMENT & DISCUSSIONS ENGINE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sentiment Index Dashboard */}
        <div className="bg-[#182235] rounded-lg p-4 border border-[#1f2937] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block mb-3 uppercase tracking-wider">
              FEAR & GREED INDEX
            </span>

            <div className={`p-4 rounded-lg border border-[#1f2937] ${statusBg} flex items-center space-x-4 mb-4`}>
              <div className="bg-[#111827] p-2.5 rounded-full border border-[#1f2937]">
                {icon}
              </div>
              <div>
                <span className={`text-sm font-black uppercase ${statusColor}`}>{statusText}</span>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="text-2xl font-black text-gray-100">{fg}</span>
                  <span className="text-xs text-gray-500">/ 100</span>
                </div>
              </div>
            </div>

            {/* Linear scale visualization */}
            <div className="w-full bg-[#111827] h-2.5 rounded-full relative overflow-hidden mb-5">
              <div 
                className="bg-gradient-to-r from-orange-500 via-yellow-400 via-green-400 to-red-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${fg}%` }}
              />
              <div 
                className="absolute top-0 bottom-0 bg-white w-1 shadow-md border-l border-r border-gray-400"
                style={{ left: `${fg}%` }}
              />
            </div>

            {/* Forums scores */}
            <div className="space-y-3 text-xs border-t border-[#1f2937]/50 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Reddit Sentiment Score</span>
                <span className={`font-bold ${social.redditScore >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {social.redditScore >= 0 ? `+${social.redditScore}` : social.redditScore} / 100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">X (Twitter) Buzz Indicator</span>
                <span className={`font-bold ${social.xScore >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {social.xScore >= 0 ? `+${social.xScore}` : social.xScore} / 100
                </span>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-gray-500 pt-3 border-t border-[#1f2937]/20 flex justify-between mt-4">
            <span>Reddit, X, and StockTwits logs</span>
            <span>Refreshes hourly</span>
          </div>
        </div>

        {/* Hype, Optimism & Panic meters */}
        <div className="bg-[#182235] rounded-lg p-4 border border-[#1f2937] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block mb-3.5 uppercase tracking-wider">
              CROWD EMOTIONAL COEFFICIENTS
            </span>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Retail Optimism Level</span>
                  <span className="text-green-400 font-bold">{social.optimismLevel}%</span>
                </div>
                <div className="w-full bg-[#111827] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-400 h-full" style={{ width: `${social.optimismLevel}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Panic Liquidation Index</span>
                  <span className="text-orange-400 font-bold">{social.panicLevel}%</span>
                </div>
                <div className="w-full bg-[#111827] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full" style={{ width: `${social.panicLevel}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Speculative Hype Volume</span>
                  <span className="text-pink-400 font-bold">{social.hypeLevel}%</span>
                </div>
                <div className="w-full bg-[#111827] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-pink-400 h-full" style={{ width: `${social.hypeLevel}%` }} />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed mt-4 bg-[#111827] p-2.5 rounded border border-[#1f2937]">
              <span className="text-amber-400 font-bold uppercase mr-1">Alert:</span> 
              {social.hypeLevel > 70 
                ? 'High speculative hype active. Orderbooks are highly vulnerable to momentum reversal contractions.' 
                : 'Sentiment indices are within stable ranges. Low risk of systemic retail cascading sell-offs.'
              }
            </p>
          </div>

          <div className="text-[9px] text-gray-500 pt-3 border-t border-[#1f2937]/20 flex justify-between mt-3">
            <span>Natural Language Processing (NLP)</span>
            <span>Token-based</span>
          </div>
        </div>

        {/* Historical Sentiment Chart */}
        <div className="bg-[#182235] rounded-lg p-4 border border-[#1f2937] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block mb-3 uppercase tracking-wider flex items-center">
              <BarChart className="w-4 h-4 text-[#3b82f6] mr-1.5" />
              SOCIAL SENTIMENT TREND (30-DAY)
            </span>

            <div className="h-[150px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={social.history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSocial" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 8 }} />
                  <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 8 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f3f4f6', fontSize: 10 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sentimentScore" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSocial)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[9px] text-gray-500 pt-3 border-t border-[#1f2937]/20 flex justify-between mt-3">
            <span>Crowd Sentiment History</span>
            <span>Real-time Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
