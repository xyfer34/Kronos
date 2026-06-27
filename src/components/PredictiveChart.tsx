import React, { useState, useRef, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  ReferenceArea
} from 'recharts';
import { PricePoint, PredictionTarget } from '../types';
import { TrendingUp, Plus, Trash2, Sliders, Layers, Eye } from 'lucide-react';

interface PredictiveChartProps {
  data: PricePoint[];
  predictionTargets: PredictionTarget[] | null;
  selectedTimeframe: string;
  symbol: string;
  assetType: string;
}

type ChartType = 'candlestick' | 'line' | 'area' | 'ohlc';

interface Drawing {
  id: string;
  type: 'trendline' | 'support' | 'resistance' | 'channel';
  val1: number;
  val2?: number; // for channels
  color: string;
  name: string;
}

export default function PredictiveChart({
  data,
  predictionTargets,
  selectedTimeframe,
  symbol,
  assetType,
}: PredictiveChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  
  // Toggles for Technical Indicators
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [showEMA, setShowEMA] = useState<boolean>(false);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [showVWAP, setShowVWAP] = useState<boolean>(false);
  const [showATR, setShowATR] = useState<boolean>(false);
  const [showFib, setShowFib] = useState<boolean>(false);
  const [showPredictions, setShowPredictions] = useState<boolean>(true);

  // User drawings state
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [customLineValue, setCustomLineValue] = useState<string>('');
  const [drawingType, setDrawingType] = useState<'support' | 'resistance' | 'channel'>('support');

  // Prepare full data list by appending forecasted points to the history
  const combinedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Create copy of historical points
    const result = data.map(p => ({
      ...p,
      isPrediction: false,
    })) as any[];

    // If predictions exist, append them visually
    if (showPredictions && predictionTargets && predictionTargets.length > 0) {
      const lastPoint = data[data.length - 1];
      const lastDate = new Date(lastPoint.date);
      
      predictionTargets.forEach((target, idx) => {
        const pDate = new Date(lastDate);
        // Map timeframes to days out
        let daysOut = 1;
        if (target.timeframe === '1 Week') daysOut = 7;
        else if (target.timeframe === '1 Month') daysOut = 30;
        else if (target.timeframe === '3 Months') daysOut = 90;
        else if (target.timeframe === '6 Months') daysOut = 180;
        
        pDate.setDate(lastDate.getDate() + daysOut);
        
        result.push({
          date: pDate.toISOString().split('T')[0],
          // Blend previous close to forecast
          predictedClose: target.predictedPrice,
          predictedLower: target.lowerBound,
          predictedUpper: target.upperBound,
          isPrediction: true,
        });
      });
    }
    
    return result;
  }, [data, predictionTargets, showPredictions]);

  // Handle adding drawings
  const addDrawing = () => {
    const val = parseFloat(customLineValue);
    if (isNaN(val)) return;

    let drawingName = 'Support Line';
    let color = '#34d399'; // Green

    if (drawingType === 'resistance') {
      drawingName = 'Resistance Line';
      color = '#f87171'; // Red
    } else if (drawingType === 'channel') {
      drawingName = 'Trading Channel';
      color = '#60a5fa'; // Blue
    }

    const newDrawing: Drawing = {
      id: Math.random().toString(),
      type: drawingType,
      val1: val,
      val2: drawingType === 'channel' ? val * 1.05 : undefined,
      color,
      name: `${drawingName} @ ${val.toFixed(assetType === 'forex' ? 4 : 2)}`,
    };

    setDrawings([...drawings, newDrawing]);
    setCustomLineValue('');
  };

  const removeDrawing = (id: string) => {
    setDrawings(drawings.filter(d => d.id !== id));
  };

  const clearDrawings = () => {
    setDrawings([]);
  };

  // Auto detect typical support / resistance to populate drawing list automatically if empty
  const autoDetectSupportResistance = () => {
    if (data.length === 0) return;
    const prices = data.map(p => p.close);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const mid = (max + min) / 2;

    const newDrawings: Drawing[] = [
      {
        id: 'auto-support',
        type: 'support',
        val1: min,
        color: '#10b981',
        name: `Auto Support Level @ ${min.toFixed(assetType === 'forex' ? 4 : 2)}`,
      },
      {
        id: 'auto-resistance',
        type: 'resistance',
        val1: max,
        color: '#ef4444',
        name: `Auto Resistance Level @ ${max.toFixed(assetType === 'forex' ? 4 : 2)}`,
      },
    ];
    setDrawings(newDrawings);
  };

  // Rendering standard candles
  const renderCustomCandlestick = (props: any) => {
    const { x, y, width, height, open, close, high, low } = props;
    const isBullish = close >= open;
    const strokeColor = isBullish ? '#10b981' : '#ef4444';
    const fillColor = isBullish ? '#10b981' : '#ef4444';
    
    // Ratio conversion calculations for recharts layout
    const ratio = height / Math.abs(open - close || 0.001);
    const wickHigh = y - (high - Math.max(open, close)) * ratio;
    const wickLow = y + height + (Math.min(open, close) - low) * ratio;

    return (
      <g>
        {/* Wick */}
        <line x1={x + width / 2} y1={wickHigh} x2={x + width / 2} y2={wickLow} stroke={strokeColor} strokeWidth={1.5} />
        {/* Candle Body */}
        <rect x={x} y={y} width={width} height={height} fill={fillColor} stroke={strokeColor} />
      </g>
    );
  };

  return (
    <div className="bg-[#0c0c0e] border border-white/10 rounded-lg p-5 flex flex-col h-full shadow-[0_4px_25px_rgba(0,0,0,0.5)] font-sans" id="tradingview-chart-container">
      {/* Chart Headers */}
      <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-3 mb-4 gap-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="text-indigo-400 w-5 h-5" />
          <span className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-sans">
            {symbol} INTERACTIVE TERMINAL CHART ({selectedTimeframe})
          </span>
        </div>
        
        {/* Chart View Selection */}
        <div className="flex bg-white/5 p-1 rounded-md text-xs space-x-1 border border-white/5">
          {(['area', 'line', 'candlestick'] as ChartType[]).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1.5 rounded font-medium transition-all cursor-pointer capitalize text-xs ${
                chartType === type 
                  ? 'bg-indigo-500/20 text-indigo-300' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              id={`chart-type-btn-${type}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left is Chart, Right is Indicators Control */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 flex-1 min-h-[400px]">
        {/* Recharts Container */}
        <div className="lg:col-span-3 bg-[#09090b] rounded-lg p-3 relative flex flex-col border border-white/5 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255, 255, 255, 0.15)" 
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.15)" 
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0c0c0e', borderColor: 'rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '6px' }}
                itemStyle={{ fontSize: 12 }}
                labelStyle={{ fontWeight: 'bold', fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}
              />

              {/* Confidence Band Area */}
              {showPredictions && (
                <Area
                  name="AI Confidence Band"
                  dataKey="predictedUpper"
                  stroke="none"
                  fill="#818cf8"
                  fillOpacity={0.1}
                  connectNulls
                />
              )}
              {showPredictions && (
                <Area
                  name="AI Prediction Margin"
                  dataKey="predictedLower"
                  stroke="none"
                  fill="#818cf8"
                  fillOpacity={0.1}
                  connectNulls
                />
              )}

              {/* Base Chart Options */}
              {chartType === 'area' && (
                <Area 
                  name="Historical Close"
                  type="monotone" 
                  dataKey="close" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorArea)" 
                />
              )}
              {chartType === 'line' && (
                <Line 
                  name="Historical Close"
                  type="monotone" 
                  dataKey="close" 
                  stroke="#818cf8" 
                  strokeWidth={2.5}
                  dot={false}
                />
              )}
              {chartType === 'candlestick' && (
                <Line 
                  name="Historical Close"
                  type="monotone" 
                  dataKey="close" 
                  stroke="#6366f1" 
                  strokeWidth={1.5}
                  dot={false}
                />
              )}

              {/* Predictive Core line */}
              {showPredictions && (
                <Line 
                  name="AI Probabilistic Forecast"
                  type="monotone" 
                  dataKey="predictedClose" 
                  stroke="#818cf8" 
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4, stroke: '#4f46e5', strokeWidth: 2, fill: '#818cf8' }}
                  connectNulls
                />
              )}

              {/* Technical Indicators Overlay */}
              {showSMA && (
                <Line 
                  name="SMA (20)"
                  type="monotone" 
                  dataKey="sma20" 
                  stroke="#ef4444" 
                  strokeWidth={1.2}
                  dot={false}
                />
              )}
              {showEMA && (
                <Line 
                  name="EMA (50)"
                  type="monotone" 
                  dataKey="ema50" 
                  stroke="#8b5cf6" 
                  strokeWidth={1.2}
                  dot={false}
                />
              )}
              {showBollinger && (
                <Line 
                  name="BB Upper"
                  type="monotone" 
                  dataKey="bbUpper" 
                  stroke="#10b981" 
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              )}
              {showBollinger && (
                <Line 
                  name="BB Lower"
                  type="monotone" 
                  dataKey="bbLower" 
                  stroke="#10b981" 
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              )}
              {showVWAP && (
                <Line 
                  name="VWAP"
                  type="monotone" 
                  dataKey="vwap" 
                  stroke="#06b6d4" 
                  strokeWidth={1.2}
                  dot={false}
                />
              )}

              {/* Fibonacci levels (drawn as horizontal reference areas if selected) */}
              {showFib && data.length > 0 && (
                <ReferenceLine y={data[0].fib236} label="Fib 23.6%" stroke="#818cf8" strokeWidth={0.8} strokeDasharray="3 3" />
              )}
              {showFib && data.length > 0 && (
                <ReferenceLine y={data[0].fib382} label="Fib 38.2%" stroke="#10b981" strokeWidth={0.8} strokeDasharray="3 3" />
              )}
              {showFib && data.length > 0 && (
                <ReferenceLine y={data[0].fib500} label="Fib 50.0%" stroke="#6366f1" strokeWidth={1} strokeDasharray="4 4" />
              )}
              {showFib && data.length > 0 && (
                <ReferenceLine y={data[0].fib618} label="Fib 61.8%" stroke="#ef4444" strokeWidth={0.8} strokeDasharray="3 3" />
              )}

              {/* Draw Custom support and resistance overlay lines */}
              {drawings.map(dwg => (
                <ReferenceLine
                  key={dwg.id}
                  y={dwg.val1}
                  stroke={dwg.color}
                  strokeWidth={1.5}
                  label={{ value: dwg.name, fill: dwg.color, fontSize: 10, position: 'top', fontFamily: 'monospace' }}
                />
              ))}
              {drawings.filter(d => d.type === 'channel' && d.val2 !== undefined).map(dwg => (
                <ReferenceLine
                  key={`channel-top-${dwg.id}`}
                  y={dwg.val2}
                  stroke={dwg.color}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  label={{ value: 'Channel Top', fill: dwg.color, fontSize: 10, position: 'top', fontFamily: 'monospace' }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Panel Controls */}
        <div className="bg-[#0e0e11] border border-white/10 rounded-lg p-4 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center space-x-2 text-slate-300 font-semibold text-xs uppercase mb-3 tracking-wider font-sans">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>OVERLAYS & INDICATORS</span>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <label className="flex items-center justify-between text-slate-300 p-2 hover:bg-white/5 rounded-md transition-all cursor-pointer">
                <span>SMA (20-Period)</span>
                <input 
                  type="checkbox" 
                  checked={showSMA} 
                  onChange={(e) => setShowSMA(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 accent-indigo-500 border-white/10 rounded focus:ring-indigo-500"
                  id="sma-toggle"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 p-2 hover:bg-white/5 rounded-md transition-all cursor-pointer">
                <span>EMA (50-Period)</span>
                <input 
                  type="checkbox" 
                  checked={showEMA} 
                  onChange={(e) => setShowEMA(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 accent-indigo-500 border-white/10 rounded focus:ring-indigo-500"
                  id="ema-toggle"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 p-2 hover:bg-white/5 rounded-md transition-all cursor-pointer">
                <span>Bollinger Bands (20, 2)</span>
                <input 
                  type="checkbox" 
                  checked={showBollinger} 
                  onChange={(e) => setShowBollinger(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 accent-indigo-500 border-white/10 rounded focus:ring-indigo-500"
                  id="bollinger-toggle"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 p-2 hover:bg-white/5 rounded-md transition-all cursor-pointer">
                <span>VWAP (Volume Wt.)</span>
                <input 
                  type="checkbox" 
                  checked={showVWAP} 
                  onChange={(e) => setShowVWAP(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 accent-indigo-500 border-white/10 rounded focus:ring-indigo-500"
                  id="vwap-toggle"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 p-2 hover:bg-white/5 rounded-md transition-all cursor-pointer">
                <span>Fibonacci Levels</span>
                <input 
                  type="checkbox" 
                  checked={showFib} 
                  onChange={(e) => setShowFib(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 accent-indigo-500 border-white/10 rounded focus:ring-indigo-500"
                  id="fib-toggle"
                />
              </label>

              <label className="flex items-center justify-between text-indigo-300 p-2 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-md transition-all cursor-pointer border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.05)]">
                <span>AI Probabilities Overlay</span>
                <input 
                  type="checkbox" 
                  checked={showPredictions} 
                  onChange={(e) => setShowPredictions(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 accent-indigo-500 border-indigo-500/30 rounded focus:ring-indigo-500"
                  id="prediction-toggle"
                />
              </label>
            </div>

            {/* Drawing Tools Section */}
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex items-center space-x-2 text-slate-300 font-semibold text-xs uppercase mb-3 tracking-wider font-sans">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>DRAWING TOOLS</span>
              </div>

              <div className="space-y-2">
                <div className="flex bg-[#09090b] p-1 rounded border border-white/10 text-[10px]">
                  <button 
                    onClick={() => setDrawingType('support')}
                    className={`flex-1 py-1 rounded text-center cursor-pointer font-medium transition-all ${drawingType === 'support' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400'}`}
                  >
                    Support
                  </button>
                  <button 
                    onClick={() => setDrawingType('resistance')}
                    className={`flex-1 py-1 rounded text-center cursor-pointer font-medium transition-all ${drawingType === 'resistance' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400'}`}
                  >
                    Resist
                  </button>
                  <button 
                    onClick={() => setDrawingType('channel')}
                    className={`flex-1 py-1 rounded text-center cursor-pointer font-medium transition-all ${drawingType === 'channel' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400'}`}
                  >
                    Channel
                  </button>
                </div>

                <div className="flex space-x-1">
                  <input
                    type="number"
                    step="any"
                    placeholder="Enter price level..."
                    value={customLineValue}
                    onChange={(e) => setCustomLineValue(e.target.value)}
                    className="flex-1 bg-[#09090b] border border-white/10 rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                    id="drawing-price-input"
                  />
                  <button
                    onClick={addDrawing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 rounded transition-all cursor-pointer flex items-center justify-center shadow-lg"
                    id="add-drawing-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={autoDetectSupportResistance}
                    className="flex-1 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-[10px] py-1.5 rounded text-center cursor-pointer transition-all"
                  >
                    Auto Detect S/R
                  </button>
                  <button
                    onClick={clearDrawings}
                    className="border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-[10px] px-2 py-1.5 rounded cursor-pointer transition-all"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* List Active Drawings */}
          {drawings.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-3 max-h-[100px] overflow-y-auto">
              <span className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Active Layers</span>
              <div className="space-y-1">
                {drawings.map(d => (
                  <div key={d.id} className="flex justify-between items-center text-[10px] text-slate-300 bg-[#09090b] px-2 py-1 rounded border border-white/5">
                    <span className="truncate max-w-[120px] font-mono" style={{ color: d.color }}>{d.name}</span>
                    <button onClick={() => removeDrawing(d.id)} className="text-slate-400 hover:text-rose-400 cursor-pointer">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
