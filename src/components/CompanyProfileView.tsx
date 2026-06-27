import React, { useState } from 'react';
import { CompanyProfile } from '../types';
import { Building2, Globe, Users, DollarSign, BarChart2, PieChart } from 'lucide-react';

interface CompanyProfileViewProps {
  profile: CompanyProfile | null;
  assetPrice: number;
}

type StatementType = 'income' | 'balance' | 'cash';

export default function CompanyProfileView({ profile, assetPrice }: CompanyProfileViewProps) {
  const [statementType, setStatementType] = useState<StatementType>('income');

  if (!profile) return null;

  const isFundOrForex = profile.type === 'etf' || profile.type === 'index' || profile.type === 'commodity' || profile.type === 'forex';

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full" id="company-profile-container">
      <div className="flex items-center space-x-2 border-b border-[#1f2937] pb-3 mb-4">
        <Building2 className="text-[#3b82f6] w-5 h-5" />
        <span className="text-sm font-semibold tracking-wide text-gray-200">
          {profile.symbol} CORPORATE INTELLIGENCE & RATIOS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="bg-[#182235] rounded-lg p-4 border border-[#1f2937] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-100 mb-3 truncate">{profile.name}</h4>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Sector</span>
                <span className="text-gray-200 font-medium truncate max-w-[150px]">{profile.sector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Industry</span>
                <span className="text-gray-200 font-medium truncate max-w-[150px]">{profile.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CEO / Lead</span>
                <span className="text-gray-200 font-medium">{profile.ceo}</span>
              </div>
              {!isFundOrForex && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Headquarters</span>
                    <span className="text-gray-200 font-medium truncate max-w-[150px]">{profile.headquarters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Employees</span>
                    <span className="text-gray-200 font-medium">
                      {profile.employees > 0 ? profile.employees.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Founders / Core</span>
                <span className="text-gray-200 font-medium truncate max-w-[150px]">{profile.founders.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1f2937] space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1" /> Market Cap</span>
              <span className="text-amber-400 font-bold">
                {profile.marketCap >= 1000 
                  ? `$${(profile.marketCap / 1000).toFixed(2)} Trillion` 
                  : `$${profile.marketCap.toFixed(1)} Billion`
                }
              </span>
            </div>
            {!isFundOrForex && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">TTM Revenue</span>
                  <span className="text-gray-200 font-semibold">${(profile.revenue).toLocaleString()} Million</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TTM Profit</span>
                  <span className="text-gray-200 font-semibold">${(profile.profit).toLocaleString()} Million</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Dividend Yield</span>
              <span className="text-gray-200 font-semibold">
                {profile.dividendYield > 0 ? `${(profile.dividendYield * 100).toFixed(2)}%` : '0.00%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Split History</span>
              <span className="text-gray-300 italic">{profile.splitsHistory}</span>
            </div>
          </div>
        </div>

        {/* Financial Statements Toggles & Tables */}
        <div className="bg-[#182235] rounded-lg p-4 border border-[#1f2937] md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center">
                <PieChart className="w-4 h-4 text-[#3b82f6] mr-1.5" />
                Financial Statements
              </h5>
              
              <div className="flex bg-[#111827] p-0.5 rounded text-[10px] border border-[#1f2937]">
                <button
                  onClick={() => setStatementType('income')}
                  className={`px-2 py-1 rounded cursor-pointer ${statementType === 'income' ? 'bg-[#3b82f6] text-white' : 'text-gray-400'}`}
                >
                  Income
                </button>
                <button
                  onClick={() => setStatementType('balance')}
                  className={`px-2 py-1 rounded cursor-pointer ${statementType === 'balance' ? 'bg-[#3b82f6] text-white' : 'text-gray-400'}`}
                >
                  Balance
                </button>
                <button
                  onClick={() => setStatementType('cash')}
                  className={`px-2 py-1 rounded cursor-pointer ${statementType === 'cash' ? 'bg-[#3b82f6] text-white' : 'text-gray-400'}`}
                >
                  Cash Flow
                </button>
              </div>
            </div>

            {/* Financial Statements Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1f2937]">
                    <th className="py-2 text-gray-400 font-semibold">Metric (Millions)</th>
                    {profile.financials.incomeStatement.years.map(yr => (
                      <th key={yr} className="py-2 text-right text-gray-300 font-semibold">{yr}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {statementType === 'income' && (
                    <>
                      <tr className="border-b border-[#1f2937]/50">
                        <td className="py-2.5 text-gray-300 font-medium">Total Revenue</td>
                        {profile.financials.incomeStatement.revenue.map((val, idx) => (
                          <td key={idx} className="py-2.5 text-right text-green-400 font-semibold">
                            ${(val / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-[#1f2937]/50">
                        <td className="py-2.5 text-gray-300 font-medium">Net Income (Profit)</td>
                        {profile.financials.incomeStatement.netIncome.map((val, idx) => (
                          <td key={idx} className="py-2.5 text-right text-amber-400 font-semibold">
                            ${(val / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-[#1f2937]/30">
                        <td className="py-2.5 text-gray-400 italic">Operating Margin</td>
                        {profile.financials.incomeStatement.revenue.map((val, idx) => {
                          const net = profile.financials.incomeStatement.netIncome[idx];
                          const margin = (net / val) * 100;
                          return (
                            <td key={idx} className="py-2.5 text-right text-gray-400">
                              {margin.toFixed(1)}%
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  )}

                  {statementType === 'balance' && (
                    <>
                      <tr className="border-b border-[#1f2937]/50">
                        <td className="py-2.5 text-gray-300 font-medium">Total Assets</td>
                        {profile.financials.balanceSheet.assets.map((val, idx) => (
                          <td key={idx} className="py-2.5 text-right text-blue-400 font-semibold">
                            ${(val / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-[#1f2937]/50">
                        <td className="py-2.5 text-gray-300 font-medium">Total Liabilities</td>
                        {profile.financials.balanceSheet.liabilities.map((val, idx) => (
                          <td key={idx} className="py-2.5 text-right text-red-400 font-semibold">
                            ${(val / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-[#1f2937]/30">
                        <td className="py-2.5 text-gray-300 font-medium">Total Equity</td>
                        {profile.financials.balanceSheet.equity.map((val, idx) => (
                          <td key={idx} className="py-2.5 text-right text-teal-400 font-semibold">
                            ${(val / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B
                          </td>
                        ))}
                      </tr>
                    </>
                  )}

                  {statementType === 'cash' && (
                    <>
                      <tr className="border-b border-[#1f2937]/50">
                        <td className="py-2.5 text-gray-300 font-medium">Operating Cash Flow</td>
                        {profile.financials.cashFlow.operating.map((val, idx) => (
                          <td key={idx} className={`py-2.5 text-right font-semibold ${val >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${(val / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-[#1f2937]/50">
                        <td className="py-2.5 text-gray-300 font-medium">Investing Activities</td>
                        {profile.financials.cashFlow.investing.map((val, idx) => (
                          <td key={idx} className={`py-2.5 text-right font-semibold ${val >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${(val / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-[#1f2937]/30">
                        <td className="py-2.5 text-gray-300 font-medium">Financing Activities</td>
                        {profile.financials.cashFlow.financing.map((val, idx) => (
                          <td key={idx} className={`py-2.5 text-right font-semibold ${val >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${(val / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ratios Metrics Dashboard */}
          <div className="mt-4 pt-4 border-t border-[#1f2937]">
            <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5 flex items-center">
              <BarChart2 className="w-4 h-4 text-[#10b981] mr-1.5" />
              FINANCIAL PERFORMANCE RATIOS
            </h5>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#111827] border border-[#1f2937]/60 p-2.5 rounded-md text-center">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wide">P/E Ratio</span>
                <span className="text-sm font-bold text-gray-200">
                  {profile.ratios.pe > 0 ? `${profile.ratios.pe.toFixed(2)}x` : 'N/A'}
                </span>
              </div>
              <div className="bg-[#111827] border border-[#1f2937]/60 p-2.5 rounded-md text-center">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wide">PEG Ratio</span>
                <span className="text-sm font-bold text-gray-200">
                  {profile.ratios.peg > 0 ? `${profile.ratios.peg.toFixed(2)}` : 'N/A'}
                </span>
              </div>
              <div className="bg-[#111827] border border-[#1f2937]/60 p-2.5 rounded-md text-center">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wide">Return on Equity (ROE)</span>
                <span className="text-sm font-bold text-[#10b981]">
                  {(profile.ratios.roe * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-[#111827] border border-[#1f2937]/60 p-2.5 rounded-md text-center">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wide">Debt / Equity</span>
                <span className="text-sm font-bold text-amber-400">
                  {profile.ratios.debtEquity.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div className="bg-[#111827] border border-[#1f2937]/60 p-2.5 rounded-md text-center">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wide">Current Ratio</span>
                <span className="text-sm font-bold text-gray-200">
                  {profile.ratios.currentRatio.toFixed(2)}
                </span>
              </div>
              <div className="bg-[#111827] border border-[#1f2937]/60 p-2.5 rounded-md text-center">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wide">Gross Margin</span>
                <span className="text-sm font-bold text-[#10b981]">
                  {(profile.ratios.grossMargin * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-[#111827] border border-[#1f2937]/60 p-2.5 rounded-md text-center">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wide">Operating Margin</span>
                <span className="text-sm font-bold text-teal-400">
                  {(profile.ratios.operatingMargin * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-[#111827] border border-[#1f2937]/60 p-2.5 rounded-md text-center">
                <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wide">Return on Assets (ROA)</span>
                <span className="text-sm font-bold text-purple-400">
                  {(profile.ratios.roa * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
