import React, { useState } from "react";
import { REGIONS, SUSTAINABLE_TIP_TEMPLATES } from "../data";
import { Region, CarbonCalculatorInput } from "../types";
import { 
  Activity, Wind, Droplet, Trees, Flame, Sun, Sparkles, 
  Leaf, Info, Gauge, Zap, Globe, RefreshCcw, Smile 
} from "lucide-react";

interface EnvironmentalDashboardProps {
  selectedRegion: Region | null;
  onSelectRegion: (region: Region) => void;
  isDark: boolean;
}

export default function EnvironmentalDashboard({ 
  selectedRegion, 
  onSelectRegion,
  isDark 
}: EnvironmentalDashboardProps) {
  // If no region selected, default to Arctic / Scandinavia Cleantech
  const activeRegion = selectedRegion || REGIONS[0];

  // Temperature rise simulator state (Advanced: Climate risk assessment tool)
  const [tempRise, setTempRise] = useState<number>(1.5);

  // Carbon calculator input state
  const [calculatorInput, setCalculatorInput] = useState<CarbonCalculatorInput>({
    transport: "medium-car",
    electricity: 320,
    diet: "mixed",
    recycling: "limited-recycle",
    heating: "gas-fired"
  });

  const [carbResults, setCarbResults] = useState<{
    footprint: number | null;
    comparisonText: string | null;
    recommendations: { title: string; impact: string; description: string }[];
    isLoading: boolean;
  }>({
    footprint: null,
    comparisonText: null,
    recommendations: [],
    isLoading: false,
  });

  // Calculate local health index score
  const calculateHealthIndex = (region: Region) => {
    // High forest, high water quality, low AQI, high renewables, high biodiversity
    const waterScore = region.metrics.waterQuality;
    const aqiFactor = Math.max(0, 100 - (region.metrics.aqi * 0.5)); // low AQI is better
    const forestScore = region.metrics.forestCoverage;
    const renewScore = region.metrics.renewablePotential;
    const bioScore = region.metrics.biodiversityIndex;

    const weighted = (waterScore + aqiFactor + forestScore + renewScore + bioScore) / 5;
    return Math.round(weighted);
  };

  const handleCalculatorChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setCalculatorInput(prev => ({
      ...prev,
      [name]: name === "electricity" ? Number(value) : value
    }));
  };

  // Connects to /api/gemini/carbon-advisor on server
  const runCarbonAdvisor = async () => {
    setCarbResults(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch("/api/gemini/carbon-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: calculatorInput })
      });

      if (res.ok) {
        const data = await res.json();
        setCarbResults({
          footprint: data.footprint || 7.2,
          comparisonText: data.comparisonText || "Slightly over clean standards.",
          recommendations: data.recommendations || [],
          isLoading: false,
        });
      } else {
        // Local fallback if API key not populated yet
        simulateLocalCalculator();
      }
    } catch (err) {
      console.error(err);
      simulateLocalCalculator();
    }
  };

  const simulateLocalCalculator = () => {
    // Generate approximate model calculations
    let score = 2.5; 
    if (calculatorInput.transport === "suv") score += 4.5;
    if (calculatorInput.transport === "medium-car") score += 2.8;
    if (calculatorInput.transport === "electric-car") score += 0.8;
    
    score += (calculatorInput.electricity * 12 * 0.0004); // approx emissions per kwh

    if (calculatorInput.diet === "heavy-meat") score += 3.0;
    if (calculatorInput.diet === "mixed") score += 1.8;
    if (calculatorInput.diet === "vegan") score += 0.4;

    if (calculatorInput.heating === "oil-system") score += 2.5;
    if (calculatorInput.heating === "gas-fired") score += 1.5;
    
    if (calculatorInput.recycling === "no-recycle") score += 1.0;

    score = Math.round(score * 10) / 10;

    setCarbResults({
      footprint: score,
      comparisonText: score < 4.7 
        ? "Excellent. You operate below the global average benchmark of 4.7 tons." 
        : "Moderate. Advancements in dynamic commutes and heating switches can reduce this surplus.",
      recommendations: [
        { 
          title: "Optimize Heating Control Loads", 
          impact: "High", 
          description: "Transition home boiler cycles or utilize highly efficient heat pump tech." 
        },
        { 
          title: "Minimize Single Transit Drives", 
          impact: "High", 
          description: "Combine travel, employ bikes, or switch short local commutes with active transport." 
        },
        { 
          title: "Select Locally Sourced Produce", 
          impact: "Medium", 
          description: "Scale vegetarian portions during midweights to relieve logistics burdens." 
        }
      ],
      isLoading: false
    });
  };

  // Trends statistics (Custom SVG paths)
  const renderTrendChart = (values: number[], labels: string[], color: string) => {
    // Dimensions
    const width = 400;
    const height = 110;
    const padding = 15;

    const maxVal = Math.max(...values, 100);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal;

    // Convert values to SVG coordinates
    const points = values.map((val, i) => {
      const x = padding + (i * (width - (padding * 2))) / (values.length - 1);
      const y = height - padding - ((val - minVal) / range) * (height - (padding * 2));
      return { x, y };
    });

    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    
    // For closed area gradient path
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Horizontal grid guide */}
        <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="rgba(16, 185, 129, 0.08)" strokeDasharray="3 3" />
        
        {/* Closed Gradient Shading */}
        <path d={areaD} fill={`url(#grad-${color})`} />
        
        {/* Main Line Stroke */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

        {/* Data Points */}
        {points.map((p, i) => (
          <g key={i} className="group/dot">
            <circle cx={p.x} cy={p.y} r="3.5" fill={color} className="cursor-pointer transition-all hover:r-5" />
            <text x={p.x} y={p.y - 8} fontSize="7" fill={isDark ? "#94a3b8" : "#475569"} className="opacity-0 group-hover/dot:opacity-100 font-mono text-center transition-opacity" textAnchor="middle">
              {values[i]}
            </text>
          </g>
        ))}

        {/* Bottom Labels */}
        {labels.map((l, i) => {
          const x = padding + (i * (width - (padding * 2))) / (values.length - 1);
          return (
            <text key={i} x={x} y={height - 2} fontSize="7.5" fill="rgba(148, 163, 184, 0.6)" fontFamily="monospace" textAnchor="middle">
              {l}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div id="environmental-dashboard-panel" className="flex flex-col gap-6">
      
      {/* Target Location Select Bar */}
      <div className={`p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Globe className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-base font-display font-medium">Environmental Telemetries & Projections</h2>
            <p className="text-[11px] text-slate-400">Active Station: <span className="text-emerald-400 font-bold">{activeRegion.name}</span> ({activeRegion.country})</p>
          </div>
        </div>

        {/* Region switcher select box */}
        <select
          id="dashboard-region-switch"
          className={`text-xs py-2 px-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
            isDark 
              ? "bg-slate-900 border-slate-800 text-emerald-300" 
              : "bg-white border-slate-200 text-slate-800"
          }`}
          value={activeRegion.id}
          onChange={(e) => {
            const found = REGIONS.find(r => r.id === e.target.value);
            if (found) onSelectRegion(found);
          }}
        >
          {REGIONS.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Primary Bento Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Scorecard 1: Health Index Gauge */}
        <div className={`p-5 rounded-2xl relative ${isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"}`}>
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-emerald-400" />
              Integrated Planetary Score
            </span>
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono">Telemetry</span>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              {/* SVG circular track and glowing indicator */}
              <svg viewBox="0 0 36 36" className="w-24 h-24 transform -rotate-90">
                <path
                  className={isDark ? "stroke-slate-800" : "stroke-slate-200"}
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-emerald-400 transition-all duration-1000"
                  strokeWidth="3.5"
                  strokeDasharray={`${calculateHealthIndex(activeRegion)}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold font-display">{calculateHealthIndex(activeRegion)}</span>
                <span className="text-[8px] font-mono text-slate-400 tracking-tighter uppercase">Health Index</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A localized planetary optimization quotient representing water safety, tree counts, carbon burdens, and energy metrics.
              </p>
              <span className="mt-2 text-[10px] text-emerald-400 font-mono font-medium block">
                Rank: {activeRegion.sustainabilityRating} • Rating Priority
              </span>
            </div>
          </div>
        </div>

        {/* Scorecard 2: Environmental Trends (Air Quality) */}
        <div className={`p-5 rounded-2xl ${isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"}`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-orange-400" />
              Air Quality Trends (AQI)
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold ${
              activeRegion.metrics.aqi <= 50 ? "bg-emerald-500/10 text-emerald-400" :
              activeRegion.metrics.aqi <= 100 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
            }`}>
              {activeRegion.metrics.aqi} AQI
            </span>
          </div>
          {/* Trends charts for previous months */}
          {renderTrendChart(
            [
              activeRegion.metrics.aqi * 1.2, 
              activeRegion.metrics.aqi * 1.1, 
              activeRegion.metrics.aqi * 0.95, 
              activeRegion.metrics.aqi
            ].map(Math.round), 
            ["Feb", "Mar", "Apr", "May"], 
            "#f59e0b"
          )}
        </div>

        {/* Scorecard 3: Renewable & Hydro Potentials */}
        <div className={`p-5 rounded-2xl ${isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"}`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-cyan-400" />
              Renewable Potentials (Grid Integration)
            </span>
            <span className="text-xs font-bold text-cyan-400">{activeRegion.metrics.renewablePotential}%</span>
          </div>
          {renderTrendChart(
            [
              activeRegion.metrics.renewablePotential - 12, 
              activeRegion.metrics.renewablePotential - 6, 
              activeRegion.metrics.renewablePotential - 2, 
              activeRegion.metrics.renewablePotential
            ].map(Math.round), 
            ["Feb", "Mar", "Apr", "May"], 
            "#06b6d4"
          )}
        </div>
      </div>

      {/* Advanced Features: Carbon footprint & Climate threat assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Column Left: Advanced Temperature Anomalies & Threat Impacts Simulator */}
        <div className={`p-5 rounded-2xl flex flex-col justify-between ${
          isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
        }`}>
          <div>
            <h3 className="text-sm font-display font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              Climate Risk & Temperature Simulator
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1 mb-4">
              Slide to project planetary environmental thresholds and biodiversity stresses dynamically for the <strong>{activeRegion.name}</strong>.
            </p>

            {/* Slider */}
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-850 mb-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Future Boundary Increase</span>
                <span className="text-orange-400 font-bold font-display text-sm">+{tempRise.toFixed(1)}°C Anomaly</span>
              </div>
              <input
                id="climate-temp-slider"
                type="range"
                min="1.0"
                max="3.5"
                step="0.1"
                className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                value={tempRise}
                onChange={(e) => setTempRise(Number(e.target.value))}
              />
              <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1">
                <span>1.0°C (Baseline target)</span>
                <span>2.0°C (Maximum Cap)</span>
                <span>3.5°C (Extreme tipping pathways)</span>
              </div>
            </div>

            {/* Projections Feedback */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-slate-900 text-slate-400 font-mono text-[9.5px] w-12 text-center">
                  {Math.round(100 - (tempRise * 18))}%
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-bold block text-slate-200">Species Cohort Survival Rate</span>
                  <div className="w-full h-1 bg-slate-850 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.max(10, 100 - (tempRise * 18))}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-slate-900 text-slate-400 font-mono text-[9.5px] w-12 text-center">
                  {Math.round(tempRise * 26 + 10)}%
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-bold block text-slate-200">Atmospheric Dryness & Fire Risk</span>
                  <div className="w-full h-1 bg-slate-850 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-red-400 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, tempRise * 26 + 10)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-slate-900 text-slate-400 font-mono text-[9.5px] w-12 text-center text-indigo-400">
                  {Math.round(activeRegion.metrics.waterQuality * (1 - (tempRise * 0.15)))}%
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-bold block text-slate-200">Drinkable Freshwater Reserves</span>
                  <div className="w-full h-1 bg-slate-850 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-400 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.max(10, activeRegion.metrics.waterQuality * (1 - (tempRise * 0.15)))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-orange-950/20 border border-orange-500/20 text-[10.5px] leading-relaxed text-slate-300">
            <span className="font-bold text-orange-400 uppercase">⚠️ Boundary Forecast:</span> At <span className="font-bold text-white">+{tempRise.toFixed(1)}°C</span>, climate indicators suggest {
              tempRise <= 1.5 ? "sustainable stabilization chances across boreal forest reserves." :
              tempRise <= 2.5 ? "accelerated localized drying trends, raising fire cycles across forest canopy domains." :
              "severe ecosystems decoupling, high water table deterioration, and extreme seasonal habitat losses."
            }
          </div>
        </div>

        {/* Column Right: Interactive Carbon Footprint Calculator */}
        <div className={`p-5 rounded-2xl flex flex-col justify-between ${
          isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
        }`}>
          <div>
            <h3 className="text-sm font-display font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Carbon Footprint Assessment
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1 mb-4">
              Assess your personal greenhouse contributions against global conservation limits.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-mono text-slate-400">Preferred Transport</label>
                <select
                  id="calc-input-transport"
                  name="transport"
                  className={`text-xs py-1.5 px-2 rounded-lg border focus:outline-none ${
                    isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                  }`}
                  value={calculatorInput.transport}
                  onChange={handleCalculatorChange}
                >
                  <option value="electric-car">Electric Vehicle</option>
                  <option value="medium-car">Medium Petrol Car</option>
                  <option value="suv">Large SUV / Diesel</option>
                  <option value="train-bus">Public Transit / Train</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-mono text-slate-400">Diet Preference</label>
                <select
                  id="calc-input-diet"
                  name="diet"
                  className={`text-xs py-1.5 px-2 rounded-lg border focus:outline-none ${
                    isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                  }`}
                  value={calculatorInput.diet}
                  onChange={handleCalculatorChange}
                >
                  <option value="vegan">Vegan / Plant-centric</option>
                  <option value="mixed">Mixed Balanced Diet</option>
                  <option value="heavy-meat">Frequent Meat Diet</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[9px] uppercase font-mono text-slate-400">Monthly Electricity Load ({calculatorInput.electricity} kWh)</label>
                <input
                  id="calc-input-electricity"
                  type="range"
                  name="electricity"
                  min="50"
                  max="1000"
                  step="25"
                  className="w-full accent-emerald-500 cursor-pointer h-1 rounded bg-slate-800 cursor-pointer"
                  value={calculatorInput.electricity}
                  onChange={handleCalculatorChange}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-mono text-slate-400">Recycling Profile</label>
                <select
                  id="calc-input-recycling"
                  name="recycling"
                  className={`text-xs py-1.5 px-2 rounded-lg border focus:outline-none ${
                    isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                  }`}
                  value={calculatorInput.recycling}
                  onChange={handleCalculatorChange}
                >
                  <option value="strict-recycle">Strict / Zero Waste</option>
                  <option value="limited-recycle">Limited Sorting</option>
                  <option value="no-recycle">No active sorting</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-mono text-slate-400">Boiler/Heating System</label>
                <select
                  id="calc-input-heating"
                  name="heating"
                  className={`text-xs py-1.5 px-2 rounded-lg border focus:outline-none ${
                    isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                  }`}
                  value={calculatorInput.heating}
                  onChange={handleCalculatorChange}
                >
                  <option value="renew-pumps">Heat Pump / Renewable</option>
                  <option value="gas-fired">Natural Gas Fired</option>
                  <option value="oil-system">Oil Burning Grid</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <button
              id="calculate-footprint-trigger"
              onClick={runCarbonAdvisor}
              disabled={carbResults.isLoading}
              className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-md flex items-center justify-center gap-1.5 mb-3"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {carbResults.isLoading ? "Analyzing footprint..." : "Analyze Footprint via EcoAI"}
            </button>

            {carbResults.footprint !== null && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-emerald-500/25">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-slate-400">YOUR IMPACT ESTIMATION</span>
                  <span className="text-sm font-bold text-emerald-400 font-display">{carbResults.footprint} tons CO2e / yr</span>
                </div>
                <p className="text-[10px] text-slate-300 italic leading-normal mb-2">{carbResults.comparisonText}</p>
                
                {carbResults.recommendations.length > 0 && (
                  <div className="border-t border-slate-850 pt-2 font-sans">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block mb-1">Dynamic Mitigation Plan:</span>
                    <ul className="space-y-1">
                      {carbResults.recommendations.map((rec, ri) => (
                        <li key={ri} className="text-[9.5px] text-slate-300">
                          <span className="font-semibold text-white">• {rec.title}</span> ({rec.impact} Impact) — {rec.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Sustainability Tips Section */}
      <div className={`p-4 rounded-xl flex items-center gap-3.5 border border-dashed border-emerald-500/20 ${
        isDark ? "bg-slate-950/20 text-slate-300" : "bg-emerald-50 text-slate-700"
      }`}>
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xs">
          <span className="font-bold text-emerald-400 block">💡 Sustainable Action Highlight:</span>
          {SUSTAINABLE_TIP_TEMPLATES[Math.floor(Date.now() / 86400000) % SUSTAINABLE_TIP_TEMPLATES.length].tip}
        </div>
      </div>
    </div>
  );
}
