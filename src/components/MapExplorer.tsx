import React, { useState, useRef, useEffect } from "react";
import { REGIONS, WILDLIFE_ROUTES } from "../data";
import { Region, WildlifeRoute } from "../types";
import { 
  ZoomIn, ZoomOut, RotateCcw, Search, Sparkles, Heart, 
  MapPin, Wind, Trees, Droplet, Sun, ShieldAlert, Navigation, 
  Activity, ArrowRight, Compass, ShieldCheck 
} from "lucide-react";

interface MapExplorerProps {
  onSelectRegion: (region: Region) => void;
  selectedRegion: Region | null;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  isDark: boolean;
}

export default function MapExplorer({ 
  onSelectRegion, 
  selectedRegion, 
  savedIds, 
  onToggleSave,
  isDark 
}: MapExplorerProps) {
  // Map zoom and pan state
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Layer state
  // "terrain" | "aqi" | "forest" | "biodiversity" | "water" | "renewable"
  const [activeLayer, setActiveLayer] = useState<string>("terrain");
  
  // Migration route filter
  const [activeMigration, setActiveMigration] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [naturalLanguageActive, setNaturalLanguageActive] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Comparisons
  const [comparisonRegion, setComparisonRegion] = useState<Region | null>(null);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);

  // Dynamic climate risk check state
  const [showRiskAssessment, setShowRiskAssessment] = useState<boolean>(false);

  // Zoom limits
  const minZoom = 1;
  const maxZoom = 4;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, maxZoom));
  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.5, minZoom);
      if (next === 1) {
        setOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setAiExplanation(null);
    setNaturalLanguageActive(false);
  };

  // Drag handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return; // Only allow panning when zoomed
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    // Bound the offset based on zoom strength
    const limitX = (zoom - 1) * 350;
    const limitY = (zoom - 1) * 180;
    setOffset({
      x: Math.max(-limitX, Math.min(limitX, newX)),
      y: Math.max(-limitY, Math.min(limitY, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Perform search / natural language query
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setAiExplanation(null);

    // 1. First search local regions literally by name/country
    const literalMatch = REGIONS.find(
      r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           r.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.ecosystemType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (literalMatch) {
      // Lit matches directly focus map and select
      onSelectRegion(literalMatch);
      // Center map on coordinates
      focusOnRegion(literalMatch);
      setIsSearching(false);
      return;
    }

    // 2. Fall back to Gemini environmental reasoning proxy
    try {
      setNaturalLanguageActive(true);
      const response = await fetch("/api/gemini/analyze-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          availableRegions: REGIONS.map(r => ({
            id: r.id,
            name: r.name,
            country: r.country,
            ecosystemType: r.ecosystemType,
            metrics: r.metrics
          }))
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.matchedRegionId) {
          const match = REGIONS.find(r => r.id === result.matchedRegionId);
          if (match) {
            onSelectRegion(match);
            focusOnRegion(match);
            setAiExplanation(result.explanation);
          } else {
            setAiExplanation("I deduced ecological parallels, but none of our active telemetry stations cover that exact combination yet.");
          }
        } else {
          setAiExplanation(result.explanation || "No telemetry node matches that criteria. Try something like 'Show regions with hazardous air quality' or 'Show high forest preservation'.");
        }
      } else {
        setAiExplanation("AI matching is currently adjusting. Try calling standard landmarks like 'Scandia', 'Amazon' or 'Sahel'.");
      }
    } catch (err) {
      console.error(err);
      setAiExplanation("Analysis stream interrupted. Attempting direct search options.");
    } finally {
      setIsSearching(false);
    }
  };

  const focusOnRegion = (region: Region) => {
    // Zoom in and offset center towards region coordinates
    setZoom(1.8);
    // Map is 1000x500. Center is 500x250.
    // SVG x is percentage (e.g. 52 is 520px)
    const targetX = region.coordinates.x * 10;
    const targetY = region.coordinates.y * 10;
    const shiftX = (500 - targetX) * 0.8;
    const shiftY = (250 - targetY) * 0.8;
    setOffset({ x: shiftX, y: shiftY });
  };

  // Get color for corresponding layer highlight
  const getOverlayStyle = (region: Region) => {
    const { metrics } = region;
    switch (activeLayer) {
      case "aqi":
        if (metrics.aqi <= 25) return "rgba(16, 185, 129, 0.4)"; // Emerald
        if (metrics.aqi <= 75) return "rgba(245, 158, 11, 0.4)"; // Yellow-orange
        return "rgba(239, 68, 68, 0.6)"; // Strong red
      case "forest":
        return `rgba(16, 185, 129, ${metrics.forestCoverage / 150})`; // Lush emeralds
      case "biodiversity":
        return `rgba(245, 158, 11, ${metrics.biodiversityIndex / 150})`; // Golden biodiversity centers
      case "water":
        if (metrics.waterQuality >= 80) return "rgba(59, 130, 246, 0.45)"; // Deep ocean blue
        if (metrics.waterQuality >= 50) return "rgba(245, 158, 11, 0.4)";
        return "rgba(139, 92, 246, 0.55)"; // Purple stress
      case "renewable":
        return `rgba(6, 182, 212, ${metrics.renewablePotential / 150})`; // Cyan potentials
      default:
        return "transparent";
    }
  };

  // Render simulated SVG grid continents
  const renderContinents = () => {
    const strokeColor = isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(15, 23, 42, 0.05)";
    const fillColor = isDark ? "rgba(15, 23, 42, 0.7)" : "rgba(241, 245, 249, 0.8)";
    const mapGridStyle = isDark ? "rgba(16, 185, 129, 0.04)" : "rgba(16, 185, 129, 0.02)";

    return (
      <>
        {/* Longitudinal/Latitudinal Gridlines */}
        <g stroke={mapGridStyle} strokeWidth="1">
          {Array.from({ length: 19 }).map((_, i) => (
            <line key={`lon-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`lat-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} />
          ))}
        </g>

        {/* Stylized geometric representations of major landmasses for thematic sci-fi eco styling */}
        {/* North America */}
        <path d="M 50 100 L 150 100 L 250 150 L 300 180 L 280 260 L 190 280 L 180 340 L 220 380 L 150 360 L 120 280 L 80 200 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* South America */}
        <path d="M 220 380 L 280 400 L 310 460 L 270 500 L 250 500 L 220 440 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Eurasia (Europe + Asia) */}
        <path d="M 450 150 L 520 80 L 650 80 L 800 100 L 950 130 L 980 200 L 920 300 L 850 340 L 800 380 L 730 380 L 700 320 L 580 300 L 550 250 L 450 200 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
        {/* Africa */}
        <path d="M 430 260 L 520 260 L 560 300 L 550 380 L 521 460 L 490 470 L 480 380 L 420 320 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
        {/* Australia */}
        <path d="M 820 400 L 890 380 L 940 420 L 930 460 L 840 460 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        
        {/* Greenland */}
        <polygon points="350,50 420,60 400,120 340,110" fill={fillColor} stroke={strokeColor} strokeWidth="1" />
      </>
    );
  };

  return (
    <div id="map-explorer-panel" className="flex flex-col lg:flex-row gap-6 h-full min-h-[580px]">
      
      {/* Search & Toolbars Side */}
      <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
        
        {/* Search Panel */}
        <div className={`p-4 rounded-xl ${isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"}`}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-2 font-display flex items-center gap-1.5 text-emerald-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
            Geography Search
          </h2>
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              id="map-query-input"
              type="text"
              placeholder="Search city, status or standard criteria..."
              className={`w-full text-xs pl-8 pr-8 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                isDark 
                  ? "bg-slate-900/60 border-emerald-500/20 text-emerald-100 placeholder-slate-500" 
                  : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <button
              id="ai-trigger-search"
              type="submit"
              disabled={isSearching}
              className="absolute right-1 top-1 p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Query environmental engine"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSearching ? "animate-pulse" : ""}`} />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            <span className="text-emerald-400 font-medium">✨ Natural Search Ask:</span> Try typing <em>"Show zones with dangerous air"</em> or <em>"reclaim forest indicators"</em> to run environmental evaluation maps.
          </p>

          {naturalLanguageActive && aiExplanation && (
            <div className="mt-3 p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-[11px] leading-relaxed relative">
              <div className="absolute -top-2 left-4 px-1.5 bg-slate-950 text-[9px] text-emerald-400 uppercase font-semibold">AI Match Feedback</div>
              <p className="text-slate-300 italic">{aiExplanation}</p>
            </div>
          )}
        </div>

        {/* Environmental Overlay Controls */}
        <div className={`p-4 rounded-xl ${isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"}`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 font-display text-emerald-400">
            Telemetry Overlays
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              id="layer-terrain"
              onClick={() => { setActiveLayer("terrain"); setActiveMigration(null); }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all border ${
                activeLayer === "terrain" && !activeMigration
                  ? "bg-slate-800 border-emerald-500/30 text-emerald-400 shadow-sm" 
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-slate-500" /> Original
            </button>
            <button
              id="layer-aqi"
              onClick={() => { setActiveLayer("aqi"); setActiveMigration(null); }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all border ${
                activeLayer === "aqi" 
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400 shadow-sm" 
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-orange-400" /> Air Quality
            </button>
            <button
              id="layer-forest"
              onClick={() => { setActiveLayer("forest"); setActiveMigration(null); }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all border ${
                activeLayer === "forest" 
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400 shadow-sm" 
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Trees className="w-3.5 h-3.5 text-emerald-400" /> Forest Canopy
            </button>
            <button
              id="layer-biodiversity"
              onClick={() => { setActiveLayer("biodiversity"); setActiveMigration(null); }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all border ${
                activeLayer === "biodiversity" 
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400 shadow-sm" 
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-500" /> Biodiversity
            </button>
            <button
              id="layer-water"
              onClick={() => { setActiveLayer("water"); setActiveMigration(null); }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all border ${
                activeLayer === "water" 
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400 shadow-sm" 
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Droplet className="w-3.5 h-3.5 text-indigo-400" /> Hydrology
            </button>
            <button
              id="layer-renewable"
              onClick={() => { setActiveLayer("renewable"); setActiveMigration(null); }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all border ${
                activeLayer === "renewable" 
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400 shadow-sm" 
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-cyan-400" /> Renewables
            </button>
          </div>
        </div>

        {/* Wildlife Migration Overlay Channels */}
        <div className={`p-4 rounded-xl ${isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"}`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 font-display text-emerald-400 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 rotate-45" /> Wildlife Flyways
          </h3>
          <div className="flex flex-col gap-1.5">
            {WILDLIFE_ROUTES.map(route => (
              <button
                id={`migrate-${route.id}`}
                key={route.id}
                onClick={() => {
                  setActiveMigration(activeMigration === route.id ? null : route.id);
                  setActiveLayer("terrain"); // Reset metric overlays
                }}
                className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] text-left transition-all border ${
                  activeMigration === route.id 
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300" 
                    : "bg-transparent border-slate-800 text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold block truncate">{route.species.split(" ")[0]} Route</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-normal font-semibold ${
                    route.populationStatus === "Endangered" 
                      ? "bg-red-500/10 text-red-400" 
                      : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {route.populationStatus}
                  </span>
                </div>
                <span className="text-[9px] block text-slate-500 truncate mt-0.5">{route.startLoc} ➔ {route.endLoc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Saved Locations Quick Select */}
        <div className={`p-4 rounded-xl ${isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"}`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-1 font-display text-emerald-400">
            Pinpoints Saved ({savedIds.length})
          </h3>
          {savedIds.length === 0 ? (
            <p className="text-[10px] text-slate-500 italic mt-2">No bookmarks pinned. Save a dashboard node to access fast benchmarks.</p>
          ) : (
            <div className="flex flex-wrap gap-1 mt-2">
              {REGIONS.filter(r => savedIds.includes(r.id)).map(r => (
                <button
                  id={`quick-save-${r.id}`}
                  key={r.id}
                  onClick={() => { onSelectRegion(r); focusOnRegion(r); }}
                  className="py-1 px-2 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] flex items-center gap-1 transition-all"
                >
                  <MapPin className="w-2.5 h-2.5" />
                  {r.name.split(" ")[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary SVG Interactive Map Content */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Dynamic Map Window */}
        <div 
          id="canvas-map-window"
          ref={mapRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`relative aspect-[2/1] rounded-2xl overflow-hidden cursor-move touch-none group select-none border border-emerald-500/15 ${
            isDark ? "bg-slate-950" : "bg-[#f1f5f9]"
          }`}
        >
          {/* Layer Indicator Banner */}
          <div className="absolute top-3 left-4 z-10 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-display text-slate-300 font-medium flex items-center gap-1.5 border border-emerald-500/20 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 badge-pulse"></span>
            ACTIVE LAYER: <span className="text-emerald-400 font-bold uppercase">{activeLayer}</span>
            {activeMigration && (
              <span className="text-amber-400">| {WILDLIFE_ROUTES.find(w => w.id === activeMigration)?.species}</span>
            )}
          </div>

          {/* Compass Rose Ornament */}
          <div className="absolute bottom-4 left-4 pointer-events-none select-none opacity-20">
            <div className="w-16 h-16 border border-emerald-500/40 rounded-full flex items-center justify-center relative">
              <Compass className="w-10 h-10 text-emerald-400 animate-spin-slow" />
              <div className="absolute -top-1 text-[8px] font-mono text-emerald-400">N</div>
              <div className="absolute -bottom-1 text-[8px] font-mono text-emerald-400">S</div>
            </div>
          </div>

          {/* Core Mapping Container */}
          <div 
            id="scalable-svg-container"
            className="w-full h-full transition-transform duration-75 ease-out select-none"
            style={{
              transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
              transformOrigin: "center center",
            }}
          >
            <svg 
              viewBox="0 0 1000 500" 
              className="w-full h-full select-none"
            >
              {/* Mainland Paths */}
              {renderContinents()}

              {/* Grid Lat/Lng Lables on Margin */}
              <g fill="rgba(16, 185, 129, 0.25)" fontSize="8" fontFamily="monospace">
                <text x="20" y="250">0° EQ</text>
                <text x="500" y="10">0° MERIDIAN</text>
              </g>

              {/* Dynamic Environmental Overlay Gradients / Heats */}
              {REGIONS.map(region => {
                const overlayColor = getOverlayStyle(region);
                if (overlayColor === "transparent") return null;
                const radius = 45 + (region.metrics.aqi / 6) + (region.metrics.forestCoverage / 4);
                return (
                  <g key={`overlay-${region.id}`}>
                    <defs>
                      <radialGradient id={`grad-${region.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={overlayColor} stopOpacity="0.8" />
                        <stop offset="60%" stopColor={overlayColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={overlayColor} stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle 
                      cx={region.coordinates.x * 10} 
                      cy={region.coordinates.y * 10} 
                      r={radius} 
                      fill={`url(#grad-${region.id})`}
                      className="pointer-events-none mix-blend-screen animate-pulse"
                      style={{ animationDuration: `${2 + Math.random() * 3}s` }}
                    />
                  </g>
                );
              })}

              {/* Wildlife Migration Trajectories */}
              {activeMigration && (
                (() => {
                  const targetMigration = WILDLIFE_ROUTES.find(w => w.id === activeMigration);
                  if (!targetMigration) return null;
                  
                  // Construct path string from coordinate lists
                  const pathStr = targetMigration.coordinates.map((c, idx) => 
                    `${idx === 0 ? "M" : "L"} ${c.x * 10} ${c.y * 10}`
                  ).join(" ");

                  return (
                    <g key="migration-lines">
                      <title>{targetMigration.species}</title>
                      {/* Base shadow glow path */}
                      <path 
                        d={pathStr} 
                        fill="none" 
                        stroke="rgba(245, 158, 11, 0.15)" 
                        strokeWidth="5" 
                        strokeLinecap="round"
                      />
                      {/* Active glowing flyway line */}
                      <path 
                        d={pathStr} 
                        fill="none" 
                        stroke="rgba(245, 158, 11, 0.84)" 
                        strokeWidth="2" 
                        strokeDasharray="8 6"
                        strokeLinecap="round"
                        className="animate-pulse"
                      >
                        <animate 
                          attributeName="stroke-dashoffset" 
                          values="100;0" 
                          dur="8s" 
                          repeatCount="indefinite" 
                        />
                      </path>

                      {/* Path Anchor Indicators */}
                      {targetMigration.coordinates.map((coord, ci) => (
                        <circle 
                          key={`anchor-${ci}`} 
                          cx={coord.x * 10} 
                          cy={coord.y * 10} 
                          r="4" 
                          fill="#f59e0b" 
                          className="animate-ping"
                        />
                      ))}
                    </g>
                  );
                })()
              )}

              {/* Regional Marker Nodes */}
              {REGIONS.map(region => {
                const isSelected = selectedRegion?.id === region.id;
                const isSaved = savedIds.includes(region.id);
                const isCompTarget = comparisonRegion?.id === region.id;
                
                // Coordinates
                const x = region.coordinates.x * 10;
                const y = region.coordinates.y * 10;

                // Color based on climate stress danger category
                let pinColor = "stroke-emerald-400 fill-emerald-500/20";
                if (region.metrics.aqi > 100 || region.metrics.climateRisk === "Extreme") {
                  pinColor = "stroke-red-400 fill-red-500/20";
                } else if (region.metrics.climateRisk === "High") {
                  pinColor = "stroke-orange-400 fill-orange-500/20";
                }

                return (
                  <g 
                    key={region.id} 
                    className="cursor-pointer select-none group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCompareMode) {
                        if (region.id === selectedRegion?.id) return;
                        setComparisonRegion(region);
                      } else {
                        onSelectRegion(region);
                      }
                    }}
                  >
                    {/* Ring highlight if selected */}
                    {isSelected && (
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="18" 
                        className="stroke-emerald-400 fill-none animate-ping" 
                        strokeWidth="1" 
                        strokeDasharray="2 3"
                      />
                    )}
                    
                    {isCompTarget && (
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="18" 
                        className="stroke-amber-400 fill-none animate-ping" 
                        strokeWidth="1" 
                        strokeDasharray="2 3"
                      />
                    )}

                    {/* Glowing outer aura */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isSelected ? "11" : "8"} 
                      className={`${pinColor} cursor-pointer transition-all duration-300 group-hover:r-12`} 
                      strokeWidth="2" 
                    />

                    {/* Solid core pinpoint */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="4" 
                      className={isSelected ? "fill-emerald-400" : isCompTarget ? "fill-amber-400" : "fill-white"} 
                    />

                    {/* Regional mini scoreboard text */}
                    <text 
                      x={x + 12} 
                      y={y + 3} 
                      className={`text-[8px] font-bold select-none ${
                        isSelected 
                          ? "fill-emerald-400 font-display" 
                          : isCompTarget 
                            ? "fill-amber-400 font-display" 
                            : isDark 
                              ? "fill-slate-400" 
                              : "fill-slate-700"
                      }`}
                    >
                      {region.name.split(" ")[0]} [Rating: {region.sustainabilityRating}]
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Interactive Control Tools Anchor Bottom-Right */}
          <div className="absolute bottom-3 right-3 flex flex-row items-center gap-1.5 z-10 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-lg border border-emerald-500/20 shadow-lg">
            <button
              id="map-panel-zoomIn"
              onClick={handleZoomIn}
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors"
              title="Zoom In (or double-drag)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="map-panel-zoomOut"
              onClick={handleZoomOut}
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              id="map-panel-reset"
              onClick={handleReset}
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-emerald-400 transition-all"
              title="Recenter Map Frame"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Selected Region Detailed Scorecard Panels & Actions */}
        {selectedRegion ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Environmental Summary Tab */}
            <div className={`p-5 rounded-2xl relative ${isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"}`}>
              {/* Bookmark state */}
              <button
                id="toggle-selected-favorite"
                onClick={() => onToggleSave(selectedRegion.id)}
                className="absolute top-4 right-4 p-2 rounded-full border border-emerald-500/20 bg-slate-900/40 text-rose-400 hover:scale-105 transition-all shadow-md"
              >
                <Heart className={`w-4 h-4 ${savedIds.includes(selectedRegion.id) ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>

              <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md ${
                selectedRegion.sustainabilityRating === "A" ? "bg-emerald-500/10 text-emerald-400" :
                selectedRegion.sustainabilityRating === "B" ? "bg-cyan-500/10 text-cyan-400" :
                selectedRegion.sustainabilityRating === "C" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
              }`}>
                Sustainability Rating: {selectedRegion.sustainabilityRating}
              </span>

              <h3 className="text-xl font-display font-bold mt-2 text-emerald-400">{selectedRegion.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{selectedRegion.country} • Ecosystem: <span className="italic">{selectedRegion.ecosystemType}</span></p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 flex flex-col justify-center">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Air Quality</span>
                  <span className={`text-base font-bold flex items-center gap-1 ${
                    selectedRegion.metrics.aqi <= 25 ? "text-emerald-400" :
                    selectedRegion.metrics.aqi <= 100 ? "text-amber-500" : "text-red-400"
                  }`}>
                    {selectedRegion.metrics.aqi} <span className="text-[9.5px] font-normal">AQI</span>
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 flex flex-col justify-center">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Forest Canopy</span>
                  <span className="text-base font-bold text-emerald-400">
                    {selectedRegion.metrics.forestCoverage}%
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 flex flex-col justify-center">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Climate Risk</span>
                  <span className={`text-base font-bold ${
                    selectedRegion.metrics.climateRisk === "Low" ? "text-emerald-400" :
                    selectedRegion.metrics.climateRisk === "Moderate" ? "text-amber-500" : "text-rose-500"
                  }`}>
                    {selectedRegion.metrics.climateRisk}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  id="simulate-risk-trigger"
                  onClick={() => setShowRiskAssessment(prev => !prev)}
                  className="py-1.5 px-3.5 rounded-lg text-xs bg-emerald-500 hover:bg-emerald-600 font-semibold text-white transition-all flex items-center gap-1.5 glow-emerald shadow-lg"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  {showRiskAssessment ? "Hide Climate Assessment" : "Assess Climate Risk"}
                </button>
                <button
                  id="compare-nodes-trigger"
                  onClick={() => {
                    setIsCompareMode(prev => {
                      if (!prev) setComparisonRegion(null);
                      return !prev;
                    });
                  }}
                  className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isCompareMode 
                      ? "bg-amber-500 text-slate-950 hover:bg-amber-600" 
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  {isCompareMode ? "Exit Compare Mode" : "Compare Telemetries"}
                </button>
              </div>

              {isCompareMode && (
                <div className="mt-3 p-2 rounded-lg border border-amber-500/30 bg-amber-950/20 text-[10px] leading-relaxed text-slate-300">
                  <span className="font-bold text-amber-400">💡 Compare Active:</span> Select any other pinpoint node on the map overlay to perform comparative telemetry side-by-side!
                </div>
              )}
            </div>

            {/* Quick Stats Highlights / Comparison / Assessment View */}
            <div className={`p-5 rounded-2xl ${isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"}`}>
              {showRiskAssessment ? (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 font-display flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Environmental Risk Assessment
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 mb-3">
                    Calculated projections for the next 25-50 years based on regional planetary temperature anomalies of <span className="text-amber-400 font-bold">+{selectedRegion.metrics.temperatureAnomaly}°C</span>.
                  </p>
                  
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-0.5">
                        <span>Wildfire Threat Coefficient</span>
                        <span className="text-slate-400">{(selectedRegion.metrics.temperatureAnomaly * 45).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full" 
                          style={{ width: `${Math.min(100, selectedRegion.metrics.temperatureAnomaly * 45)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-0.5">
                        <span>Ecosystem Fragmentation Hazard</span>
                        <span className="text-slate-400">{(100 - selectedRegion.metrics.biodiversityIndex * 0.9).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-400 rounded-full" 
                          style={{ width: `${100 - selectedRegion.metrics.biodiversityIndex * 0.9}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-0.5">
                        <span>Resource Scarcity Quotient (Water Stress)</span>
                        <span className="text-slate-400">{(100 - selectedRegion.metrics.waterQuality).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-400 rounded-full" 
                          style={{ width: `${100 - selectedRegion.metrics.waterQuality}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    <span className="text-emerald-400 font-medium font-mono">✓ Assessment Recommendation:</span> Maintain extensive woodland barriers and optimize carbon retention pools locally to mitigate rapid drying trends.
                  </p>
                </div>
              ) : isCompareMode && comparisonRegion ? (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-display flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> Location Telemetry Matchup
                  </h4>
                  
                  <div className="grid grid-cols-3 text-center mt-3 border-b border-emerald-500/10 pb-1.5 font-mono text-[9px] text-slate-400">
                    <div className="text-left font-sans font-bold">Metric</div>
                    <div className="text-emerald-400 font-semibold truncate uppercase">{selectedRegion.name.split(" ")[0]}</div>
                    <div className="text-amber-400 font-semibold truncate uppercase">{comparisonRegion.name.split(" ")[0]}</div>
                  </div>

                  <div className="space-y-1.5 py-2 font-mono text-[10.5px]">
                    <div className="grid grid-cols-3 border-b border-slate-800/40 py-1">
                      <span className="text-slate-500">AQI Index</span>
                      <span className={selectedRegion.metrics.aqi <= 50 ? "text-emerald-400" : "text-amber-400"}>{selectedRegion.metrics.aqi}</span>
                      <span className={comparisonRegion.metrics.aqi <= 50 ? "text-emerald-400" : "text-amber-400"}>{comparisonRegion.metrics.aqi}</span>
                    </div>

                    <div className="grid grid-cols-3 border-b border-slate-800/40 py-1">
                      <span className="text-slate-500">Canopy Cover</span>
                      <span className="text-slate-300">{selectedRegion.metrics.forestCoverage}%</span>
                      <span className="text-slate-300">{comparisonRegion.metrics.forestCoverage}%</span>
                    </div>

                    <div className="grid grid-cols-3 border-b border-slate-800/40 py-1">
                      <span className="text-slate-500">Biodiversity</span>
                      <span className="text-slate-300">{selectedRegion.metrics.biodiversityIndex}/100</span>
                      <span className="text-slate-300">{comparisonRegion.metrics.biodiversityIndex}/100</span>
                    </div>

                    <div className="grid grid-cols-3 border-b border-slate-800/40 py-1">
                      <span className="text-slate-500">Eco Rating</span>
                      <span className="font-bold text-emerald-400">{selectedRegion.sustainabilityRating}</span>
                      <span className="font-bold text-amber-400">{comparisonRegion.sustainabilityRating}</span>
                    </div>
                  </div>

                  <button
                    id="clear-comp-target"
                    onClick={() => setComparisonRegion(null)}
                    className="mt-1 text-[10px] text-slate-500 hover:text-amber-400 flex items-center gap-1 font-mono transition-colors"
                  >
                    ← Deselect comparison location
                  </button>
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-display flex items-center gap-1.5">
                    <Trees className="w-3.5 h-3.5" /> Regional Telemetries & Highlights
                  </h4>
                  <p className="text-[11.5px] text-slate-400 mt-1 mb-4">
                    Active observations derived from our localized ground stations and satellite indicators:
                  </p>
                  <ul className="space-y-3.5">
                    {selectedRegion.highlights.map((highlight, index) => (
                      <li key={index} className="flex gap-2 text-xs leading-relaxed text-slate-300">
                        <span className="flex items-center justify-center bg-emerald-500/10 text-emerald-400 text-[10.5px] rounded-full w-5 h-5 font-mono font-bold shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-200">{highlight}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`p-8 rounded-2xl text-center border border-dashed border-emerald-500/20 ${
            isDark ? "bg-slate-900/10 text-slate-400" : "bg-slate-50 text-slate-600"
          }`}>
            <Compass className="w-8 h-8 text-slate-500 mx-auto mb-2 animate-pulse" />
            <h3 className="font-semibold text-sm">Select an environmental station node</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Click on any location marked on the vector map or search above to load real-time telemetries, climate scorecards, migration paths, and risk dashboards.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
