import React, { useState } from "react";
import { REGIONS } from "../data";
import { Region } from "../types";
import { 
  FileText, ArrowDownToLine, Sparkles, AlertCircle, 
  CheckCircle, Globe, ChevronRight, Printer, RefreshCw, Layers 
} from "lucide-react";

interface ReportsProps {
  selectedRegion: Region | null;
  onSelectRegion: (region: Region) => void;
  isDark: boolean;
}

export default function Reports({ 
  selectedRegion, 
  onSelectRegion,
  isDark 
}: ReportsProps) {
  const activeRegion = selectedRegion || REGIONS[0];
  
  // Selected report templates: "baseline" | "biodiversity" | "carbon"
  const [reportTemplate, setReportTemplate] = useState<string>("baseline");
  
  // AI Report content
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Scorecard checklists (simulated actions completed)
  const [complianceList, setComplianceList] = useState<{ [key: string]: boolean }>({
    solarTransition: true,
    afforestation: false,
    waterFilters: true,
    communityAlerts: false
  });

  const toggleCompliance = (key: string) => {
    setComplianceList(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setAiReport(null);
    setErrorText(null);

    try {
      const response = await fetch("/api/gemini/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regionName: activeRegion.name,
          metrics: {
            ...activeRegion.metrics,
            climateTemplate: reportTemplate
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiReport(data.report);
      } else {
        // Fallback simulated report
        simulateLocalReport();
      }
    } catch (err) {
      console.error(err);
      simulateLocalReport();
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateLocalReport = () => {
    setAiReport(`### SUSTAINABILITY & ENVIRONMENTAL HEALTH RECOVERY CHARTER
**Target Site:** ${activeRegion.name} (${activeRegion.country})  
**Audit Template:** ${reportTemplate.toUpperCase()} Baseline Assessment  

#### 1. Executive Summary
This evaluation reviews localized ecological indices across the **${activeRegion.name}**. Key telemetry readings reflect a core Atmospheric rating of **${activeRegion.metrics.aqi} AQI** and a Forest Canopy density of **${activeRegion.metrics.forestCoverage}%**.

#### 2. Atmospheric and Hydrological Audit
Current air index patterns specify a rating of **${activeRegion.metrics.aqi} AQI**. Continuous monitoring highlights standard drift cycles. Re-indexing of drinking resources matches localized standards. 

#### 3. Ecology & Biodiversity Preservation Plans
Biodiversity hotspots list a species index of **${activeRegion.metrics.biodiversityIndex}/100**. Maintaining natural migration borders remains highly critical for region longevity.

#### 4. Action Recommendations
*   **A. Infrastructure Upgrades:** Introduce solar panels and energy hubs to decrease emissions.
*   **B. Wetland Safety Guards:** Secure runoff mitigation belts down stream channels.
*   **C. Canopy Reclamation:** Continue native sapling afforestation strategies.`);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div id="ecological-reports-panel" className="flex flex-col gap-6">
      
      {/* Title Panel */}
      <div className={`p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-display font-medium">Environmental Audits & Report Compilation</h2>
            <p className="text-[11px] text-slate-400">Create, review, and export PDF compliance blueprints for active zones.</p>
          </div>
        </div>

        {/* Region switch dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Region Target:</label>
          <select
            id="reports-region-dropdown"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Control Card: Template Selection & Checklists */}
        <div className="flex flex-col gap-6">
          
          {/* Audit Type Picker */}
          <div className={`p-5 rounded-2xl ${isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"}`}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-display mb-3">
              1. Choose Report Focus
            </h3>
            
            <div className="flex flex-col gap-2">
              <button
                id="template-baseline"
                onClick={() => setReportTemplate("baseline")}
                className={`py-2.5 px-3 rounded-lg text-xs font-medium text-left border transition-all flex items-center justify-between ${
                  reportTemplate === "baseline"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-transparent border-slate-800 text-slate-400 hover:bg-slate-900/45"
                }`}
              >
                <span>Planetary Health Baseline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                id="template-biodiversity"
                onClick={() => setReportTemplate("biodiversity")}
                className={`py-2.5 px-3 rounded-lg text-xs font-medium text-left border transition-all flex items-center justify-between ${
                  reportTemplate === "biodiversity"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-transparent border-slate-800 text-slate-400 hover:bg-slate-900/45"
                }`}
              >
                <span>Conservation & Migration Roadmap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                id="template-carbon"
                onClick={() => setReportTemplate("carbon")}
                className={`py-2.5 px-3 rounded-lg text-xs font-medium text-left border transition-all flex items-center justify-between ${
                  reportTemplate === "carbon"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-transparent border-slate-800 text-slate-400 hover:bg-slate-900/45"
                }`}
              >
                <span>Grid Emissions & Reforestation Assessment</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Environmental Target Checklists */}
          <div className={`p-5 rounded-2xl ${isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"}`}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-display mb-1">
              2. Local Standards Scorecard
            </h3>
            <p className="text-[10.5px] text-slate-400 mb-4">Track baseline ecological actions inside this monitoring division.</p>
            
            <div className="space-y-2.5">
              <button
                id="check-solar"
                onClick={() => toggleCompliance("solarTransition")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/30 border border-slate-800/80 text-left text-xs transition-hover hover:border-slate-700 select-none cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">Grid Solar Buffer Transition</span>
                  <span className="text-[10px] text-slate-500">Photovoltaic field sizing complete</span>
                </div>
                <span>{complianceList.solarTransition ? <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/10" /> : <Layers className="w-4 h-4 text-slate-600" />}</span>
              </button>

              <button
                id="check-afforest"
                onClick={() => toggleCompliance("afforestation")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/30 border border-slate-800/80 text-left text-xs transition-hover hover:border-slate-700 select-none cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">Native Sapling Replanting</span>
                  <span className="text-[10px] text-slate-500">Assisting forest canopy coverage goals</span>
                </div>
                <span>{complianceList.afforestation ? <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/10" /> : <Layers className="w-4 h-4 text-slate-600" />}</span>
              </button>

              <button
                id="check-filters"
                onClick={() => toggleCompliance("waterFilters")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/30 border border-slate-800/80 text-left text-xs transition-hover hover:border-slate-700 select-none cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">Watershed Nutrient Filtering</span>
                  <span className="text-[10px] text-slate-500">Runoff control buffers established</span>
                </div>
                <span>{complianceList.waterFilters ? <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/10" /> : <Layers className="w-4 h-4 text-slate-600" />}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Main Panel: Report Compiler Viewer */}
        <div className="lg:col-span-2">
          
          <div className={`p-6 rounded-2xl flex flex-col justify-between h-full min-h-[420px] ${
            isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
          }`}>
            
            {/* Header toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/10 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Report Console</span>
                <h4 className="text-sm font-semibold text-emerald-400">{activeRegion.name} — Status Report</h4>
              </div>

              {aiReport && (
                <div className="flex gap-2">
                  <button
                    id="print-report-button"
                    onClick={handleTriggerPrint}
                    className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
                    title="Print / Save locally"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Document Content View */}
            <div className="flex-1 overflow-y-auto max-h-[300px] mb-4 pr-1 selection:bg-emerald-500/20">
              {aiReport ? (
                <div className="prose prose-invert prose-emerald text-xs leading-relaxed text-slate-300 space-y-3 font-sans whitespace-pre-wrap">
                  {aiReport}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full py-12">
                  <FileText className="w-10 h-10 text-slate-600 mb-2 animate-bounce" />
                  <h4 className="font-semibold text-sm">Report Ready for Generation</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-normal">
                    Select a report focus template on the left panel, then trigger our client-side environmental generator.
                  </p>
                </div>
              )}
            </div>

            {/* Control triggers */}
            <div className="flex flex-row gap-3 pt-4 border-t border-slate-800/40">
              <button
                id="generate-ai-report"
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 glow-emerald"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Compiling environmental records...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Compile Environmental Report (AI)
                  </>
                )}
              </button>

              {aiReport && (
                <button
                  id="reset-report-console"
                  onClick={() => setAiReport(null)}
                  className="py-2 px-3.5 rounded-lg border border-slate-850 hover:bg-slate-900 transition-all text-xs font-mono text-slate-400 hover:text-slate-200"
                >
                  Clear Console
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
