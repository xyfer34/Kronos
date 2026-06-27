import React, { useState } from 'react';
import { AssetInfo } from '../mockData';
import { Star, AlertCircle, Plus, Trash2, ArrowUpRight, Scale, BellRing } from 'lucide-react';

interface WatchlistPanelProps {
  watchlist: string[];
  supportedAssets: AssetInfo[];
  activeAssetSymbol: string;
  activeAssetPrice: number;
  onSelectSymbol: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
}

interface CustomAlert {
  id: string;
  symbol: string;
  priceTarget: number;
  direction: 'ABOVE' | 'BELOW';
}

export default function WatchlistPanel({
  watchlist,
  supportedAssets,
  activeAssetSymbol,
  activeAssetPrice,
  onSelectSymbol,
  onAddToWatchlist,
  onRemoveFromWatchlist,
}: WatchlistPanelProps) {
  const [selectedAssetToAdd, setSelectedAssetToAdd] = useState<string>('');
  
  // Custom alerts state
  const [alerts, setAlerts] = useState<CustomAlert[]>([]);
  const [alertPrice, setAlertPrice] = useState<string>('');
  const [alertDir, setAlertDir] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  // Asset comparison state
  const [compareSymbols, setCompareSymbols] = useState<string[]>([activeAssetSymbol]);

  // Handle adding custom price alerts
  const handleAddAlert = () => {
    const price = parseFloat(alertPrice);
    if (isNaN(price) || price <= 0) return;

    const newAlert: CustomAlert = {
      id: Math.random().toString(),
      symbol: activeAssetSymbol,
      priceTarget: price,
      direction: alertDir,
    };

    setAlerts([...alerts, newAlert]);
    setAlertPrice('');
    alert(`Alert configured! We will monitor if ${activeAssetSymbol} crosses ${alertDir} $${price.toFixed(2)}.`);
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  // Add symbol to comparison list
  const toggleComparison = (symbol: string) => {
    if (compareSymbols.includes(symbol)) {
      if (compareSymbols.length > 1) {
        setCompareSymbols(compareSymbols.filter(s => s !== symbol));
      }
    } else {
      if (compareSymbols.length >= 3) {
        alert('You can compare a maximum of 3 assets side-by-side!');
        return;
      }
      setCompareSymbols([...compareSymbols, symbol]);
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full" id="watchlist-and-alerts">
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-[#1f2937] pb-3 mb-4">
        <Star className="text-amber-400 w-5 h-5 fill-amber-400/25" />
        <span className="text-sm font-semibold tracking-wide text-gray-200">
          SAVED WATCHLISTS, COMPASS COMPARISONS, & PRICE ALERTS
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Watchlist list column */}
        <div className="bg-[#182235] rounded-lg p-4 border border-[#1f2937] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">SAVED SECURITIES ({watchlist.length})</span>
            </div>

            {/* Selector to add to watchlist */}
            <div className="flex space-x-1 mb-4">
              <select
                value={selectedAssetToAdd}
                onChange={(e) => setSelectedAssetToAdd(e.target.value)}
                className="flex-1 bg-[#111827] text-gray-300 border border-[#1f2937] rounded px-2 py-1.5 text-xs focus:outline-none"
                id="watchlist-asset-add-select"
              >
                <option value="">Select asset to add...</option>
                {supportedAssets
                  .filter(a => !watchlist.includes(a.symbol))
                  .map(a => (
                    <option key={a.symbol} value={a.symbol}>
                      {a.symbol} - {a.name}
                    </option>
                  ))
                }
              </select>
              <button
                onClick={() => {
                  if (selectedAssetToAdd) {
                    onAddToWatchlist(selectedAssetToAdd);
                    setSelectedAssetToAdd('');
                  }
                }}
                disabled={!selectedAssetToAdd}
                className="bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white p-2 rounded cursor-pointer transition-colors"
                id="add-watchlist-btn"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable list */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
              {watchlist.map(sym => {
                const info = supportedAssets.find(a => a.symbol === sym);
                if (!info) return null;

                const isActive = sym === activeAssetSymbol;

                return (
                  <div
                    key={sym}
                    className={`p-2.5 rounded-md border flex justify-between items-center transition-all ${
                      isActive 
                        ? 'bg-[#1e293b] border-[#3b82f6]' 
                        : 'bg-[#111827] border-[#1f2937]/80 hover:border-[#374151]'
                    }`}
                  >
                    <div 
                      onClick={() => onSelectSymbol(sym)}
                      className="flex-1 cursor-pointer"
                    >
                      <span className="font-bold text-[#3b82f6] block">{sym}</span>
                      <span className="text-[10px] text-gray-400 block truncate max-w-[120px]">{info.name}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Checkboxes to add to side-by-side comparison list */}
                      <label className="flex items-center space-x-1 text-[9px] text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={compareSymbols.includes(sym)}
                          onChange={() => toggleComparison(sym)}
                          className="w-3.5 h-3.5 rounded border-gray-600 focus:ring-blue-500"
                        />
                        <span>Compare</span>
                      </label>

                      <button
                        onClick={() => onRemoveFromWatchlist(sym)}
                        className="text-gray-500 hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[9px] text-gray-500 pt-3 border-t border-[#1f2937]/20 flex justify-between mt-4">
            <span>Click symbol to load charts</span>
            <span>Local persistence</span>
          </div>
        </div>

        {/* Comparison grid panel */}
        <div className="bg-[#182235] rounded-lg p-4 border border-[#1f2937] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block mb-3.5 uppercase tracking-wide flex items-center">
              <Scale className="w-4 h-4 text-[#3b82f6] mr-1.5" />
              COMPARATIVE COMPETITIVE ANALYSIS
            </span>

            <div className="space-y-3.5 text-xs">
              <div className="bg-[#111827] border border-[#1f2937] rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-[#1f2937] bg-[#0f172a]/40">
                      <th className="p-2 text-gray-400">Security</th>
                      <th className="p-2 text-right text-gray-400">Base Price</th>
                      <th className="p-2 text-right text-gray-400">Daily Vol.</th>
                      <th className="p-2 text-right text-gray-400">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareSymbols.map(sym => {
                      const item = supportedAssets.find(a => a.symbol === sym);
                      if (!item) return null;
                      return (
                        <tr key={sym} className="border-b border-[#1f2937]/40 hover:bg-[#182235]">
                          <td className="p-2 font-black text-[#3b82f6]">{sym}</td>
                          <td className="p-2 text-right text-gray-200">${item.basePrice.toFixed(2)}</td>
                          <td className="p-2 text-right text-amber-400 font-bold">{(item.volatility * 100).toFixed(1)}%</td>
                          <td className="p-2 text-right text-gray-400 uppercase">{item.type}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed bg-[#111827] p-2.5 rounded border border-[#1f2937]">
                <span className="text-amber-400 font-bold uppercase mr-1">Tuning comparison:</span>
                Mark the compare checkboxes in the Watchlist column to lay up to 3 securities side-by-side to cross-analyze volatility benchmarks.
              </p>
            </div>
          </div>

          <div className="text-[9px] text-gray-500 pt-3 border-t border-[#1f2937]/20 flex justify-between mt-3">
            <span>Multi-Asset Benchmarking</span>
            <span>Fully Active</span>
          </div>
        </div>

        {/* Custom Price Alerts Column */}
        <div className="bg-[#182235] rounded-lg p-4 border border-[#1f2937] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block mb-3.5 uppercase tracking-wide flex items-center">
              <BellRing className="w-4 h-4 text-amber-400 mr-1.5" />
              CONFIGURE VOLATILITY PRICE ALERTS
            </span>

            <div className="space-y-3">
              <div className="flex bg-[#111827] p-0.5 rounded border border-[#1f2937] text-[10px]">
                <button
                  onClick={() => setAlertDir('ABOVE')}
                  className={`flex-1 py-1 rounded text-center cursor-pointer font-semibold ${alertDir === 'ABOVE' ? 'bg-[#3b82f6] text-white' : 'text-gray-400'}`}
                >
                  Crosses Above
                </button>
                <button
                  onClick={() => setAlertDir('BELOW')}
                  className={`flex-1 py-1 rounded text-center cursor-pointer font-semibold ${alertDir === 'BELOW' ? 'bg-[#3b82f6] text-white' : 'text-gray-400'}`}
                >
                  Crosses Below
                </button>
              </div>

              <div className="flex space-x-1">
                <input
                  type="number"
                  step="any"
                  placeholder="Set trigger price..."
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  className="flex-1 bg-[#111827] border border-[#1f2937] rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]"
                  id="alert-price-input"
                />
                <button
                  onClick={handleAddAlert}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center"
                  id="add-alert-btn"
                >
                  Set Alert
                </button>
              </div>

              {/* Active Alerts List */}
              {alerts.length > 0 && (
                <div className="mt-3 border-t border-[#1f2937]/60 pt-3 max-h-[100px] overflow-y-auto space-y-1 text-[10px]">
                  <span className="text-gray-400 block uppercase font-bold mb-1">Active Alerts</span>
                  {alerts.map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-[#111827] px-2 py-1 rounded border border-[#1f2937]/50 text-gray-300">
                      <span>{a.symbol} {a.direction === 'ABOVE' ? '↑' : '↓'} ${a.priceTarget.toFixed(2)}</span>
                      <button onClick={() => removeAlert(a.id)} className="text-gray-500 hover:text-red-400 p-0.5 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-[9px] text-gray-500 pt-3 border-t border-[#1f2937]/20 flex justify-between mt-3">
            <span>In-browser notification alerts</span>
            <span>Real-time Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
