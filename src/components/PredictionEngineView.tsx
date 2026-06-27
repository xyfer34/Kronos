import React from 'react';
import { PredictionEngineOutput } from '../types';
import { ShieldCheck, Target, TrendingUp, HelpCircle, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';

interface PredictionEngineViewProps {
  prediction: PredictionEngineOutput | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function PredictionEngineView({ prediction, loading, onRefresh }: PredictionEngineViewProps) {
  if (loading) {
    return (
      <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
        <span className="text-sm text-gray-400 font-medium">Re-computing ensembled neural models...</span>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
        <AlertCircle className="w-8 h-8 text-amber-500 mb-3" />
        <span className="text-sm text-gray-400 font-medium">No forecast calculated for this symbol yet.</span>
        <button
          onClick={onRefresh}
          className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs px-4 py-2 rounded-md font-bold cursor-pointer transition-colors"
        >
          Initialize AI Prediction
        </button>
      </div>
    );
  }

  // Color mappings for Ratings
  const getRatingStyle = (rating: string) => {
    switch (rating) {
      case 'Strong Buy': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Buy': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'Hold': return 'bg-gray-800 text-gray-400 border-gray-700';
      case 'Sell': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Strong Sell': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-950/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-950/20';
      case 'High': return 'text-orange-400 bg-orange-950/20';
      case 'Extreme': return 'text-red-500 bg-red-950/20 animate-pulse';
      default: return 'text-gray-300 bg-gray-800';
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full" id="ai-prediction-engine">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center border-b border-[#1f2937] pb-3 mb-4 gap-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="text-amber-500 w-5 h-5" />
          <span className="text-sm font-semibold tracking-wide text-gray-200">
            ENSEMBLE PREDICTION ENGINE & EXPLAINABLE AI
          </span>
        </div>
        
        <button
          onClick={onRefresh}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-1.5 rounded font-bold cursor-pointer transition-colors flex items-center"
          id="recalc-forecast-btn"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Re-Run Forecast Models
        </button>
      </div>

      {/* Bento Layout Grid for Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Rating summary dashboard */}
        <div className="bg-[#182235] border border-[#1f2937] rounded-lg p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase tracking-wide">
                MODEL BUY/SELL RATING
              </span>
              <div className={`px-3 py-2 text-center text-sm font-black border uppercase rounded-md ${getRatingStyle(prediction.rating)}`}>
                {prediction.rating}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wide">
                FORECAST CONFIDENCE
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-amber-400">{prediction.confidenceScore}%</span>
                <span className="text-[10px] text-gray-500">Confidence Band</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase tracking-wide">
                RISK VOLATILITY LEVEL
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded block text-center ${getRiskStyle(prediction.riskLevel)}`}>
                {prediction.riskLevel} Risk
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1f2937]/50 text-[10px] text-gray-400 leading-relaxed bg-[#111827] p-2.5 rounded border border-[#1f2937]/30">
            <span className="text-amber-400 font-bold uppercase mr-1">ENsembled Models:</span>
            Synthesized via LSTM, ARIMA, XGBoost, and Transformer-based time series algorithms.
          </div>
        </div>

        {/* Probability intervals targets */}
        <div className="lg:col-span-3 bg-[#182235] border border-[#1f2937] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block mb-3 uppercase tracking-wide flex items-center">
              <Target className="w-4 h-4 text-amber-500 mr-1.5" />
              INTERVAL PROBABILITY RANGES & PRICE TARGETS
            </span>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {prediction.targets.map((tgt) => {
                const inc = tgt.probabilityRange.increase;
                const sdw = tgt.probabilityRange.sideways;
                const dec = tgt.probabilityRange.decline;

                return (
                  <div key={tgt.timeframe} className="bg-[#111827] border border-[#1f2937] rounded p-3 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <span className="text-[10px] font-black text-amber-400 block uppercase mb-1.5">{tgt.timeframe}</span>
                      <span className="text-xs font-semibold text-gray-200 block mb-0.5">Est: ${tgt.predictedPrice}</span>
                      <span className="text-[9px] text-gray-400 block leading-tight">
                        Range: ${tgt.lowerBound} - ${tgt.upperBound}
                      </span>
                    </div>

                    {/* Stacked bar or horizontal probability display */}
                    <div className="mt-3.5 space-y-1 text-[9px]">
                      <div className="flex justify-between items-center text-green-400">
                        <span>Up:</span>
                        <span className="font-bold">{inc}%</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Side:</span>
                        <span className="font-bold">{sdw}%</span>
                      </div>
                      <div className="flex justify-between items-center text-red-400">
                        <span>Down:</span>
                        <span className="font-bold">{dec}%</span>
                      </div>

                      {/* Stacked visually */}
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden flex mt-1">
                        <div className="bg-green-400 h-full" style={{ width: `${inc}%` }} />
                        <div className="bg-gray-400 h-full" style={{ width: `${sdw}%` }} />
                        <div className="bg-red-400 h-full" style={{ width: `${dec}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed italic bg-[#111827] p-2.5 rounded border border-[#1f2937]/30 mt-4">
            "{prediction.summaryText}"
          </p>
        </div>
      </div>

      {/* Explainable AI justifications section */}
      <div className="mt-5 border-t border-[#1f2937] pt-5">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center">
          <Sparkles className="w-4 h-4 text-amber-500 mr-1.5" />
          EXPLAINABLE AI CORE JUSTIFICATION FACTORS
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Technicals */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-blue-400 uppercase block border-b border-[#1f2937] pb-1">
              1. Technical Setup
            </span>
            <ul className="space-y-2 list-disc list-inside text-gray-400 leading-relaxed">
              {prediction.explanation.technicals.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Fundamentals */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-emerald-400 uppercase block border-b border-[#1f2937] pb-1">
              2. Company Fundamentals
            </span>
            <ul className="space-y-2 list-disc list-inside text-gray-400 leading-relaxed">
              {prediction.explanation.fundamentals.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* News Sentiment */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-amber-300 uppercase block border-b border-[#1f2937] pb-1">
              3. News Sentiment Analysis
            </span>
            <ul className="space-y-2 list-disc list-inside text-gray-400 leading-relaxed">
              {prediction.explanation.newsSentiment.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs mt-5 pt-4 border-t border-[#1f2937]/40">
          {/* Macroeconomics */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-purple-400 uppercase block border-b border-[#1f2937] pb-1">
              4. Macroeconomic Drivers
            </span>
            <ul className="space-y-2 list-disc list-inside text-gray-400 leading-relaxed">
              {prediction.explanation.macroeconomics.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Social Sentiment */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-pink-400 uppercase block border-b border-[#1f2937] pb-1">
              5. Social Sentiment Indicators
            </span>
            <ul className="space-y-2 list-disc list-inside text-gray-400 leading-relaxed">
              {prediction.explanation.socialSentiment.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Institutional Activity */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-indigo-400 uppercase block border-b border-[#1f2937] pb-1">
              6. Institutional Activity
            </span>
            <ul className="space-y-2 list-disc list-inside text-gray-400 leading-relaxed">
              {prediction.explanation.institutionalActivity.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
