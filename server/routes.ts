import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { BalloonData, ConsolidatedBalloonData, WeatherData, DataQuality, weatherResponseSchema } from "@shared/schema";

const BALLOON_API_BASE = "https://a.windbornesystems.com/treasure";
const WEATHER_API_BASE = "https://api.open-meteo.com/v1/forecast";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get consolidated balloon data
  app.get("/api/balloons", async (req, res) => {
    try {
      // Check cache first
      let cachedData = await storage.getBalloonData();
      if (cachedData) {
        return res.json(cachedData);
      }

      // Fetch fresh data
      const consolidatedData = await fetchConsolidatedBalloonData();
      await storage.setBalloonData(consolidatedData);
      
      res.json(consolidatedData);
    } catch (error) {
      console.error("Error fetching balloon data:", error);
      res.status(500).json({ 
        error: "Failed to fetch balloon data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get weather data for specific coordinates
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);

      // Check cache first
      let cachedWeather = await storage.getWeatherData(latitude, longitude);
      if (cachedWeather) {
        return res.json(cachedWeather);
      }

      // Fetch fresh weather data
      const weatherData = await fetchWeatherData(latitude, longitude);
      await storage.setWeatherData(latitude, longitude, weatherData);
      
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ 
        error: "Failed to fetch weather data",
        message: error.message 
      });
    }
  });

  // Force refresh data
  app.post("/api/refresh", async (req, res) => {
    try {
      await storage.clearCache();
      const consolidatedData = await fetchConsolidatedBalloonData();
      await storage.setBalloonData(consolidatedData);
      
      res.json({ success: true, data: consolidatedData });
    } catch (error) {
      console.error("Error refreshing data:", error);
      res.status(500).json({ 
        error: "Failed to refresh data",
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function fetchConsolidatedBalloonData(): Promise<ConsolidatedBalloonData> {
  const balloons: BalloonData[] = [];
  const dataQuality: Record<string, DataQuality['status']> = {};
  
  // Fetch data from all 24 files (00.json through 23.json)
  const fetchPromises = Array.from({ length: 24 }, (_, i) => {
    const fileNumber = i.toString().padStart(2, '0');
    const fileName = `${fileNumber}.json`;
    return fetchBalloonFile(fileName, i);
  });

  const results = await Promise.allSettled(fetchPromises);
  
  results.forEach((result, index) => {
    const fileNumber = index.toString().padStart(2, '0');
    const fileName = `${fileNumber}.json`;
    
    if (result.status === 'fulfilled') {
      const { balloons: fileBalloons, quality } = result.value;
      balloons.push(...fileBalloons);
      dataQuality[fileName] = quality;
    } else {
      console.error(`Failed to fetch ${fileName}:`, result.reason);
      dataQuality[fileName] = 'error';
    }
  });

  return {
    balloons,
    totalCount: balloons.length,
    dataQuality,
    lastUpdated: new Date().toISOString(),
  };
}

async function fetchBalloonFile(fileName: string, hoursAgo: number): Promise<{ balloons: BalloonData[], quality: DataQuality['status'] }> {
  const url = `${BALLOON_API_BASE}/${fileName}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    
    if (!Array.isArray(rawData)) {
      throw new Error("Invalid data format: expected array");
    }

    const balloons: BalloonData[] = [];
    let validCount = 0;
    let totalCount = rawData.length;

    rawData.forEach((item, index) => {
      try {
        if (Array.isArray(item) && item.length >= 3) {
          const [lat, lon, alt] = item;
          
          if (typeof lat === 'number' && typeof lon === 'number' && typeof alt === 'number') {
            // Validate coordinates
            if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 && alt >= 0) {
              balloons.push({
                id: `${fileName}-${index}`,
                latitude: lat,
                longitude: lon,
                altitude: alt,
                timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
                hoursAgo,
                dataSource: fileName,
              });
              validCount++;
            }
          }
        }
      } catch (error) {
        // Skip corrupted individual records
        console.warn(`Skipping corrupted record ${index} in ${fileName}:`, error);
      }
    });

    // Determine data quality based on success rate
    let quality: DataQuality['status'];
    const successRate = validCount / totalCount;
    
    if (successRate >= 0.95) {
      quality = 'healthy';
    } else if (successRate >= 0.8) {
      quality = 'good';
    } else if (successRate >= 0.5) {
      quality = 'partial';
    } else {
      quality = 'error';
    }

    return { balloons, quality };
    
  } catch (error) {
    console.error(`Error fetching ${fileName}:`, error);
    return { balloons: [], quality: 'error' };
  }
}

async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const url = `${WEATHER_API_BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m&forecast_days=1`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    const parsedData = weatherResponseSchema.parse(rawData);
    
    return {
      latitude: lat,
      longitude: lon,
      temperature: parsedData.current.temperature_2m,
      windSpeed: parsedData.current.wind_speed_10m,
      windDirection: parsedData.current.wind_direction_10m,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}
