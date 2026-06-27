import React, { useState, useMemo } from 'react';
import { Portfolio, PortfolioItem } from '../types';
import { Briefcase, TrendingUp, TrendingDown, RefreshCw, HelpCircle, Shield, Plus, Trash2, PieChart } from 'lucide-react';

interface PortfolioPanelProps {
  portfolio: Portfolio;
  onUpdatePortfolio: (updated: Portfolio) => void;
  activeAssetPrice: number;
  activeAssetSymbol: string;
}

export default function PortfolioPanel({ 
  portfolio, 
  onUpdatePortfolio, 
  activeAssetPrice, 
  activeAssetSymbol 
}: PortfolioPanelProps) {
  const [riskTolerance, setRiskTolerance] = useState<Portfolio['riskTolerance']>(portfolio.riskTolerance);
  const [tradeShares, setTradeShares] = useState<string>('');

  // Update local tolerance in portfolio
  const handleToleranceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Portfolio['riskTolerance'];
    setRiskTolerance(value);
    onUpdatePortfolio({
      ...portfolio,
      riskTolerance: value,
    });
  };

  // Perform a simulated transaction (Buy or Sell)
  const handleTrade = (type: 'BUY' | 'SELL') => {
    const qty = parseFloat(tradeShares);
    if (isNaN(qty) || qty <= 0) return;

    const currentItemIndex = portfolio.items.findIndex(item => item.symbol === activeAssetSymbol);
    const cost = qty * activeAssetPrice;

    let updatedItems = [...portfolio.items];
    let updatedCash = portfolio.cash;

    if (type === 'BUY') {
      if (updatedCash < cost) {
        alert('Insufficient Cash Funds!');
        return;
      }
      updatedCash -= cost;

      if (currentItemIndex >= 0) {
        // Average up/down purchase price calculation
        const existing = updatedItems[currentItemIndex];
        const newShares = existing.shares + qty;
        const newAvg = (existing.shares * existing.avgPurchasePrice + cost) / newShares;
        updatedItems[currentItemIndex] = {
          ...existing,
          shares: newShares,
          avgPurchasePrice: Number(newAvg.toFixed(4)),
          currentPrice: activeAssetPrice,
        };
      } else {
        updatedItems.push({
          symbol: activeAssetSymbol,
          shares: qty,
          avgPurchasePrice: activeAssetPrice,
          currentPrice: activeAssetPrice,
        });
      }
    } else {
      // Sell
      if (currentItemIndex < 0 || updatedItems[currentItemIndex].shares < qty) {
        alert('Insufficient shares in your portfolio!');
        return;
      }
      
      const existing = updatedItems[currentItemIndex];
      updatedCash += cost;

      if (existing.shares === qty) {
        updatedItems = updatedItems.filter(item => item.symbol !== activeAssetSymbol);
      } else {
        updatedItems[currentItemIndex] = {
          ...existing,
          shares: existing.shares - qty,
          currentPrice: activeAssetPrice,
        };
      }
    }

    onUpdatePortfolio({
      ...portfolio,
      cash: Number(updatedCash.toFixed(2)),
      items: updatedItems,
    });

    setTradeShares('');
  };

  // Portfolio calculations
  const stats = useMemo(() => {
    let totalHoldingsValue = 0;
    let initialCost = 0;

    portfolio.items.forEach(item => {
      // Sync with active price if matches
      const price = item.symbol === activeAssetSymbol ? activeAssetPrice : item.currentPrice;
      totalHoldingsValue += item.shares * price;
      initialCost += item.shares * item.avgPurchasePrice;
    });

    const totalValue = portfolio.cash + totalHoldingsValue;
    const initialTotalValue = 100000; // Assume starting capital is 100K
    const totalReturnVal = totalValue - initialTotalValue;
    const totalReturnPercent = (totalReturnVal / initialTotalValue) * 100;

    // Diversification score (based on number of items)
    const holdingsCount = portfolio.items.length;
    let diversificationScore = 'Low';
    if (holdingsCount >= 4) diversificationScore = 'Excellent';
    else if (holdingsCount >= 2) diversificationScore = 'Moderate';

    // Sector allocation estimate
    const allocation = portfolio.items.map(item => {
      const price = item.symbol === activeAssetSymbol ? activeAssetPrice : item.currentPrice;
      const value = item.shares * price;
      return {
        symbol: item.symbol,
        value,
        percent: totalValue > 0 ? (value / totalValue) * 100 : 0
      };
    });

    return {
      totalValue,
      totalHoldingsValue,
      totalReturnVal,
      totalReturnPercent,
      diversificationScore,
      allocation
    };
  }, [portfolio, activeAssetPrice, activeAssetSymbol]);

  // Dynamic AI Suggestions matching Selected Risk Tolerance
  const aiSuggestions = useMemo(() => {
    if (riskTolerance === 'Low') {
      return {
        title: 'Conservative AI Portfolio Optimization',
        rebalance: 'Recommend allocating 60% of liquid assets into commodities (GOLD Spot) and indices (^SPX) to buffer equity drawdowns. Ensure cash reserves remain at 15-20% to acquire blue-chip indices on deep oversold indicators.',
        suggestedAdds: ['GOLD', 'SPY', 'USDJPY']
      };
    } else if (riskTolerance === 'Medium') {
      return {
        title: 'Moderate Growth AI Portfolio Optimization',
        rebalance: 'Recommend allocating 45% into stable tech equities (AAPL, MSFT) and 35% into general indices. Add 10% exposure to commodities and 10% to liquid blue-chip digital currencies (BTC) during Fibonacci consolidation zones.',
        suggestedAdds: ['MSFT', 'BTC', 'QQQ']
      };
    } else {
      // High
      return {
        title: 'Aggressive Alpha AI Portfolio Optimization',
        rebalance: 'Recommend focusing 60% of leverage into high-beta technology leaders (NVDA, TSLA) and emerging layer-1 digital assets (SOL, ETH). Balance speculative trades by holding 10% highly volatile commodities (OIL) during global geopolitical supply spikes.',
        suggestedAdds: ['NVDA', 'SOL', 'TSLA']
      };
    }
  }, [riskTolerance]);

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full" id="portfolio-tracker">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center border-b border-[#1f2937] pb-3 mb-4 gap-4">
        <div className="flex items-center space-x-2">
          <Briefcase className="text-[#3b82f6] w-5 h-5" />
          <span className="text-sm font-semibold tracking-wide text-gray-200">
            SIMULATED INSTITUTIONAL PORTFOLIO TRACKER
          </span>
        </div>

        {/* Risk Tolerance selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400">Target Risk Style:</span>
          <select
            value={riskTolerance}
            onChange={handleToleranceChange}
            className="bg-[#1e293b] text-gray-200 border border-[#1f2937] rounded px-2.5 py-1 focus:outline-none cursor-pointer"
            id="portfolio-risk-select"
          >
            <option value="Low">Low Risk (Capital Preserve)</option>
            <option value="Medium">Medium Risk (Balanced Growth)</option>
            <option value="High">High Risk (Aggressive Alpha)</option>
          </select>
        </div>
      </div>

      {/* Main Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-[#182235] p-3.5 rounded-lg border border-[#1f2937]/80">
          <span className="text-[10px] text-gray-400 block uppercase font-bold mb-1">TOTAL PORTFOLIO NET WORTH</span>
          <span className="text-lg font-black text-gray-100">${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-[#182235] p-3.5 rounded-lg border border-[#1f2937]/80">
          <span className="text-[10px] text-gray-400 block uppercase font-bold mb-1">LIQUID CASH RESERVES</span>
          <span className="text-lg font-black text-emerald-400">${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-[#182235] p-3.5 rounded-lg border border-[#1f2937]/80">
          <span className="text-[10px] text-gray-400 block uppercase font-bold mb-1">CUMULATIVE RETURN</span>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-black ${stats.totalReturnVal >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {stats.totalReturnVal >= 0 ? '+' : ''}${stats.totalReturnVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-bold px-1.5 py-0.25 rounded ${stats.totalReturnVal >= 0 ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ef4444]/15 text-[#ef4444]'}`}>
              {stats.totalReturnPercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="bg-[#182235] p-3.5 rounded-lg border border-[#1f2937]/80">
          <span className="text-[10px] text-gray-400 block uppercase font-bold mb-1">DIVERSIFICATION FACTOR</span>
          <span className="text-lg font-black text-blue-400">{stats.diversificationScore}</span>
        </div>
      </div>

      {/* Grid: Left is Trade Panel and Active Holdings, Right is Allocations & suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Trade and active holdings list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Simulated Trading Desk */}
          <div className="bg-[#182235] rounded-lg p-4 border border-[#1f2937] flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-400 block uppercase">SIMULATED TRANSACTION TRADING DESK</span>
              <span className="text-xs text-gray-200">
                Execute simulated block trade orders for <span className="text-[#3b82f6] font-bold">{activeAssetSymbol}</span> @ ${activeAssetPrice.toFixed(activeAssetSymbol.includes('USD') || activeAssetSymbol.includes('JPY') ? 4 : 2)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Shares..."
                value={tradeShares}
                onChange={(e) => setTradeShares(e.target.value)}
                className="w-24 bg-[#111827] border border-[#1f2937] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                id="trade-shares-input"
              />
              <button
                onClick={() => handleTrade('BUY')}
                className="bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer transition-colors"
                id="buy-trade-btn"
              >
                BUY
              </button>
              <button
                onClick={() => handleTrade('SELL')}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer transition-colors"
                id="sell-trade-btn"
              >
                SELL
              </button>
            </div>
          </div>

          {/* Holdings List */}
          <div className="bg-[#182235] rounded-lg border border-[#1f2937] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1f2937] bg-[#1c283f]/30">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">CURRENT PORTFOLIO ACTIVE HOLDINGS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1f2937] bg-[#0f172a]/20">
                    <th className="p-3 text-gray-400 font-semibold">Symbol</th>
                    <th className="p-3 text-right text-gray-400 font-semibold">Shares</th>
                    <th className="p-3 text-right text-gray-400 font-semibold">Avg. Purchase Price</th>
                    <th className="p-3 text-right text-gray-400 font-semibold">Total Cost Basis</th>
                    <th className="p-3 text-right text-gray-400 font-semibold">Market Value</th>
                    <th className="p-3 text-right text-gray-400 font-semibold">P/L Return</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 italic">No assets held. Utilize the trade desk above to purchase simulated positions.</td>
                    </tr>
                  ) : (
                    portfolio.items.map(item => {
                      const price = item.symbol === activeAssetSymbol ? activeAssetPrice : item.currentPrice;
                      const costBasis = item.shares * item.avgPurchasePrice;
                      const currentVal = item.shares * price;
                      const returnVal = currentVal - costBasis;
                      const returnPercent = (returnVal / costBasis) * 100;

                      return (
                        <tr key={item.symbol} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30">
                          <td className="p-3 font-bold text-[#3b82f6]">{item.symbol}</td>
                          <td className="p-3 text-right text-gray-200">{item.shares.toLocaleString()}</td>
                          <td className="p-3 text-right text-gray-300">${item.avgPurchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right text-gray-300">${costBasis.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right text-gray-100 font-semibold">${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className={`p-3 text-right font-bold ${returnVal >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                            {returnVal >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Diversification & Suggestions */}
        <div className="space-y-4">
          {/* Allocation Breakdown list */}
          <div className="bg-[#182235] rounded-lg p-4 border border-[#1f2937]">
            <span className="text-[10px] font-black text-gray-400 block mb-3.5 uppercase tracking-wide flex items-center">
              <PieChart className="w-4 h-4 text-[#3b82f6] mr-1.5" />
              PORTFOLIO SECTOR ALLOCATIONS
            </span>

            <div className="space-y-3">
              {/* Cash allocation */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400 font-medium">Liquid Cash Reserves</span>
                  <span className="text-gray-200 font-bold">{(portfolio.cash / stats.totalValue * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#111827] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${portfolio.cash / stats.totalValue * 100}%` }} />
                </div>
              </div>

              {/* Holdings breakdown */}
              {stats.allocation.map(alloc => (
                <div key={alloc.symbol}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 font-medium">{alloc.symbol} Position</span>
                    <span className="text-gray-200 font-bold">{alloc.percent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#111827] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#3b82f6] h-full" style={{ width: `${alloc.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Rebalancing Suggestion Box */}
          <div className="bg-[#1e1b4b]/40 border border-[#312e81]/50 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase mb-2.5 tracking-wider">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>{aiSuggestions.title}</span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed italic mb-3.5">
                "{aiSuggestions.rebalance}"
              </p>

              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[9px] text-gray-500 uppercase font-semibold">Recommended Adds:</span>
                {aiSuggestions.suggestedAdds.map(add => (
                  <span key={add} className="text-[10px] bg-indigo-950/50 border border-[#312e81]/60 text-indigo-300 px-2 py-0.5 rounded font-black">
                    {add}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-900/30 text-[9px] text-gray-500 flex items-center justify-between">
              <span>Risk Rebalance Advisor</span>
              <span>Ensembled Guidance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
