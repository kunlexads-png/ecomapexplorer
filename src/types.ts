export interface EnvironmentalMetrics {
  aqi: number; // 0 - 500
  waterQuality: number; // 0 - 100%
  forestCoverage: number; // 0 - 100%
  carbonEmissions: number; // tonnes per capita annually
  biodiversityIndex: number; // 0 - 100
  renewablePotential: number; // 0 - 100%
  climateRisk: "Low" | "Moderate" | "High" | "Extreme";
  temperatureAnomaly: number; // degrees C change
}

export interface Region {
  id: string;
  name: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
    x: number; // svg x coordinate percentage for our custom map
    y: number; // svg y coordinate percentage for our custom map
  };
  metrics: EnvironmentalMetrics;
  ecosystemType: string;
  sustainabilityRating: "A" | "B" | "C" | "D" | "F";
  population: string;
  highlights: string[];
}

export interface SavedLocation {
  id: string;
  regionId: string;
  notes?: string;
  savedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface EnvironmentalAlert {
  id: string;
  regionId: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "danger";
  category: "Air Quality" | "Wildfire Indicator" | "Water Advisory" | "Ecosystem Warning";
  date: string;
}

export interface WildlifeRoute {
  id: string;
  species: string;
  type: "Avian" | "Marine" | "Terrestrial";
  startLoc: string;
  endLoc: string;
  description: string;
  populationStatus: "Stable" | "Vulnerable" | "Endangered";
  coordinates: { x: number; y: number }[]; // coordinates on svg path
}

export interface UserProfile {
  name: string;
  email: string;
  joinedDate: string;
  targetCarbonFootprint: number; // tons CO2e per year
  currentFootprintCalc: number | null;
  alertSubscriptions: string[];
  themeMode: "light" | "dark";
}

export interface CarbonCalculatorInput {
  transport: string;
  electricity: number;
  diet: string;
  recycling: string;
  heating: string;
}
