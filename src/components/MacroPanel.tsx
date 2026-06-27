import React, { useState } from 'react';
import { MacroIndicator } from '../types';
import { Landmark, TrendingUp, TrendingDown, HelpCircle, Activity, Globe } from 'lucide-react';

interface MacroPanelProps {
  macro: MacroIndicator[];
  symbol: string;
  assetType: string;
}

export default function MacroPanel({ macro, symbol, assetType }: MacroPanelProps) {
  const [selectedMacro, setSelectedMacro] = useState<string>(macro[0]?.name || '');

  const activeIndicator = macro.find(m => m.name === selectedMacro) || macro[0];

  // Dynamic explainers mapping macroeconomic changes directly to specific asset categories
  const dynamicExplainer = React.useMemo(() => {
    if (!activeIndicator) return '';

    const name = activeIndicator.name;
    const value = activeIndicator.value;

    if (name === 'Federal Funds Rate') {
      if (assetType === 'stock') {
        return `A Fed Rate of ${value} represents a supportive transition toward monetary easing. For Stocks like ${symbol}, lower interest rates directly compress corporate borrowing costs, enhance forward discounted cash flow valuations, and raise profit margins. High P/E growth stocks are typically the largest beneficiaries.`;
      } else if (assetType === 'crypto') {
        return `Cryptocurrencies are highly sensitive to global dollar liquidity. A Fed Rate of ${value} with a downward trajectory boosts liquidity inflows into risk-on assets like ${symbol}, stimulating capital moves away from low-yielding government bonds into speculative digital assets.`;
      } else {
        return `A Fed Funds Rate of ${value} increases the cost of carrying commodity inventories or alters global capital trade channels, indirectly cooling commodity speculation and altering forex carry-trade spreads.`;
      }
    }

    if (name === 'US Inflation (CPI)') {
      if (assetType === 'commodity' && symbol === 'GOLD') {
        return `Inflation hovering at ${value} stimulates consumer hedging and safe-haven buying. Gold spot historically benefits during periods of sticky CPI figures as fiat currencies experience purchasing power decay.`;
      } else if (assetType === 'stock') {
        return `Slowing US Inflation to ${value} is extremely constructive for equities. It removes the threat of aggressive Fed tightening cycles, allowing companies like ${symbol} to plan long-term capital investments with stable discount assumptions.`;
      } else {
        return `CPI cooling to ${value} represents stable purchasing power but allows interest rates to decline, boosting general risk appetite across global markets.`;
      }
    }

    if (name === 'GDP Growth Rate (QoQ)') {
      return `Annualized GDP expanding at ${value} QoQ indicates a resilient real economy. This strong industrial backdrop sustains robust consumer spending, which boosts sales pipelines for consumer-focused assets like ${symbol} and avoids systemic soft-recession pitfalls.`;
    }

    if (name === '10-Year Treasury Yield') {
      if (assetType === 'stock') {
        return `The 10-Year Treasury Yield at ${value} represents the risk-free rate. High yields increase the hurdle rate for equity investments, triggering valuation multiples compression for high-growth firms like ${symbol} since their cash flows lie far in the future.`;
      } else if (assetType === 'crypto') {
        return `Yields at ${value} attract yield-seeking capital back into highly secured sovereign bonds, presenting a moderate capital drain headwind for non-yielding digital assets like ${symbol}.`;
      } else {
        return `Treasury Yields are a fundamental indicator of economic cycle expectations. Rising yields generally strengthen the DXY index and place downward pressure on global commodities.`;
      }
    }

    if (name === 'DXY Dollar Index') {
      if (assetType === 'forex') {
        return `A DXY Dollar Index of ${value} serves as the absolute pricing benchmark. When DXY consolidates, foreign currencies like EUR/USD or GBP/USD receive passive strength support, improving export/import spreads globally.`;
      } else if (assetType === 'commodity') {
        return `Global commodities like Gold and Oil are priced in USD. A weaker DXY Index of ${value} makes commodities cheaper for international buyers, stimulating physical demand and raising spot prices.`;
      } else {
        return `A robust dollar index can depress multinational corporations' international earnings when translated back into USD, creating passive EPS headwinds for companies like ${symbol}.`;
      }
    }

    // Default generic
    return `${name} at ${value} is a pivotal macro anchor. Our quantitative forecasting models synthesize this rate with standard asset pricing formulas to estimate overall capital flows and options volatility indices for ${symbol}.`;
  }, [activeIndicator, assetType, symbol]);

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full" id="macroeconomics-panel">
      <div className="flex items-center space-x-2 border-b border-[#1f2937] pb-3 mb-4">
        <Landmark className="text-[#3b82f6] w-5 h-5" />
        <span className="text-sm font-semibold tracking-wide text-gray-200">
          GLOBAL MACROECONOMIC INDICATORS BOARD
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Indicators Selector Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {macro.map((item) => {
            const isBullish = item.status === 'Bullish';
            const isBearish = item.status === 'Bearish';
            const isSelected = item.name === selectedMacro;

            return (
              <div
                key={item.name}
                onClick={() => setSelectedMacro(item.name)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-[#1e293b] border-[#3b82f6] ring-1 ring-[#3b82f6]/50' 
                    : 'bg-[#182235] border-[#1f2937] hover:border-[#374151]'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wide truncate">
                    {item.name}
                  </span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-lg font-black text-gray-100">{item.value}</span>
                    <span className="text-xs text-gray-400 font-semibold">{item.unit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1f2937]/30">
                  <span className="text-[9px] text-gray-500 font-semibold">Change: {item.change}</span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.25 rounded uppercase ${
                    isBullish 
                      ? 'bg-green-500/10 text-green-400' 
                      : isBearish 
                        ? 'bg-red-500/10 text-red-400' 
                        : 'bg-gray-800 text-gray-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explainable AI Column */}
        <div className="lg:col-span-1 bg-[#1e1b4b]/40 border border-[#312e81]/50 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase mb-2.5 tracking-wider">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>MACRO AI EXPLAINER</span>
            </div>
            
            <span className="text-[10px] font-black uppercase text-indigo-300 block mb-1.5">
              Analyzing {activeIndicator?.name}
            </span>

            <p className="text-xs text-gray-300 leading-relaxed italic">
              "{dynamicExplainer}"
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-indigo-900/30 text-[10px] text-gray-500 flex items-center justify-between">
            <span className="flex items-center"><HelpCircle className="w-3.5 h-3.5 text-indigo-500 mr-1" /> Contextual Correlation</span>
            <span>Ensemble-Optimized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
