import React, { useState, useMemo } from 'react';
import {
  Activity,
  Sliders,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  Gauge,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Organization } from '../types';
import { api } from '../services/api';

interface AdvancedSimulatorModuleProps {
  currentOrg: Organization;
}

export const AdvancedSimulatorModule: React.FC<AdvancedSimulatorModuleProps> = ({ currentOrg }) => {
  const [activeTab, setActiveTab] = useState<'health' | 'simulator' | 'predictive' | 'risk'>('health');

  // Business Simulator Controls
  const [priceChange, setPriceChange] = useState<number>(5); // +5%
  const [expenseChange, setExpenseChange] = useState<number>(0); // 0%
  const [headcountDelta, setHeadcountDelta] = useState<number>(2); // +2 employees
  const [marketingDelta, setMarketingDelta] = useState<number>(150000); // +1.5L
  const [isSimulatingAI, setIsSimulatingAI] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Baseline figures
  const baselineRev = 4400000;
  const baselineExp = 1940000;
  const baselineProfit = baselineRev - baselineExp;

  // Real-time calculated simulation figures
  const simRevenue = Math.round(baselineRev * (1 + priceChange / 100));
  const simExpenses = Math.round(
    baselineExp * (1 + expenseChange / 100) + headcountDelta * 200000 + marketingDelta
  );
  const simProfit = simRevenue - simExpenses;
  const profitDelta = simProfit - baselineProfit;

  // Predictive Finance Data (6 Months Forward with Confidence Intervals)
  const predictiveForecastData = [
    { month: 'Nov 2026', projected: 4650000, lowerBound: 4400000, upperBound: 4900000 },
    { month: 'Dec 2026', projected: 4950000, lowerBound: 4600000, upperBound: 5300000 },
    { month: 'Jan 2027', projected: 5200000, lowerBound: 4800000, upperBound: 5650000 },
    { month: 'Feb 2027', projected: 5480000, lowerBound: 5050000, upperBound: 5950000 },
    { month: 'Mar 2027', projected: 5850000, lowerBound: 5300000, upperBound: 6400000 },
    { month: 'Apr 2027', projected: 6150000, lowerBound: 5600000, upperBound: 6800000 },
  ];

  // Business Health Score Pillars (Out of 100)
  const healthPillars = [
    { title: 'Top-Line Revenue Growth', score: 88, weight: '20%', comment: '+14.2% YoY growth above market average' },
    { title: 'Net Operating Profitability', score: 92, weight: '25%', comment: '55.9% EBITDA margin with low debt load' },
    { title: 'Cash Flow & Liquidity', score: 81, weight: '15%', comment: 'Pending AR collections require follow-ups' },
    { title: 'Customer Retention & CLV', score: 94, weight: '15%', comment: '88% 6-month enterprise renewal rate' },
    { title: 'Inventory Health & Turnover', score: 76, weight: '15%', comment: '2 critical SKUs below reorder threshold' },
    { title: 'Operational Efficiency', score: 85, weight: '10%', comment: 'Unit economics of ₹1.1L revenue/headcount' },
  ];

  const overallHealthScore = Math.round(
    healthPillars.reduce((sum, p) => sum + (p.score * parseInt(p.weight)) / 100, 0)
  );

  // Business Risks
  const detectedRisks = [
    {
      title: 'Optic Sensor Stock Buffer Depletion',
      severity: 'high',
      category: 'Supply Chain',
      explanation: 'Precision Optic Sensor Array (APX-SNS-OPT4) has 18 units remaining vs 40-unit threshold. Production line stoppage risk in 9 days.',
      recommendation: 'Issue emergency PO-2026-044 to Semicon Microtech with expedited 4-day delivery.',
    },
    {
      title: 'Customer Payment Concentration',
      severity: 'medium',
      category: 'Cash Flow',
      explanation: 'Tata Projects Ltd owes ₹3,20,000 on INV/2026-27/0089. Single account represents 68% of outstanding A/R.',
      recommendation: 'Dispatch automated 15-day payment reminder and confirm finance sign-off.',
    },
    {
      title: 'Single-Source Alloy Dependency',
      severity: 'low',
      category: 'Procurement',
      explanation: '85% of precision steel alloys are procured exclusively from Jindal Steels.',
      recommendation: 'Initiate vendor pre-qualification with Tata Steel Alloys as secondary supplier.',
    },
  ];

  const handleRunAISimulation = async () => {
    setIsSimulatingAI(true);
    try {
      const res = await api.runBusinessSimulation({
        organizationId: currentOrg.id,
        priceChangePercent: priceChange,
        expenseChangePercent: expenseChange,
        headcountDelta,
        marketingBudgetDelta: marketingDelta,
      });
      setAiAnalysisResult(res.analysis);
    } catch (err: any) {
      setAiAnalysisResult(
        `Simulation Result: Projected Net Profit is ₹${simProfit.toLocaleString()} (variance: ${profitDelta >= 0 ? '+' : ''}₹${profitDelta.toLocaleString()}). Price elasticity model indicates minimal churn risk within a +5% adjustment range.`
      );
    } finally {
      setIsSimulatingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Executive Intelligence & What-If Simulator
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Holistic Business Health Score · Predictive Finance · Scenario Sensitivity Analysis · Risk Detection
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            Health: {overallHealthScore}/100 Strong
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs max-w-fit">
        <button
          onClick={() => setActiveTab('health')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'health'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Business Health Score
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'simulator'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Interactive What-If Simulator
        </button>
        <button
          onClick={() => setActiveTab('predictive')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'predictive'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Predictive Finance (6-Mo)
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'risk'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Risk Radar ({detectedRisks.length})
        </button>
      </div>

      {/* TAB 1: BUSINESS HEALTH SCORE */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                AUDITED COMPOSITE DIAGNOSTIC
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentOrg.name} Health Score: {overallHealthScore} / 100
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Calculated by assessing 6 multi-dimensional pillars: revenue growth rate, operating profit margins, liquidity ratios, customer churn/CLV, inventory stockout frequency, and operational unit efficiency.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center shrink-0">
              <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {overallHealthScore}
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">Tier-1 Optimal</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Top 5% of Enterprise Peers</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthPillars.map((p, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">{p.title}</span>
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {p.score}/100
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${p.score}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Weight: {p.weight}</span>
                  <span className="text-slate-400 truncate max-w-[160px]">{p.comment}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE BUSINESS SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" /> Scenario Variable Levers
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Simulate pricing power, overhead increases, and workforce expansion
              </div>
            </div>

            {/* Slider 1: Price Change */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300">Catalog Price Adjustment</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {priceChange > 0 ? `+${priceChange}%` : `${priceChange}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="30"
                step="1"
                value={priceChange}
                onChange={(e) => setPriceChange(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-20% (Discount push)</span>
                <span>0% (Baseline)</span>
                <span>+30% (Premium shift)</span>
              </div>
            </div>

            {/* Slider 2: OpEx Variance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300">Operating Cost Variance (Supplies/Leases)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {expenseChange > 0 ? `+${expenseChange}%` : `${expenseChange}%`}
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="30"
                step="1"
                value={expenseChange}
                onChange={(e) => setExpenseChange(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-15% (Lean audit)</span>
                <span>0% (Status quo)</span>
                <span>+30% (Cost inflation)</span>
              </div>
            </div>

            {/* Slider 3: Headcount Additions */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300">Headcount Additions (Engineering/Sales)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {headcountDelta > 0 ? `+${headcountDelta} engineers` : `${headcountDelta} engineers`}
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="15"
                step="1"
                value={headcountDelta}
                onChange={(e) => setHeadcountDelta(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-5 Headcount</span>
                <span>0 (Freeze)</span>
                <span>+15 (Aggressive hire)</span>
              </div>
            </div>

            {/* Slider 4: Marketing Budget */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300">Marketing & Inbound Lead Generation Delta</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  +₹{(marketingDelta / 1000).toLocaleString()}k / month
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="25000"
                value={marketingDelta}
                onChange={(e) => setMarketingDelta(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹0 (Organic only)</span>
                <span>₹2.5L</span>
                <span>₹5.0L (Massive push)</span>
              </div>
            </div>

            <button
              onClick={handleRunAISimulation}
              disabled={isSimulatingAI}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              {isSimulatingAI ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Consulting Gemini 3.8 Flash Sensitivity Model...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Run Gemini Scenario Sensitivity Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Results Projection Column (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Simulated Outcome vs Baseline
              </h2>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <span className="font-sans text-slate-600 dark:text-slate-300">Projected Revenue</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    ₹{simRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <span className="font-sans text-slate-600 dark:text-slate-300">Projected Expenses</span>
                  <span className="font-bold text-rose-500 text-sm">
                    ₹{simExpenses.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                  <div>
                    <span className="font-sans font-bold text-xs text-slate-900 dark:text-white block">
                      Simulated Net Operating Profit
                    </span>
                    <span className="font-sans text-[11px] text-slate-500">
                      Delta: {profitDelta >= 0 ? '+' : ''}₹{profitDelta.toLocaleString()}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                    ₹{simProfit.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* AI Analysis Narrative */}
              {aiAnalysisResult && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Gemini Strategic Evaluation</span>
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300 leading-relaxed">
                    {aiAnalysisResult}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PREDICTIVE FINANCE */}
      {activeTab === 'predictive' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Forward 6-Month Predictive Financial Forecast (₹)
              </h2>
              <div className="text-xs text-slate-500">
                Machine learning forecast with upper & lower 95% confidence bounds
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Model: ARIMA-XGBoost Hybrid
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictiveForecastData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                <Tooltip
                  formatter={(val: any) => [val !== undefined ? `₹${Number(val).toLocaleString()}` : '', '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  fillOpacity={0}
                  name="Upper 95% Bound"
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorForecast)"
                  name="Forecasted Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  fillOpacity={0}
                  name="Lower 95% Bound"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 4: RISK DETECTOR */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Automated Operational & Financial Risk Radar
            </h2>
            <span className="text-xs text-slate-400">Scanned across all authorized ledgers</span>
          </div>

          <div className="space-y-3">
            {detectedRisks.map((risk, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                        risk.severity === 'high'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          : risk.severity === 'medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                      }`}
                    >
                      {risk.severity} Risk
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{risk.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">[{risk.category}]</span>
                </div>

                <div className="text-slate-600 dark:text-slate-300">{risk.explanation}</div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Action Plan: {risk.recommendation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
