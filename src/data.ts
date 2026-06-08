import { Region, EnvironmentalAlert, WildlifeRoute, UserProfile } from "./types";

export const REGIONS: Region[] = [
  {
    id: "scandia",
    name: "Scandinavian Cleantech Zone",
    country: "Norway / Sweden border",
    coordinates: { lat: 62.0, lng: 11.0, x: 52, y: 18 },
    metrics: {
      aqi: 14,
      waterQuality: 96,
      forestCoverage: 74,
      carbonEmissions: 2.1,
      biodiversityIndex: 82,
      renewablePotential: 94,
      climateRisk: "Low",
      temperatureAnomaly: 0.6
    },
    ecosystemType: "Boreal Forest & Highlands",
    sustainabilityRating: "A",
    population: "3.2M",
    highlights: ["Powered 98% by hydropower & wind energy assets", "Excellent carbon sequestration rate", "Pristine water source preservation"]
  },
  {
    id: "amazon",
    name: "Amazonian Rainforest Biosphere",
    country: "Brazil (Pará Province)",
    coordinates: { lat: -3.5, lng: -60.0, x: 28, y: 64 },
    metrics: {
      aqi: 22,
      waterQuality: 88,
      forestCoverage: 89,
      carbonEmissions: 1.4,
      biodiversityIndex: 98,
      renewablePotential: 70,
      climateRisk: "High",
      temperatureAnomaly: 1.1
    },
    ecosystemType: "Tropical Rainforest",
    sustainabilityRating: "B",
    population: "850K",
    highlights: ["Contains 10% of the world's known species", "High vulnerability to seasonal illegal logging", "Crucial global moisture cooling sink"]
  },
  {
    id: "indoganga",
    name: "Indo-Gangetic Industrial Basin",
    country: "Northern India / Punjab",
    coordinates: { lat: 28.6, lng: 77.2, x: 71, y: 44 },
    metrics: {
      aqi: 182,
      waterQuality: 44,
      forestCoverage: 11,
      carbonEmissions: 4.8,
      biodiversityIndex: 43,
      renewablePotential: 62,
      climateRisk: "Extreme",
      temperatureAnomaly: 1.4
    },
    ecosystemType: "Alluvial plains & Urban Corridor",
    sustainabilityRating: "D",
    population: "52M",
    highlights: ["Swells of seasonal paragliding slash-and-burn dust", "Sinking water tables in domestic groundwater wells", "Aggressive solar field expansion underway"]
  },
  {
    id: "barrier-reef",
    name: "Great Barrier Reef Reserve",
    country: "Queensland, Australia",
    coordinates: { lat: -18.2, lng: 147.4, x: 91, y: 78 },
    metrics: {
      aqi: 8,
      waterQuality: 85,
      forestCoverage: 5, // mainly marine
      carbonEmissions: 4.5,
      biodiversityIndex: 92,
      renewablePotential: 80,
      climateRisk: "Extreme",
      temperatureAnomaly: 1.8
    },
    ecosystemType: "Coral Reef Marine Ecosystem",
    sustainabilityRating: "C",
    population: "120K (Coastal)",
    highlights: ["Suffering periodic marine heatwaves and coral bleaching", "Runoff agricultural nutrients are monitored on beaches", "Strict marine vessel speed limit enforced"]
  },
  {
    id: "sahel-green",
    name: "Sahelian Great Green Wall",
    country: "Senegal / Mali Transition",
    coordinates: { lat: 15.0, lng: -12.0, x: 44, y: 52 },
    metrics: {
      aqi: 58,
      waterQuality: 56,
      forestCoverage: 22, // Growing due to initiatives
      carbonEmissions: 0.6,
      biodiversityIndex: 51,
      renewablePotential: 88,
      climateRisk: "High",
      temperatureAnomaly: 1.3
    },
    ecosystemType: "Arid Savanna & Reclaimed Scrublands",
    sustainabilityRating: "C",
    population: "1.8M",
    highlights: ["Active reforestation planting native Acacia senegal", "High solar photovoltaic generation potential", "Mitigating Saharan sand erosion via agroforestry barriers"]
  },
  {
    id: "pacific-garbage",
    name: "Eastern Pacific Marine Boundary",
    country: "International Waters",
    coordinates: { lat: 35.0, lng: -140.0, x: 12, y: 40 },
    metrics: {
      aqi: 5,
      waterQuality: 26, // heavily polluted with plastics
      forestCoverage: 0,
      carbonEmissions: 0.1, // ocean transport ships
      biodiversityIndex: 31,
      renewablePotential: 45,
      climateRisk: "Extreme",
      temperatureAnomaly: 0.9
    },
    ecosystemType: "Pelagic Marine Zone",
    sustainabilityRating: "F",
    population: "0",
    highlights: ["Host to extreme concentration of floating microplastics", "Severe ingestion risk for oceanic sea-fowls and turtles", "Clearing expeditions ongoing by conservation fleets"]
  },
  {
    id: "sahara-solar",
    name: "Ouarzazate Renewable Solar Region",
    country: "Morocco",
    coordinates: { lat: 30.9, lng: -6.9, x: 46, y: 42 },
    metrics: {
      aqi: 45,
      waterQuality: 62,
      forestCoverage: 8,
      carbonEmissions: 1.8,
      biodiversityIndex: 38,
      renewablePotential: 98,
      climateRisk: "Moderate",
      temperatureAnomaly: 1.2
    },
    ecosystemType: "Desert Oasis & Dry Steppe",
    sustainabilityRating: "B",
    population: "140K",
    highlights: ["Boasts one of the largest concentrated solar power (CSP) facilities", "Minimal local carbon footprints", "High risk of seasonal dust storms"]
  }
];

export const ALERTS: EnvironmentalAlert[] = [
  {
    id: "alert-1",
    regionId: "indoganga",
    title: "Hazardous Fine Particulate Surge",
    message: "AQI levels peaked above 180 due to agricultural boundary smoke and manufacturing concentrations. Outdoor efforts should be limited.",
    severity: "danger",
    category: "Air Quality",
    date: "2026-05-28"
  },
  {
    id: "alert-2",
    regionId: "barrier-reef",
    title: "Marine Heatwave Marine Bleaching Threat",
    message: "Sustained temperature anomaly at +1.8°C above average triggers level 2 warming notices across shallow coral nodes.",
    severity: "warning",
    category: "Water Advisory",
    date: "2026-05-29"
  },
  {
    id: "alert-3",
    regionId: "amazon",
    title: "Illegal Timber Clearing Intercepted",
    message: "Satellite telemetry triggers automated alarms in south Pará state nodes, detailing rapid logging alerts.",
    severity: "warning",
    category: "Ecosystem Warning",
    date: "2026-05-25"
  },
  {
    id: "alert-4",
    regionId: "pacific-garbage",
    title: "Microplastic Spill Concentration Detected",
    message: "A major convergence of domestic synthetic debris flows has settled 100 miles nautical east. Clean vessels briefed.",
    severity: "info",
    category: "Water Advisory",
    date: "2026-05-27"
  }
];

export const WILDLIFE_ROUTES: WildlifeRoute[] = [
  {
    id: "avian-1",
    species: "Arctic Tern (Sterna paradisaea)",
    type: "Avian",
    startLoc: "Scandinavian Highlands",
    endLoc: "Sub-Saharan green belts",
    description: "The longest bird migration corridor globally. Changes in moisture zones affect critical coastal feeding marshes.",
    populationStatus: "Vulnerable",
    coordinates: [
      { x: 52, y: 18 },
      { x: 46, y: 42 },
      { x: 44, y: 52 }
    ]
  },
  {
    id: "marine-1",
    species: "Loggerhead Turtle (Caretta caretta)",
    type: "Marine",
    startLoc: "Great Barrier Reef coastal shelf",
    endLoc: "Pacific High-Debris boundary currents",
    description: "Juvenile turtles face extreme ocean current plastic encounters during their critical pelagic drift phase.",
    populationStatus: "Endangered",
    coordinates: [
      { x: 91, y: 78 },
      { x: 50, y: 60 },
      { x: 12, y: 40 }
    ]
  },
  {
    id: "terrestrial-1",
    species: "Jaguar (Panthera onca)",
    type: "Terrestrial",
    startLoc: "Central Amazon Reserves",
    endLoc: "Andean forest perimeter",
    description: "Crucial land wildlife pathways being dissected by illegal logging roads, requiring forest canopy bridge solutions.",
    populationStatus: "Vulnerable",
    coordinates: [
      { x: 28, y: 64 },
      { x: 24, y: 66 },
      { x: 22, y: 57 }
    ]
  }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Eco Guardian",
  email: "guest@ecomap.org",
  joinedDate: "May 2026",
  targetCarbonFootprint: 4.0, // target tons
  currentFootprintCalc: null,
  alertSubscriptions: ["Air Quality", "Water Advisory", "Ecosystem Warning"],
  themeMode: "dark"
};

export const RECENT_NEWS = [
  {
    id: "news-1",
    title: "Agroforestry projects expand by 35% in sub-Saharan reclaim sectors",
    source: "Global Forestry Initiative",
    relevance: "Great Green Wall",
    summary: "New satellite records suggest positive vegetation feedback loops and soil retention advances.",
    date: "2026-05-24"
  },
  {
    id: "news-2",
    title: "Hydroelectric storage efficiency sets records in Scandinavian rivers",
    source: "Clean Energy Review",
    relevance: "Scandinavian Cleantech Zone",
    summary: "Advanced turbine retrofits allow greater localized grid buffering while protecting salmon channels.",
    date: "2026-05-25"
  },
  {
    id: "news-3",
    title: "Autonomous ocean interceptor successfully extracts 12 tons of microplastic networks",
    source: "Sea Alliance Journals",
    relevance: "Pacific Garbage Patch Boundary",
    summary: "Leveraging direct oceanic swells, the passive clean system targets dense particulate belts safely.",
    date: "2026-05-28"
  }
];
export const SUSTAINABLE_TIP_TEMPLATES = [
  {
    category: "Energy",
    tip: "Transition indoor thermostats to climate smart mode (approx. 20°C in winter / 25°C in summer) to save upwards of 1.2 tonnes of carbon annually."
  },
  {
    category: "Waste",
    tip: "Avoid single-use container products and adopt home organic dry composting to mitigate household methane release."
  },
  {
    category: "Transport",
    tip: "Swap 1 local single-occupant car trip a week for dynamic biking or public electric transits to offset substantial direct footprints."
  },
  {
    category: "Diet",
    tip: "Shifting to plant-centric meals even 3 days a week decreases global biodiversity footprints from commercial clearing runs."
  }
];
