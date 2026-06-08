import React, { useState } from "react";
import { REGIONS } from "../data";
import { Region, UserProfile } from "../types";
import { 
  User, Settings as SettingsIcon, Heart, Goal, ShieldAlert, 
  MapPin, LogOut, Save, BadgeAlert, Sun, Moon 
} from "lucide-react";

interface ProfileSettingsProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  savedIds: string[];
  onRemoveFavorite: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function ProfileSettings({
  profile,
  setProfile,
  savedIds,
  onRemoveFavorite,
  isDark,
  onToggleTheme
}: ProfileSettingsProps) {
  const [nameInput, setNameInput] = useState<string>(profile.name);
  const [emailInput, setEmailInput] = useState<string>(profile.email);
  const [carbonGoal, setCarbonGoal] = useState<number>(profile.targetCarbonFootprint);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name: nameInput,
      email: emailInput,
      targetCarbonFootprint: carbonGoal
    }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleToggleSub = (sub: string) => {
    setProfile(prev => {
      const active = prev.alertSubscriptions.includes(sub)
        ? prev.alertSubscriptions.filter(s => s !== sub)
        : [...prev.alertSubscriptions, sub];
      return { ...prev, alertSubscriptions: active };
    });
  };

  return (
    <div id="user-profile-settings-panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Column Left: Profile Avatar CARD */}
      <div className="flex flex-col gap-6">
        
        <div className={`p-5 rounded-2xl text-center relative ${
          isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
        }`}>
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 border-2 border-emerald-500/25 flex items-center justify-center bg-emerald-950/20 text-emerald-400">
            <User className="w-10 h-10" />
          </div>

          <h3 className="text-base font-display font-bold text-emerald-400">{profile.name}</h3>
          <p className="text-xs text-slate-400 mb-4">{profile.email}</p>
          <div className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono py-1 px-2.5 rounded-full inline-block">
            Eco-Advocate Level 3
          </div>

          <div className="border-t border-slate-800/40 mt-5 pt-4 grid grid-cols-2 text-center text-xs">
            <div className="border-r border-slate-800/40">
              <span className="text-[10.5px] font-bold text-slate-300 block">Carbon Target</span>
              <span className="text-emerald-400 font-bold font-mono">{profile.targetCarbonFootprint} tonnes</span>
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-slate-300 block">Saved Spots</span>
              <span className="text-cyan-400 font-bold font-mono">{savedIds.length} stations</span>
            </div>
          </div>
        </div>

        {/* Global Sustainable Goal Tracking */}
        <div className={`p-5 rounded-2xl ${
          isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
        }`}>
          <h3 className="text-sm font-display font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
            <Goal className="w-4 h-4 text-emerald-400" />
            Active Green Milestones
          </h3>
          <p className="text-[10.5px] text-slate-400 mb-3 leading-relaxed">
            Progress against global conservation goals:
          </p>

          <div className="space-y-3 font-sans text-xs">
            <div>
              <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                <span>Direct Transportation Offsets</span>
                <span className="text-emerald-400 font-bold">1.2/3.0 Tons CO2e</span>
              </div>
              <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                <span>Green Power Substitution Plan</span>
                <span className="text-emerald-400 font-bold">85% Compliant</span>
              </div>
              <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>

            <p className="text-[9.5px] text-slate-500 italic">
              * Milestones feed global benchmark statistics directly. Set high carbon threshold alarms under Settings.
            </p>
          </div>
        </div>

      </div>

      {/* Column Right: Settings, Saved Favorite stations and Profiles Forms */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Profile Update Details */}
        <form onSubmit={handleSaveProfile} className={`p-6 rounded-2xl flex flex-col justify-between ${
          isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
        }`}>
          <div>
            <h3 className="text-sm font-display font-semibold text-emerald-400 flex items-center gap-1.5 mb-4">
              <SettingsIcon className="w-4 h-4 text-emerald-400" />
              1. Profile Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono text-slate-400">Full Name</label>
                <input
                  id="profile-name-input"
                  type="text"
                  className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                    isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                  }`}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono text-slate-400">Email Address (Advocacy registration)</label>
                <input
                  id="profile-email-input"
                  type="email"
                  className={`py-2 px-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                    isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                  }`}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
                  <span>Carbon Reduction Goal ({carbonGoal} Tons)</span>
                  <span className="text-emerald-400 font-bold font-display">Target Average: 4.0 tons</span>
                </div>
                <input
                  id="profile-carbon-slider"
                  type="range"
                  min="1.0"
                  max="12.0"
                  step="0.5"
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  value={carbonGoal}
                  onChange={(e) => setCarbonGoal(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-2">
            <span className="text-[10px] text-slate-400 italic">★ Verification tokens active. Change theme:</span>
            
            <div className="flex items-center gap-3">
              {/* Theme change toggle */}
              <button
                id="toggle-theme-mode"
                type="button"
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg border border-slate-800/85 hover:bg-slate-900 transition-colors text-slate-400 hover:text-emerald-400"
                title="Toggle Light/Dark Theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              <button
                id="save-profile-btn"
                type="submit"
                className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 transition-all font-semibold rounded-lg text-white font-sans flex items-center gap-1 bg-emerald-500"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaved ? "Saved Profile!" : "Save Profile"}
              </button>
            </div>
          </div>
        </form>

        {/* Saved Pinpoints list */}
        <div className={`p-6 rounded-2xl ${
          isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
        }`}>
          <h3 className="text-sm font-display font-semibold text-emerald-400 flex items-center gap-1.5 mb-3">
            <Heart className="w-4 h-4 text-rose-500" />
            2. Verified Favorites ({savedIds.length})
          </h3>
          
          {savedIds.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 selection:bg-rose-500/10">
              No saved stations. Navigate to Map Explorer to trigger bookmarks on active regions.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
              {REGIONS.filter(region => savedIds.includes(region.id)).map(region => (
                <div 
                  id={`favorite-item-${region.id}`}
                  key={region.id}
                  className="p-3 bg-slate-900/40 rounded-xl border border-slate-850 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">{region.name}</span>
                    <span className="text-[10px] text-slate-500">{region.country}</span>
                  </div>
                  <button
                    id={`remove-favorite-${region.id}`}
                    onClick={() => onRemoveFavorite(region.id)}
                    className="text-rose-400 hover:text-rose-300 font-mono hover:scale-105 transition-all p-1 text-[10px]"
                  >
                    Delete Pin
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription alarms options */}
        <div className={`p-6 rounded-2xl ${
          isDark ? "glass-panel text-white" : "glass-panel-light text-slate-800"
        }`}>
          <h3 className="text-sm font-display font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            3. Alert Subscriptions & Air Warning Thresholds
          </h3>
          <p className="text-[10.5px] text-slate-400 mb-4 font-sans">Toggle automated global warning flags in your notifications panel.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[10px]">
            <button
              id="sub-aqi"
              onClick={() => handleToggleSub("Air Quality")}
              className={`py-2 px-3 rounded-lg border text-center transition-all ${
                profile.alertSubscriptions.includes("Air Quality")
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-transparent border-slate-850 text-slate-500"
              }`}
            >
              Air Quality Limits
            </button>
            <button
              id="sub-wildfires"
              onClick={() => handleToggleSub("Wildfire Indicator")}
              className={`py-2 px-3 rounded-lg border text-center transition-all ${
                profile.alertSubscriptions.includes("Wildfire Indicator")
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-transparent border-slate-850 text-slate-500"
              }`}
            >
              Wildfires Warnings
            </button>
            <button
              id="sub-water"
              onClick={() => handleToggleSub("Water Advisory")}
              className={`py-2 px-3 rounded-lg border text-center transition-all ${
                profile.alertSubscriptions.includes("Water Advisory")
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-transparent border-slate-850 text-slate-500"
              }`}
            >
              Water Advisories
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
