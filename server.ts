import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini SDK with telemetry headers
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// API route: Q&A Chatbot
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Format chat models
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: `You are the EcoMap AI Environmental Assistant, an elite environmental intelligence advisor.
Answer questions concisely, objectively, and professionally about ecosystems, climate change, biodiversity, air and water quality, renewable energy, and individual/corporate sustainability actions.
Use clear, scientific yet accessible formatting (Markdown) with no flowery wording. Deliver practical, highly actionable sustainability recommendations based on scientific consensus.`,
      },
    });

    res.json({ text: response.text || "I was unable to analyze that query. Please try again." });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate reply." });
  }
});

// API route: Environmental Intelligence Report
app.post("/api/gemini/report", async (req, res) => {
  try {
    const { regionName, metrics } = req.body;
    if (!regionName || !metrics) {
      return res.status(400).json({ error: "regionName and metrics are required" });
    }

    const prompt = `Generate a detailed Sustainability & Environmental Health Report for the region: "${regionName}".
Current environmental telemetry metrics for analysis:
- Air Quality Index (AQI): ${metrics.aqi} / 500 (lower is better, 0-50 Good, 51-100 Moderate, 101-150 Unhealthy for sensitive groups, 151+ Unhealthy)
- Water Quality Index: ${metrics.waterQuality}% (higher is better, 90-100% Excellent, 70-89% Good, 50-69% Fair, <50% Poor)
- Forest Canopy Coverage: ${metrics.forestCoverage}% of land area
- Carbon Emissions: ${metrics.carbonEmissions} tonnes per capita annually
- Biodiversity Index: ${metrics.biodiversityIndex}/100 (species density rating)
- Renewable Energy Potential: ${metrics.renewablePotential}% rating
- Climate Risk Level: ${metrics.climateRisk || "Moderate"}

Provide a structured, professional report containing:
1. Executive Summary - Brief overview of environmental health.
2. Atmospheric & Hydrological Health - Assessment of water index and air levels.
3. Biodiversity & Ecology Health - Analysis of forest canopy and biodiversity.
4. Anthropogenic Emissions & Green Potential - Evaluation of Carbon levels and renewable options.
5. Actionable Sustainability Blueprint - 3 highly strategic recommendations for improvement matching this data.

Format the output strictly in Markdown. Keep it direct, clean, and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ report: response.text || "Could not generate report." });
  } catch (error: any) {
    console.error("Gemini Report Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate report." });
  }
});

// API route: Natural Language Map Filter
app.post("/api/gemini/analyze-map", async (req, res) => {
  try {
    const { query, availableRegions } = req.body;
    if (!query || !availableRegions) {
      return res.status(400).json({ error: "query and availableRegions are required" });
    }

    const prompt = `The user is searching for environmental areas using natural language: "${query}".
Analyze the available monitoring regions below:
${JSON.stringify(availableRegions, null, 2)}

Determine:
1. Which region ('id') matches the user's criteria best? Consider environmental factors (e.g., "Show high forest cover" means max forestCoverage; "unhealthy air" means high AQI; "pristine environment" means high forest/water and low aqi; "renewable hotbeds" means high renewable potential).
2. A brief 1-sentence description explaining why this region fits.

Return must be strictly in JSON format with this structure (no markdown fences around it):
{
  "matchedRegionId": "string-id-or-null",
  "explanation": "Brief explanation of why it matched."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Map Analyze Error:", error);
    res.status(500).json({ error: "Failed to map search query context." });
  }
});

// API route: Carbon Footprint Calculator & Impact Assessment
app.post("/api/gemini/carbon-advisor", async (req, res) => {
  try {
    const { answers } = req.body; // Details about transport, energy, food diet, waste
    if (!answers) {
      return res.status(400).json({ error: "answers are required" });
    }

    const prompt = `Perform a carbon footprint impact assessment and provide personalized smart recommendations.
User data:
- Primary Transportation: ${answers.transport}
- Monthly Electricity Usage: ${answers.electricity} kWh
- General Diet: ${answers.diet}
- Recycling habits: ${answers.recycling}
- Heating source: ${answers.heating}

Calculate:
1. Estimated yearly carbon footprint in tons CO2e (provide a reliable scientific approximation based on inputs).
2. Comparison to the global average (approx 4.7 tons CO2e).
3. 3 personalized high-impact sustainability recommendations to reduce their target footprint.

Return the response strictly as a JSON object with this shape (no markdown fences):
{
  "footprint": 12.3,
  "comparisonText": "description of how they compare to average",
  "recommendations": [
    { "title": "...", "impact": "High/Med", "description": "..." },
    { "title": "...", "impact": "High/Med", "description": "..." },
    { "title": "...", "impact": "High/Med", "description": "..." }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse((response.text || "{}").trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Carbon Footprint Advisor Error:", error);
    res.status(500).json({ error: "Failed to analyze carbon score." });
  }
});

// Serve frontend client via Vite in development, or serve built assets in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoMap Explorer full-stack server operating on http://localhost:${PORT}`);
  });
}

start();
