import React, { useState, useEffect } from "react";
import { REGIONS, ALERTS, RECENT_NEWS, DEFAULT_USER_PROFILE } from "./data";
import { Region, UserProfile, EnvironmentalAlert } from "./types";
import MapExplorer from "./components/MapExplorer";
import EnvironmentalDashboard from "./components/EnvironmentalDashboard";
import Reports from "./components/Reports";
import AIAssistant from "./components/AIAssistant";
import ProfileSettings from "./components/ProfileSettings";
import { 
  Globe, Trees, LayoutDashboard, FileText, Sparkles, User, 
  Settings, Mail, BookOpen, Bell, Menu, X, CheckSquare, 
  ArrowUpRight, Heart, HelpCircle, ChevronRight, Send, AlertTriangle, HelpCircle as HelpIcon 
} from "lucide-react";

export default function App() {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Shared application state
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(REGIONS[0]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  // Global Alerts Notification States
  const [showAlertBell, setShowAlertBell] = useState<boolean>(false);
  const [alertCenterOpen, setAlertCenterOpen] = useState<boolean>(false);

  // Interactive contact form states
  const [contactForm, setContactForm] = useState({ name: "", email: "", topic: "general", message: "" });
  const [contactSent, setContactSent] = useState<boolean>(false);

  // Subscribed alerts filter calculation
  const subscribedAlerts = ALERTS.filter(alert => 
    profile.alertSubscriptions.includes(alert.category)
  );

  useEffect(() => {
    // Synchronize profile theme preferences
    setIsDark(profile.themeMode === "dark");
  }, [profile.themeMode]);

  const handleSelectRegion = (region: Region) => {
    setSelectedRegion(region);
  };

  const handleToggleSave = (regionId: string) => {
    setSavedIds(prev => 
      prev.includes(regionId) ? prev.filter(id => id !== regionId) : [...prev, regionId]
    );
  };

  const handleRemoveFavorite = (regionId: string) => {
    setSavedIds(prev => prev.filter(id => id !== regionId));
  };

  const handleToggleTheme = () => {
    setProfile(prev => ({
      ...prev,
      themeMode: prev.themeMode === "dark" ? "light" : "dark"
    }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setContactForm({ name: "", email: "", topic: "general", message: "" });
    setTimeout(() => setContactSent(false), 5000);
  };

  return (
    <div id="ecomap-root-container" className={`min-h-screen text-sans transition-colors duration-300 font-sans ${
      isDark ? "bg-[#0b0f19] text-[#e2e8f0]" : "bg-slate-50 text-slate-800"
    }`}>
      
      {/* Primary Header Segment */}
      <header className={`sticky top-0 z-40 border-b select-none transition-colors duration-150 ${
        isDark ? "bg-[#0b0f19]/80 border-emerald-500/10 backdrop-blur-md" : "bg-white/85 border-slate-200 backdrop-blur-md"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center glow-emerald hover:scale-105 transition-all text-white">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h1 id="app-visual-logo-title" className="text-sm font-bold tracking-tight font-display text-emerald-400">
                EcoMap Explorer
              </h1>
              <span className="text-[9px] text-slate-500 font-mono tracking-widest block uppercase">PLANETARY INTEL</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-[11.5px] font-semibold">
            <button
              id="nav-home"
              onClick={() => setActiveTab("home")}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                activeTab === "home" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Dashboard Overview
            </button>
            <button
              id="nav-map"
              onClick={() => setActiveTab("map")}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                activeTab === "map" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Vector Map Explorer
            </button>
            <button
              id="nav-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                activeTab === "dashboard" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Telemetry Metrics
            </button>
            <button
              id="nav-reports"
              onClick={() => setActiveTab("reports")}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                activeTab === "reports" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Compliance Audits
            </button>
            <button
              id="nav-ai"
              onClick={() => setActiveTab("ai")}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                activeTab === "ai" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              AI Assistant (Advisory)
            </button>
          </nav>

          {/* Actions panel right */}
          <div className="flex items-center gap-3">
            
            {/* Alarm notifications center dropdown anchor */}
            <div className="relative">
              <button
                id="active-alarms-trigger"
                onClick={() => setAlertCenterOpen(prev => !prev)}
                className={`p-2 rounded-lg border relative transition-colors ${
                  subscribedAlerts.length > 0
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                    : isDark ? "border-slate-800 bg-slate-900 text-slate-400" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <Bell className="w-4 h-4 animate-pulse" />
                {subscribedAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400 badge-pulse"></span>
                )}
              </button>

              {/* Warnings dropdown modal panel */}
              {alertCenterOpen && (
                <div className={`absolute right-0 mt-3 w-80 rounded-2xl p-4 shadow-xl border z-50 ${
                  isDark ? "bg-[#0b0f19] border-emerald-500/20 text-white" : "bg-white border-slate-200 text-slate-800"
                }`}>
                  <div className="flex justify-between items-center border-b border-emerald-500/10 pb-2 mb-2">
                    <span className="text-xs font-bold text-emerald-400 font-display">Alert Notification Centre</span>
                    <button id="close-alerts-panel" onClick={() => setAlertCenterOpen(false)} className="text-[10px] text-slate-500 hover:text-slate-200">Close</button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {subscribedAlerts.length === 0 ? (
                      <p className="text-[10.5px] text-slate-500 text-center py-4 italic">No ecological threats triggered for your subscribed metric categories.</p>
                    ) : (
                      subscribedAlerts.map(alert => (
                        <div key={alert.id} className="p-2.5 rounded-lg border border-red-500/15 bg-red-950/20 text-[10px]">
                          <div className="flex justify-between items-center text-[9px] font-mono mb-1 text-slate-400">
                            <span>{alert.category}</span>
                            <span className="text-red-400 font-bold font-sans uppercase font-mono">{alert.severity}</span>
                          </div>
                          <span className="font-bold text-slate-200 block truncate">{alert.title}</span>
                          <span className="text-slate-400 block leading-normal mt-0.5">{alert.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile trigger */}
            <button
              id="profile-action-nav"
              onClick={() => setActiveTab("profile")}
              className={`p-2 rounded-lg border transition-colors ${
                activeTab === "profile" 
                  ? "bg-slate-800 border-slate-700 text-white" 
                  : isDark ? "border-slate-800 bg-slate-900 text-slate-400" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <User className="w-4 h-4" />
            </button>

            {/* Mobile menu controls */}
            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>
        </div>

        {/* Mobile slide open navbar drawer */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2 select-none">
            {["home", "map", "dashboard", "reports", "ai", "news", "about", "contact"].map(t => (
              <button
                id={`drawer-nav-${t}`}
                key={t}
                onClick={() => { setActiveTab(t); setMobileMenuOpen(false); }}
                className={`w-full py-2 px-3 text-left rounded-lg text-xs font-semibold capitalize ${
                  activeTab === t ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:bg-slate-900"
                }`}
              >
                {t === "home" ? "Dashboard Overview" : t === "map" ? "Vector Map Explorer" : t === "dashboard" ? "Telemetry Metrics" : t === "reports" ? "Compliance Audits" : t === "ai" ? "AI Assistant (Advisory)" : t}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Main core layout grid centering */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        
        {/* VIEW 1: HOME PAGE (Interactive Overview, Alerts list, News lists) */}
        {activeTab === "home" && (
          <div id="home-view-segment" className="space-y-6 animate-fade-in">
            
            {/* Ambient eco hero welcome header banner */}
            <div className={`p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-500/15 ${
              isDark ? "bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-slate-950" : "bg-emerald-50/50 border-emerald-500/30"
            }`}>
              <div className="z-10">
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">Planetary Intelligence Database</span>
                <h2 className="text-2xl font-display font-bold mt-1 text-slate-100">Welcome back, {profile.name}</h2>
                <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                  EcoMap Explorer supplies localized biosphere updates, air warnings, and artificial compliance generators covering major active research zones. Select and study region vectors.
                </p>
              </div>

              {/* Target footprint summaries banner */}
              <div className="shrink-0 p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Trees className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[9.5px] uppercase font-mono text-slate-500 block">Carbon Reduction Metric</span>
                  <span className="text-base font-bold text-emerald-400 font-display">{profile.targetCarbonFootprint} Tons / yr</span>
                </div>
              </div>
            </div>

            {/* Action Ticker / Navigation Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Highlight Region CARD */}
              <div className={`p-5 rounded-2xl flex flex-col justify-between ${
                isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
              }`}>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-display mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> High-Density Station
                  </h3>
                  <span className="text-lg font-bold block text-slate-200 mt-1">{selectedRegion?.name}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">{selectedRegion?.country} • Rating: {selectedRegion?.sustainabilityRating}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    id="goto-map-explorer-btn"
                    onClick={() => setActiveTab("map")}
                    className="py-1.5 px-3 block w-full rounded-lg text-center bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 text-xs transition-all font-semibold"
                  >
                    Load Map Spatial Explorer
                  </button>
                </div>
              </div>

              {/* Subscribed Warning Tickers */}
              <div className={`p-5 rounded-2xl flex flex-col justify-between ${
                isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
              }`}>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500 font-display mb-1 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5" /> Triggered Warnings ({subscribedAlerts.length})
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 mb-3">Monitoring events match your profiles categories:</p>
                </div>

                <div className="space-y-1">
                  {subscribedAlerts.slice(0, 2).map((alert, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] py-1 border-b border-slate-900 text-slate-300">
                      <span className="truncate max-w-[170px]">{alert.title}</span>
                      <span className="text-red-400 font-mono text-[8px] uppercase">{alert.category.split(" ")[0]}</span>
                    </div>
                  ))}
                  {subscribedAlerts.length === 0 && <span className="text-[10px] text-slate-500 italic block py-2">All indicators safe today.</span>}
                </div>
              </div>

              {/* Eco-AI advisory entry card */}
              <div className={`p-5 rounded-2xl flex flex-col justify-between ${
                isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
              }`}>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-display mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Environmental AI Help
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 mb-3">Confer with full-stack models to plan zero-carbon offsets.</p>
                </div>

                <button
                  id="nav-chat-quick-btn"
                  onClick={() => setActiveTab("ai")}
                  className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-all"
                >
                  Confer with AI Assistant
                </button>
              </div>

            </div>

            {/* Climate columns (News & Reports) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Climate news column panel */}
              <div className={`p-5 rounded-2xl lg:col-span-2 ${
                isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
              }`}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-display mb-1 flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> Global Clean-Tech Columns
                </h3>
                <p className="text-[11px] text-slate-400 mb-4">Latest advancements covering forestry targets and waste extraction initiatives.</p>

                <div className="space-y-4">
                  {RECENT_NEWS.map(news => (
                    <div id={`news-item-${news.id}`} key={news.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                      <div className="flex justify-between items-center text-[9px] font-mono mb-1 text-slate-500">
                        <span>{news.source}</span>
                        <span>{news.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 hover:text-emerald-400 transition-colors pointer-events-none">{news.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">{news.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informative Sustainable Framework sidebar  */}
              <div className={`p-5 rounded-2xl flex flex-col justify-between ${
                isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
              }`}>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-display mb-2">
                    Action Framework
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    EcoMap Explorer aligns actions with localized planetary stability systems, supporting critical UN Development Indices:
                  </p>

                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex items-center gap-2.5 p-1.5 rounded bg-slate-950/40 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block shrink-0"></span>
                      <span>SDG 13: Accelerated Climate Action</span>
                    </div>

                    <div className="flex items-center gap-2.5 p-1.5 rounded bg-slate-950/40 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block shrink-0"></span>
                      <span>SDG 14: Life Under Oceanic Waves</span>
                    </div>

                    <div className="flex items-center gap-2.5 p-1.5 rounded bg-slate-950/40 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block shrink-0"></span>
                      <span>SDG 15: Preservation of Land Wildlife</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-850 flex justify-between text-xs text-[10px] text-slate-500 hover:text-emerald-400">
                  <button id="about-nav-quick" onClick={() => setActiveTab("about")} className="flex items-center gap-1 font-mono">
                    Study ESG parameters... <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: MAP EXPLORER PANEL */}
        {activeTab === "map" && (
          <div className="animate-fade-in">
            <MapExplorer
              selectedRegion={selectedRegion}
              onSelectRegion={handleSelectRegion}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
              isDark={isDark}
            />
          </div>
        )}

        {/* VIEW 3: ENVIRONMENTAL TELEMETRY DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="animate-fade-in">
            <EnvironmentalDashboard
              selectedRegion={selectedRegion}
              onSelectRegion={handleSelectRegion}
              isDark={isDark}
            />
          </div>
        )}

        {/* VIEW 4: ECO COMPLIANCE AUDITS & REPORTS */}
        {activeTab === "reports" && (
          <div className="animate-fade-in">
            <Reports
              selectedRegion={selectedRegion}
              onSelectRegion={handleSelectRegion}
              isDark={isDark}
            />
          </div>
        )}

        {/* VIEW 5: AI CHAT COMPANION */}
        {activeTab === "ai" && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <AIAssistant isDark={isDark} />
          </div>
        )}

        {/* VIEW 6: NEWS & ALERTS FEED */}
        {activeTab === "news" && (
          <div id="alerts-news-full-feed-view" className="space-y-6 animate-fade-in">
            <div className={`p-5 rounded-2xl ${
              isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
            }`}>
              <h2 className="text-base font-display font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                <Bell className="w-4 h-4 text-amber-500 animate-pulse" /> Environmental Advisory Notifications
              </h2>
              <p className="text-xs text-slate-400 mb-4 font-sans">Active planetary stress events and warning flags recorded by global nodes.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans mb-6">
                {ALERTS.map(alert => (
                  <div id={`feed-alert-${alert.id}`} key={alert.id} className="p-3.5 bg-slate-900/40 rounded-xl border border-rose-500/15">
                    <div className="flex justify-between items-center text-[9px] font-mono mb-1.5 text-slate-400">
                      <span>{alert.category} • {alert.date}</span>
                      <span className="text-red-400 font-bold uppercase">{alert.severity}</span>
                    </div>
                    <h4 className="font-bold text-slate-100">{alert.title}</h4>
                    <p className="text-slate-400 mt-1 leading-normal">{alert.message}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-base font-display font-semibold text-emerald-400 mb-1 flex items-center gap-1.5 pt-4 border-t border-slate-900">
                <BookOpen className="w-4 h-4 text-emerald-300" /> Complete Ecological Columns
              </h2>
              <p className="text-xs text-slate-400 mb-4 font-sans">Learn about structural tree planting and synthetic packaging recovery initiatives.</p>

              <div className="space-y-4 text-xs font-sans">
                {RECENT_NEWS.map(news => (
                  <div key={news.id} className="p-4 bg-slate-900/20 rounded-xl border border-slate-850">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mb-1">
                      <span>Source: {news.source} • Reference: {news.relevance}</span>
                      <span>Published: {news.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-200">{news.title}</h4>
                    <p className="text-slate-400 mt-1 leading-relaxed">{news.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: ESG ABOUT SECTION */}
        {activeTab === "about" && (
          <div id="about-view-segment" className="max-w-3xl mx-auto space-y-6 animate-fade-in font-sans">
            <div className={`p-6 rounded-2xl ${
              isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
            }`}>
              <h2 className="text-lg font-display font-semibold text-emerald-400 mb-2">About EcoMap Explorer</h2>
              <p className="text-xs leading-relaxed text-slate-300 mb-4">
                EcoMap Explorer is a high-fidelity environmental telemetry monitor built to empower sustainability researchers, ecological organizations, and citizens with accurate, actionable climate data.
              </p>
              
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono mb-2">Mission Objectives</h3>
              <ul className="space-y-3 text-xs text-slate-400 mb-6">
                <li className="flex gap-2">
                  <span className="font-mono text-emerald-400 font-bold shrink-0">✔</span>
                  <span><strong>Accessible Data Integration:</strong> Consolidating forestry, atmospheric AQI, microplastic levels, and carbon index variables.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-emerald-400 font-bold shrink-0">✔</span>
                  <span><strong>Actionable AI Advice:</strong> Delivering automated reduction suggestions and structural compliance audits safely using LLM capabilities.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-emerald-400 font-bold shrink-0">✔</span>
                  <span><strong>Action Tracking:</strong> Allowing observers to define targets, subscribers, and track compliance indices dynamically.</span>
                </li>
              </ul>

              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono mb-2">Thematic Frameworks</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our calculations leverage standards set by the IPCC Climate Advisory Panels and the global Ecological Footprint Networks, translating raw environmental variables into the simplified integrated Health Index shown across stations.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 8: ADVOCACY CONTACT FORM */}
        {activeTab === "contact" && (
          <div id="contact-view-segment" className="max-w-xl mx-auto animate-fade-in">
            <div className={`p-6 rounded-2xl ${
              isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
            }`}>
              <h2 className="text-lg font-display font-semibold text-emerald-400 mb-1 flex items-center gap-1.5 text-emerald-4000">
                <Mail className="w-4 h-4 text-emerald-400" /> Eco-Advocacy Contact
              </h2>
              <p className="text-xs text-slate-400 mb-4 font-sans">Reach out to share data updates, report logging violations, or coordinate local tree initiatives.</p>

              {contactSent ? (
                <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-950/15 text-xs text-center flex flex-col items-center gap-2 text-slate-200">
                  <CheckSquare className="w-6 h-6 text-emerald-400 animate-pulse" />
                  <span className="font-bold text-emerald-400">Message Dispatched!</span>
                  <span>Thank you for your active participation in global stabilization efforts. Our eco support reviews columns safely.</span>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-sans">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-slate-400">Your Full Name</label>
                    <input
                      id="contact-name-field"
                      type="text"
                      className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                        isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                      }`}
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-slate-400">Email Address</label>
                    <input
                      id="contact-email-field"
                      type="email"
                      className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                        isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                      }`}
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-slate-400">Inquiry Topic</label>
                    <select
                      id="contact-topic-field"
                      className={`py-2 px-3 rounded-lg border focus:outline-none ${
                        isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                      }`}
                      value={contactForm.topic}
                      onChange={(e) => setContactForm({ ...contactForm, topic: e.target.value })}
                    >
                      <option value="general">Tree-planting Coordination</option>
                      <option value="log-violation">Reporting Logging Violations</option>
                      <option value="data-sync">Inquire for Telemetry Integration</option>
                      <option value="press">Academic Press / Inquiry</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono text-slate-400">Brief Message Core</label>
                    <textarea
                      id="contact-msg-field"
                      rows={4}
                      className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                        isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                      }`}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    id="submit-contact-form"
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold text-white transition-all flex items-center justify-center gap-1.5 glow-emerald"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    Dispatch Eco-Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* VIEW 9: USER PROFILE / CONFIG PANEL */}
        {activeTab === "profile" && (
          <div className="animate-fade-in">
            <ProfileSettings
              profile={profile}
              setProfile={setProfile}
              savedIds={savedIds}
              onRemoveFavorite={handleRemoveFavorite}
              isDark={isDark}
              onToggleTheme={handleToggleTheme}
            />
          </div>
        )}

      </main>

      {/* Footer footer labels */}
      <footer className={`border-t select-none py-6 transition-colors duration-150 ${
        isDark ? "bg-[#0a0d16] border-slate-900 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-500"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase">EcoMap Explorer Protocol</span>
          </div>

          <div className="text-[10px] font-mono flex items-center gap-3">
            <button id="foot-home" onClick={() => setActiveTab("home")} className="hover:text-emerald-400">Dashboard</button>
            <span>•</span>
            <button id="foot-about" onClick={() => setActiveTab("about")} className="hover:text-emerald-400">SDG Goals</button>
            <span>•</span>
            <button id="foot-news" onClick={() => setActiveTab("news")} className="hover:text-emerald-400">Advisory Feed</button>
            <span>•</span>
            <button id="foot-contact" onClick={() => setActiveTab("contact")} className="hover:text-emerald-400">Support Advocacy</button>
          </div>

          <p className="text-[9.5px]">Developed globally inside AI Workspace. Operating Telemetry: Norway Base Nord.</p>
        </div>
      </footer>

    </div>
  );
}
